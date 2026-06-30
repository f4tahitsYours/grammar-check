"""
Teacher API endpoints for dashboard, assignment management, and submission review.
"""

import logging
import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from supabase import create_client, Client

from backend.config import settings
from backend.dependencies import require_teacher
from backend.models.request import AssignmentCreateRequest, ReviewRequest
from backend.models.response import (
    UserPayload,
    DashboardResponse,
    DashboardItem,
    SubmissionDetailResponse,
    PendingReviewItem,
    RubricConfig,
)
from backend.services.scoring import calculate_total_score

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/teacher", tags=["teacher"])


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for database operations."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key or settings.supabase_key
    )


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    page: int = 1,
    limit: int = 20,
    student_id: Optional[str] = None,
    assignment_id: Optional[str] = None,
    rubric_status: Optional[str] = None,
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Get paginated dashboard of submissions with student info.
    Filters by teacher's school_id for security.
    All filters are optional.
    """
    supabase = get_supabase_client()
    
    # Get teacher's school_id
    teacher_result = supabase.table("users").select("school_id").eq(
        "id", current_user.user_id
    ).execute()
    
    if not teacher_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    teacher_school_id = teacher_result.data[0].get("school_id")
    
    # Build query with JOIN at DB level using Supabase syntax
    # Select submissions with student info and assignment info
    # Use explicit FK: users!submissions_student_id_fkey to get student data
    select_fields = (
        "id, student_id, assignment_id, score, grade, word_count, "
        "error_count, rubric_status, created_at, "
        "users!submissions_student_id_fkey!inner(name, school_id), "
        "assignments(title)"
    )
    
    # Start query
    query = supabase.table("submissions").select(select_fields, count="exact")
    
    # Filter by school_id (security) - only if teacher has school_id
    if teacher_school_id is not None:
        query = query.eq("users.school_id", teacher_school_id)
    
    # Apply optional filters
    if student_id:
        query = query.eq("student_id", student_id)
    
    if assignment_id:
        query = query.eq("assignment_id", assignment_id)
    
    if rubric_status:
        query = query.eq("rubric_status", rubric_status)
    
    # Order and paginate
    offset = (page - 1) * limit
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    # Execute query
    result = query.execute()
    
    total = result.count or 0
    
    items = [
        DashboardItem(
            submission_id=str(row["id"]),
            student_id=str(row["student_id"]),
            student_name=row["users"]["name"],
            assignment_id=str(row["assignment_id"]) if row.get("assignment_id") else None,
            assignment_title=row["assignments"]["title"] if row.get("assignments") else None,
            score=row["score"],
            grade=row["grade"],
            word_count=row["word_count"],
            error_count=row["error_count"],
            rubric_status=row["rubric_status"],
            created_at=row["created_at"],
        )
        for row in result.data
    ]
    
    return DashboardResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/submission/{submission_id}", response_model=SubmissionDetailResponse)
async def get_submission_detail(
    submission_id: str,
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Get full detail of a submission.
    Teacher can access any submission within their school (no ownership restriction).
    """
    supabase = get_supabase_client()
    
    # Get teacher's school_id
    teacher_result = supabase.table("users").select("school_id").eq(
        "id", current_user.user_id
    ).execute()
    
    if not teacher_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    teacher_school_id = teacher_result.data[0].get("school_id")
    
    # Get submission with student school check
    # Use explicit FK: users!submissions_student_id_fkey to get student data
    submission_result = supabase.table("submissions").select(
        "*, users!submissions_student_id_fkey!inner(school_id)"
    ).eq("id", submission_id).execute()
    
    if not submission_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    submission = submission_result.data[0]
    
    # Security check: verify same school (only if teacher has school_id)
    if teacher_school_id is not None:
        if submission["users"]["school_id"] != teacher_school_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )
    
    return SubmissionDetailResponse(
        id=str(submission["id"]),
        original_text=submission["original_text"],
        corrected_text=submission["corrected_text"],
        errors=submission["errors_json"],
        score=submission["score"],
        grade=submission["grade"],
        word_count=submission["word_count"],
        error_count=submission["error_count"],
        error_breakdown=submission["error_breakdown"],
        feedback=submission["feedback"],
        fallback_used=submission["fallback_used"],
        created_at=submission["created_at"],
        assignment_id=str(submission["assignment_id"]) if submission.get("assignment_id") else None,
        rubric_status=submission["rubric_status"],
        score_grammar=submission.get("score_grammar"),
        score_mechanics=submission.get("score_mechanics"),
        score_content=submission.get("score_content"),
        score_unity=submission.get("score_unity"),
        score_total=submission.get("score_total"),
        reviewed_at=submission.get("reviewed_at"),
    )


@router.get("/export")
async def export_submissions(
    student_id: Optional[str] = None,
    assignment_id: Optional[str] = None,
    rubric_status: Optional[str] = None,
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Export submissions as CSV using StreamingResponse with generator.
    MUST NOT load all rows into memory.
    """
    supabase = get_supabase_client()
    
    # Get teacher's school_id
    teacher_result = supabase.table("users").select("school_id").eq(
        "id", current_user.user_id
    ).execute()
    
    if not teacher_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    teacher_school_id = teacher_result.data[0].get("school_id")
    
    # Build query
    # Use explicit FK: users!submissions_student_id_fkey to get student data
    query = supabase.table("submissions").select(
        "id, student_id, users!submissions_student_id_fkey!inner(name, school_id), assignment_id, "
        "assignments(title), score, grade, word_count, error_count, "
        "rubric_status, score_grammar, score_mechanics, score_content, "
        "score_unity, score_total, created_at"
    )
    
    # Filter by school_id (security) - only if teacher has school_id
    if teacher_school_id is not None:
        query = query.eq("users.school_id", teacher_school_id)
    
    # Apply optional filters
    if student_id:
        query = query.eq("student_id", student_id)
    
    if assignment_id:
        query = query.eq("assignment_id", assignment_id)
    
    if rubric_status:
        query = query.eq("rubric_status", rubric_status)
    
    # Order by created_at DESC
    query = query.order("created_at", desc=True)
    
    # Generator function for streaming
    def generate_csv():
        # Write header
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "submission_id", "student_name", "assignment_title", "score", "grade",
            "word_count", "error_count", "rubric_status", "score_grammar",
            "score_mechanics", "score_content", "score_unity", "score_total",
            "created_at"
        ])
        yield output.getvalue()
        output.close()
        
        # Fetch and stream rows in batches
        batch_size = 100
        offset = 0
        
        while True:
            batch_result = query.range(offset, offset + batch_size - 1).execute()
            
            if not batch_result.data:
                break
            
            for row in batch_result.data:
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow([
                    str(row["id"]),
                    row["users"]["name"],
                    row["assignments"]["title"] if row.get("assignments") else "",
                    row["score"],
                    row["grade"],
                    row["word_count"],
                    row["error_count"],
                    row["rubric_status"],
                    row.get("score_grammar", ""),
                    row.get("score_mechanics", ""),
                    row.get("score_content", ""),
                    row.get("score_unity", ""),
                    row.get("score_total", ""),
                    row["created_at"],
                ])
                yield output.getvalue()
                output.close()
            
            if len(batch_result.data) < batch_size:
                break
            
            offset += batch_size
    
    return StreamingResponse(
        generate_csv(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=submissions.csv"}
    )


@router.get("/assignment")
async def get_assignments(
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Get all assignments created by the current teacher.
    Returns assignments with their rubrics.
    """
    supabase = get_supabase_client()
    
    # Get assignments with rubrics using explicit JOIN syntax
    result = supabase.table("assignments").select(
        "id, title, description, class_target, is_active, show_score, created_at, "
        "assignment_rubrics(id, grammar_weight, mechanics_weight, content_weight, unity_weight)"
    ).eq("teacher_id", current_user.user_id).order(
        "created_at", desc=True
    ).execute()
    
    # Transform data to match frontend expectations
    assignments = []
    for row in result.data:
        assignment = {
            "assignment_id": str(row["id"]),
            "id": str(row["id"]),
            "title": row["title"],
            "description": row["description"],
            "class_target": row["class_target"],
            "is_active": row.get("is_active", True),
            "show_score": row.get("show_score", False),
            "created_at": row["created_at"],
        }
        
        # Add rubric if exists
        assignment_rubrics = row.get("assignment_rubrics")
        
        # Debug logging
        logger.info(f"Assignment {row['id']}: assignment_rubrics type = {type(assignment_rubrics)}, value = {assignment_rubrics}")
        
        if assignment_rubrics:
            # Handle both list and single object
            if isinstance(assignment_rubrics, list):
                if len(assignment_rubrics) > 0:
                    rubric = assignment_rubrics[0]
                    assignment["rubric"] = {
                        "grammar_weight": rubric["grammar_weight"],
                        "mechanics_weight": rubric["mechanics_weight"],
                        "content_weight": rubric["content_weight"],
                        "unity_weight": rubric["unity_weight"],
                    }
                    logger.info(f"Assignment {row['id']}: Added rubric from list")
            elif isinstance(assignment_rubrics, dict):
                # Single object (not in array)
                assignment["rubric"] = {
                    "grammar_weight": assignment_rubrics["grammar_weight"],
                    "mechanics_weight": assignment_rubrics["mechanics_weight"],
                    "content_weight": assignment_rubrics["content_weight"],
                    "unity_weight": assignment_rubrics["unity_weight"],
                }
                logger.info(f"Assignment {row['id']}: Added rubric from dict")
        else:
            logger.info(f"Assignment {row['id']}: No rubric data")
        
        assignments.append(assignment)
    
    logger.info(
        f"Retrieved {len(assignments)} assignments for teacher_id={current_user.user_id}"
    )
    
    return {"data": assignments}


@router.post("/assignment")
async def create_assignment(
    request: AssignmentCreateRequest,
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Create a new assignment with optional rubric.
    """
    supabase = get_supabase_client()
    
    # Create assignment
    assignment_data = {
        "title": request.title,
        "description": request.description,
        "teacher_id": current_user.user_id,
        "class_target": request.class_target,
        "is_active": request.is_active,
        "show_score": request.show_score,
    }
    
    assignment_result = supabase.table("assignments").insert(assignment_data).execute()
    
    if not assignment_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create assignment"
        )
    
    assignment_id = assignment_result.data[0]["id"]
    
    # Create rubric if provided
    if request.rubric:
        rubric_data = {
            "assignment_id": assignment_id,
            "grammar_weight": request.rubric.grammar_weight,
            "mechanics_weight": request.rubric.mechanics_weight,
            "content_weight": request.rubric.content_weight,
            "unity_weight": request.rubric.unity_weight,
            "grading_scale": request.rubric.grading_scale,
        }
        
        rubric_result = supabase.table("assignment_rubrics").insert(rubric_data).execute()
        
        if not rubric_result.data:
            # Rollback assignment creation
            supabase.table("assignments").delete().eq("id", assignment_id).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create rubric"
            )
    
    logger.info(
        f"Assignment created: assignment_id={assignment_id}, "
        f"teacher_id={current_user.user_id}"
    )
    
    return {
        "assignment_id": str(assignment_id),
        "title": request.title,
        "class_target": request.class_target,
    }


@router.patch("/assignment/{assignment_id}")
async def update_assignment(
    assignment_id: str,
    request: AssignmentCreateRequest,
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Update an existing assignment.
    Only the teacher who created the assignment can update it.
    """
    supabase = get_supabase_client()
    
    # Check ownership
    assignment_result = supabase.table("assignments").select("teacher_id").eq(
        "id", assignment_id
    ).execute()
    
    if not assignment_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    assignment = assignment_result.data[0]
    
    if assignment["teacher_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own assignments"
        )
    
    # Update assignment
    update_data = {
        "title": request.title,
        "description": request.description,
        "class_target": request.class_target,
        "is_active": request.is_active,
        "show_score": request.show_score,
    }
    
    update_result = supabase.table("assignments").update(update_data).eq(
        "id", assignment_id
    ).execute()
    
    if not update_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update assignment"
        )
    
    # Update rubric if provided
    if request.rubric:
        rubric_data = {
            "grammar_weight": request.rubric.grammar_weight,
            "mechanics_weight": request.rubric.mechanics_weight,
            "content_weight": request.rubric.content_weight,
            "unity_weight": request.rubric.unity_weight,
            "grading_scale": request.rubric.grading_scale,
        }
        
        # Check if rubric exists
        rubric_check = supabase.table("assignment_rubrics").select("id").eq(
            "assignment_id", assignment_id
        ).execute()
        
        if rubric_check.data:
            # Update existing rubric
            supabase.table("assignment_rubrics").update(rubric_data).eq(
                "assignment_id", assignment_id
            ).execute()
        else:
            # Create new rubric
            rubric_data["assignment_id"] = assignment_id
            supabase.table("assignment_rubrics").insert(rubric_data).execute()
    
    logger.info(
        f"Assignment updated: assignment_id={assignment_id}, "
        f"teacher_id={current_user.user_id}"
    )
    
    return {
        "assignment_id": str(assignment_id),
        "title": request.title,
        "class_target": request.class_target,
    }


@router.get("/pending-reviews")
async def get_pending_reviews(
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Get list of submissions awaiting review.
    Ordered by created_at ASC (oldest first).
    """
    supabase = get_supabase_client()
    
    # Get teacher's school_id
    teacher_result = supabase.table("users").select("school_id").eq(
        "id", current_user.user_id
    ).execute()
    
    if not teacher_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found"
        )
    
    teacher_school_id = teacher_result.data[0].get("school_id")
    
    # Get pending submissions with JOIN
    # Use explicit FK: users!submissions_student_id_fkey to get student data
    query = supabase.table("submissions").select(
        "id, student_id, users!submissions_student_id_fkey!inner(name, school_id), assignment_id, "
        "assignments!inner(title), word_count, error_count, "
        "score_grammar, score_mechanics, created_at"
    ).eq(
        "rubric_status", "awaiting_review"
    )
    
    # Filter by school_id - only if teacher has school_id
    if teacher_school_id is not None:
        query = query.eq("users.school_id", teacher_school_id)
    
    result = query.order(
        "created_at", desc=False  # Oldest first
    ).execute()
    
    items = [
        PendingReviewItem(
            submission_id=str(row["id"]),
            student_id=str(row["student_id"]),
            student_name=row["users"]["name"],
            assignment_id=str(row["assignment_id"]),
            assignment_title=row["assignments"]["title"],
            word_count=row["word_count"],
            error_count=row["error_count"],
            score_grammar=row["score_grammar"],
            score_mechanics=row["score_mechanics"],
            created_at=row["created_at"],
        )
        for row in result.data
    ]
    
    return {"items": items, "total": len(items)}


@router.patch("/submission/{submission_id}/review")
async def review_submission(
    submission_id: str,
    request: ReviewRequest,
    current_user: UserPayload = Depends(require_teacher),
):
    """
    Review a submission by providing score_content and score_unity.
    Validates:
    - rubric_status != 'complete' (409 if already reviewed)
    - assignment.teacher_id == current_user.id (403 if not owner)
    - score_content and score_unity within rubric weights (422 if out of range)
    
    Calculates total score using calculate_total_score() from scoring.py.
    Updates submission in single atomic query.
    """
    supabase = get_supabase_client()
    
    # Step 1: Get submission data
    submission_result = supabase.table("submissions").select(
        "id, assignment_id, score_grammar, score_mechanics, rubric_status"
    ).eq("id", submission_id).execute()
    
    if not submission_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    submission = submission_result.data[0]
    
    # Check if already reviewed
    if submission["rubric_status"] == "complete":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Submission already reviewed"
        )
    
    # Step 2: Get assignment to check teacher ownership
    assignment_result = supabase.table("assignments").select(
        "teacher_id"
    ).eq("id", submission["assignment_id"]).execute()
    
    if not assignment_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    assignment = assignment_result.data[0]
    
    # Check ownership
    if assignment["teacher_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review submissions for your own assignments"
        )
    
    # Step 3: Get rubric for validation
    rubric_result = supabase.table("assignment_rubrics").select(
        "*"
    ).eq("assignment_id", submission["assignment_id"]).execute()
    
    if rubric_result.data:
        rubric = rubric_result.data[0]
    else:
        # Default rubric if assignment doesn't have one
        rubric = {
            "grammar_weight": 5,
            "mechanics_weight": 5,
            "content_weight": 5,
            "unity_weight": 5,
            "grading_scale": {"17": "A", "13": "B", "9": "C", "0": "D"}
        }
    
    # Validate scores against rubric weights
    if not (1 <= request.score_content <= rubric["content_weight"]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"score_content must be between 1 and {rubric['content_weight']}"
        )
    
    if not (1 <= request.score_unity <= rubric["unity_weight"]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"score_unity must be between 1 and {rubric['unity_weight']}"
        )
    
    # Calculate total score
    score_total, grade = calculate_total_score(
        score_grammar=submission["score_grammar"],
        score_mechanics=submission["score_mechanics"],
        score_content=request.score_content,
        score_unity=request.score_unity,
        grading_scale=rubric["grading_scale"],
    )
    
    # Update submission in single atomic query
    update_data = {
        "score_content": request.score_content,
        "score_unity": request.score_unity,
        "score_total": score_total,
        "score": score_total,  # Update main score field
        "grade": grade,  # Update main grade field
        "rubric_status": "complete",
        "reviewed_by": current_user.user_id,
        "reviewed_at": "now()",
    }
    
    update_result = supabase.table("submissions").update(update_data).eq(
        "id", submission_id
    ).execute()
    
    if not update_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update submission"
        )
    
    logger.info(
        f"Submission reviewed: submission_id={submission_id}, "
        f"teacher_id={current_user.user_id}, score_total={score_total}, grade={grade}"
    )
    
    return {
        "submission_id": str(submission_id),
        "score_content": request.score_content,
        "score_unity": request.score_unity,
        "score_total": score_total,
        "grade": grade,
        "rubric_status": "complete",
    }
