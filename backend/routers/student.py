"""
Student API endpoints for grammar checking and submission management.
"""

import logging
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from supabase import create_client, Client

from backend.config import settings
from backend.dependencies import require_student
from backend.models.request import SubmitRequest
from backend.models.response import (
    UserPayload,
    SubmitResponse,
    SubmissionListResponse,
    SubmissionListItem,
    SubmissionDetailResponse,
    StudentAssignmentListResponse,
    StudentAssignmentItem,
    AssignmentRubricInfo,
)
from backend.services.grammar.preprocessor import preprocess
from backend.services.grammar.pipeline import run_pipeline
from backend.services.scoring import calculate_score, calculate_rubric_score
from backend.services.metrics_recorder import record_pipeline_metric
from backend.services.poster import generate_poster
from backend.services.tts import generate_tts

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/student", tags=["student"])


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for database operations."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key or settings.supabase_key
    )


@router.post("/submit", response_model=SubmitResponse)
async def submit_text(
    request: SubmitRequest,
    background_tasks: BackgroundTasks,
    current_user: UserPayload = Depends(require_student),
):
    """
    Submit text for grammar checking.
    
    Supports two modes:
    - Mode A (Free Practice): assignment_id = None
    - Mode B (Assignment): assignment_id provided
    
    Restriction: One submission per student per assignment.
    """
    # Step 1: Preprocess text
    cleaned_text = preprocess(request.text)
    
    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Text is empty after preprocessing."
        )
    
    # Step 2: Count words
    words = cleaned_text.split()
    word_count = len(words)
    
    # Step 3: Validate word count
    if word_count < 20:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Text must be at least 20 words."
        )
    
    warning = None
    if word_count > 500:
        # Truncate to 500 words
        cleaned_text = " ".join(words[:500])
        word_count = 500
        warning = "Input truncated to 500 words."
    
    # Step 4: Check for duplicate submission (assignment mode only)
    # This runs BEFORE cache lookup to ensure assignment restriction is enforced
    if request.assignment_id is not None:
        supabase = get_supabase_client()
        
        # DEBUG LOGGING
        logger.info(f"[DUPLICATE CHECK] Checking for existing submission")
        logger.info(f"[DUPLICATE CHECK] student_id (user_id from JWT): {current_user.user_id}")
        logger.info(f"[DUPLICATE CHECK] assignment_id (from request): {request.assignment_id}")
        logger.info(f"[DUPLICATE CHECK] assignment_id (as string): {str(request.assignment_id)}")
        
        existing = supabase.table("submissions").select(
            "id"
        ).eq(
            "student_id", current_user.user_id
        ).eq(
            "assignment_id", str(request.assignment_id)
        ).execute()
        
        # DEBUG LOGGING
        logger.info(f"[DUPLICATE CHECK] Query returned: {existing.data}")
        logger.info(f"[DUPLICATE CHECK] Number of existing submissions found: {len(existing.data) if existing.data else 0}")
        
        if existing.data:
            logger.warning(f"[DUPLICATE CHECK] DUPLICATE DETECTED! Rejecting with 409")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already submitted for this assignment. Only one submission per assignment is allowed."
            )
        else:
            logger.info(f"[DUPLICATE CHECK] No duplicate found, proceeding with submission")
    
    # Step 5: Run pipeline (cache check happens inside)
    pipeline_result = await run_pipeline(cleaned_text)
    
    # Merge warning from pipeline if exists
    if pipeline_result.warning and warning:
        warning = f"{warning} {pipeline_result.warning}"
    elif pipeline_result.warning:
        warning = pipeline_result.warning
    
    # Step 6: Determine scoring mode
    if request.assignment_id is None:
        # MODE A — Free Practice
        score = pipeline_result.score
        grade = pipeline_result.grade
        score_grammar = None
        score_mechanics = None
        rubric_status = "auto_only"
    else:
        # MODE B — Assignment Submission
        # Convert errors back to NormalizedError objects for scoring
        from backend.models.response import NormalizedError
        errors = [
            NormalizedError(**e) if isinstance(e, dict) else e
            for e in pipeline_result.errors
        ]
        
        rubric_score = calculate_rubric_score(
            errors=errors,
            word_count=pipeline_result.word_count
        )
        score = 0  # Not final, waiting for teacher review
        grade = "-"  # Not final
        score_grammar = rubric_score.score_grammar
        score_mechanics = rubric_score.score_mechanics
        rubric_status = "awaiting_review"
    
    # Step 7: Save to submissions table
    supabase = get_supabase_client()
    
    submission_data = {
        "student_id": current_user.user_id,
        "assignment_id": str(request.assignment_id) if request.assignment_id else None,
        "original_text": request.text,
        "corrected_text": pipeline_result.corrected_text,
        "errors_json": pipeline_result.errors,
        "error_breakdown": pipeline_result.error_breakdown,
        "score": score,
        "grade": grade,
        "word_count": pipeline_result.word_count,
        "error_count": pipeline_result.error_count,
        "feedback": pipeline_result.feedback,
        "input_hash": "",  # Not needed for submission record
        "fallback_used": pipeline_result.fallback_used,
        "score_grammar": score_grammar,
        "score_mechanics": score_mechanics,
        "score_content": None,
        "score_unity": None,
        "score_total": None,
        "rubric_status": rubric_status,
        "reviewed_by": None,
        "reviewed_at": None,
    }
    
    result = supabase.table("submissions").insert(submission_data).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save submission"
        )
    
    submission_id = result.data[0]["id"]
    
    # Step 8: Record metrics in background
    background_tasks.add_task(
        record_pipeline_metric,
        source=pipeline_result.source,
        fallback_used=pipeline_result.fallback_used,
        word_count=pipeline_result.word_count,
        error_count=pipeline_result.error_count,
        score=score,
        user_id=current_user.user_id
    )
    
    # Step 9: Log submission
    logger.info(
        f"Submission created: submission_id={submission_id}, "
        f"user_id={current_user.user_id}, mode={'B' if request.assignment_id else 'A'}"
    )
    
    # Step 10: Check score visibility for assignment submissions
    score_hidden = False
    response_score = score
    response_grade = grade
    response_score_grammar = score_grammar
    response_score_mechanics = score_mechanics
    
    if request.assignment_id is not None:
        # Fetch assignment to check show_score
        assignment_result = supabase.table("assignments").select(
            "show_score"
        ).eq("id", str(request.assignment_id)).execute()
        
        if assignment_result.data:
            show_score = assignment_result.data[0].get("show_score", False)
            if not show_score:
                # Hide scores from student
                score_hidden = True
                response_score = None
                response_grade = None
                response_score_grammar = None
                response_score_mechanics = None
    
    # Step 11: Return response
    return SubmitResponse(
        submission_id=submission_id,
        source=pipeline_result.source,
        original_text=request.text,
        corrected_text=pipeline_result.corrected_text,
        errors=pipeline_result.errors,
        score=response_score,
        grade=response_grade,
        word_count=pipeline_result.word_count,
        error_count=pipeline_result.error_count,
        error_breakdown=pipeline_result.error_breakdown,
        feedback=pipeline_result.feedback,
        fallback_used=pipeline_result.fallback_used,
        warning=warning,
        rubric_status=rubric_status,
        score_grammar=response_score_grammar,
        score_mechanics=response_score_mechanics,
        score_hidden=score_hidden,
    )


@router.get("/submissions", response_model=SubmissionListResponse)
async def get_submissions(
    page: int = 1,
    limit: int = 20,
    current_user: UserPayload = Depends(require_student),
):
    """
    Get paginated list of student's submissions.
    Ordered by created_at DESC.
    """
    supabase = get_supabase_client()
    
    # Calculate offset
    offset = (page - 1) * limit
    
    # Get total count
    count_result = supabase.table("submissions").select(
        "id", count="exact"
    ).eq("student_id", current_user.user_id).execute()
    
    total = count_result.count or 0
    
    # Get paginated data
    result = supabase.table("submissions").select(
        "id, score, grade, word_count, error_count, created_at, original_text, "
        "assignment_id, rubric_status, score_grammar, score_mechanics, score_total, "
        "assignments(show_score, title)"
    ).eq(
        "student_id", current_user.user_id
    ).order(
        "created_at", desc=True
    ).range(offset, offset + limit - 1).execute()
    
    items = []
    for row in result.data:
        # Check score visibility
        score_hidden = False
        display_score = row["score"]
        display_grade = row["grade"]
        display_score_grammar = row.get("score_grammar")
        display_score_mechanics = row.get("score_mechanics")
        display_score_total = row.get("score_total")
        
        if row.get("assignment_id") and row.get("assignments"):
            show_score = row["assignments"].get("show_score", False)
            if not show_score:
                score_hidden = True
                display_score = None
                display_grade = None
                display_score_grammar = None
                display_score_mechanics = None
                display_score_total = None
        
        # Get assignment title if available
        assignment_title = None
        if row.get("assignments"):
            assignment_title = row["assignments"].get("title")
        
        # Get original text preview (first 100 characters)
        original_text = row.get("original_text", "")
        original_text_preview = original_text[:100] if original_text else None
        
        items.append(SubmissionListItem(
            id=str(row["id"]),
            score=display_score,
            grade=display_grade,
            word_count=row["word_count"],
            error_count=row["error_count"],
            created_at=row["created_at"],
            assignment_id=str(row["assignment_id"]) if row.get("assignment_id") else None,
            assignment_title=assignment_title,
            original_text_preview=original_text_preview,
            rubric_status=row["rubric_status"],
            score_grammar=display_score_grammar,
            score_mechanics=display_score_mechanics,
            score_total=display_score_total,
            score_hidden=score_hidden,
        ))
    
    return SubmissionListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/submission/{submission_id}", response_model=SubmissionDetailResponse)
async def get_submission_detail(
    submission_id: str,
    current_user: UserPayload = Depends(require_student),
):
    """
    Get full detail of a specific submission.
    Only accessible by the student who owns the submission.
    """
    supabase = get_supabase_client()
    
    result = supabase.table("submissions").select(
        "*, assignments(show_score)"
    ).eq(
        "id", submission_id
    ).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    submission = result.data[0]
    
    # Security check: verify ownership
    if submission["student_id"] != current_user.user_id:
        # Don't reveal that the submission exists
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Check score visibility
    score_hidden = False
    display_score = submission["score"]
    display_grade = submission["grade"]
    display_score_grammar = submission.get("score_grammar")
    display_score_mechanics = submission.get("score_mechanics")
    display_score_content = submission.get("score_content")
    display_score_unity = submission.get("score_unity")
    display_score_total = None
    
    # Hide score_total if not complete
    if submission["rubric_status"] == "complete":
        display_score_total = submission.get("score_total")
    
    # Check assignment show_score setting
    if submission.get("assignment_id") and submission.get("assignments"):
        show_score = submission["assignments"].get("show_score", False)
        if not show_score:
            score_hidden = True
            display_score = None
            display_grade = None
            display_score_grammar = None
            display_score_mechanics = None
            display_score_content = None
            display_score_unity = None
            display_score_total = None
    
    return SubmissionDetailResponse(
        id=str(submission["id"]),
        original_text=submission["original_text"],
        corrected_text=submission["corrected_text"],
        errors=submission["errors_json"],
        score=display_score,
        grade=display_grade,
        word_count=submission["word_count"],
        error_count=submission["error_count"],
        error_breakdown=submission["error_breakdown"],
        feedback=submission["feedback"],
        fallback_used=submission["fallback_used"],
        created_at=submission["created_at"],
        assignment_id=str(submission["assignment_id"]) if submission.get("assignment_id") else None,
        rubric_status=submission["rubric_status"],
        score_grammar=display_score_grammar,
        score_mechanics=display_score_mechanics,
        score_content=display_score_content,
        score_unity=display_score_unity,
        score_total=display_score_total,
        reviewed_at=submission.get("reviewed_at"),
        score_hidden=score_hidden,
        poster_url=submission.get("poster_url"),
        audio_url=submission.get("audio_url"),
    )


@router.post("/poster/generate")
async def generate_submission_poster(
    submission_id: str,
    current_user: UserPayload = Depends(require_student),
):
    """
    Generate motivational poster from submission.
    Returns fallback URL if generation fails.
    """
    supabase = get_supabase_client()
    
    # Fetch submission and verify ownership
    result = supabase.table("submissions").select(
        "student_id, corrected_text"
    ).eq("id", submission_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    submission = result.data[0]
    
    if submission["student_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Generate poster with fallback
    try:
        from backend.services.poster import PosterGenerationError
        poster_url = await generate_poster(
            submission["corrected_text"],
            submission_id
        )
    except PosterGenerationError as e:
        # Return fallback placeholder URL
        logger.warning(f"Poster generation failed, using fallback: {e}")
        poster_url = f"{settings.supabase_url}/storage/v1/object/public/posters/placeholder.png"
    
    # Save poster_url to database
    supabase.table("submissions").update({
        "poster_url": poster_url
    }).eq("id", submission_id).execute()
    
    return {"poster_url": poster_url}


@router.post("/tts/generate")
async def generate_submission_tts(
    submission_id: str,
    current_user: UserPayload = Depends(require_student),
):
    """
    Generate text-to-speech audio from submission.
    Returns null if generation fails (frontend uses Web Speech API).
    """
    supabase = get_supabase_client()
    
    # Fetch submission and verify ownership
    result = supabase.table("submissions").select(
        "student_id, corrected_text"
    ).eq("id", submission_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    submission = result.data[0]
    
    if submission["student_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Generate TTS with fallback
    try:
        from backend.services.tts import TTSGenerationError
        audio_url = await generate_tts(
            submission["corrected_text"],
            submission_id
        )
    except TTSGenerationError as e:
        # Return null - frontend will use Web Speech API
        logger.warning(f"TTS generation failed, returning null: {e}")
        audio_url = None
    
    # Save audio_url to database if not None
    if audio_url:
        supabase.table("submissions").update({
            "audio_url": audio_url
        }).eq("id", submission_id).execute()
    
    return {"audio_url": audio_url}


@router.get("/assignments", response_model=StudentAssignmentListResponse)
async def get_assignments(
    current_user: UserPayload = Depends(require_student),
):
    """
    Get list of active assignments relevant to the student.
    
    Filters assignments by:
    - is_active = true
    - Teacher's school_id matches student's school_id
    - If student has no school_id, returns all active assignments (fallback)
    
    Returns assignments with rubric info and teacher name.
    """
    supabase = get_supabase_client()
    
    # Step 1: Get student's school_id and class_name
    student_result = supabase.table("users").select(
        "school_id, class_name"
    ).eq("id", current_user.user_id).execute()
    
    student = student_result.data[0] if student_result.data else {}
    student_school_id = student.get("school_id")
    
    # Step 2: Query assignments with teacher and rubric info
    query = supabase.table("assignments").select(
        "id, title, description, class_target, is_active, created_at, "
        "users!assignments_teacher_id_fkey(name, school_id), "
        "assignment_rubrics(grammar_weight, mechanics_weight, content_weight, unity_weight)"
    ).eq("is_active", True).order("created_at", desc=True)
    
    result = query.execute()
    
    # Step 3: Filter by school_id in Python
    if student_school_id:
        # Filter: only assignments from teachers with same school_id
        assignments = [
            a for a in result.data
            if a.get("users") and a["users"].get("school_id") == student_school_id
        ]
    else:
        # Fallback: return all active assignments
        assignments = result.data
    
    # Step 4: Format response
    items = []
    for assignment in assignments:
        # Extract teacher name
        teacher_name = None
        if assignment.get("users"):
            teacher_name = assignment["users"].get("name")
        
        # Extract rubric info
        rubric = None
        rubric_data = assignment.get("assignment_rubrics")
        
        # Handle both list and dict formats from Supabase
        if rubric_data:
            if isinstance(rubric_data, list) and len(rubric_data) > 0:
                rubric_item = rubric_data[0]
            elif isinstance(rubric_data, dict):
                rubric_item = rubric_data
            else:
                rubric_item = None
            
            if rubric_item:
                rubric = AssignmentRubricInfo(
                    grammar_weight=rubric_item["grammar_weight"],
                    mechanics_weight=rubric_item["mechanics_weight"],
                    content_weight=rubric_item["content_weight"],
                    unity_weight=rubric_item["unity_weight"]
                )
        
        items.append(StudentAssignmentItem(
            assignment_id=str(assignment["id"]),
            title=assignment["title"],
            description=assignment["description"],
            class_target=assignment.get("class_target"),
            is_active=assignment["is_active"],
            created_at=assignment["created_at"],
            teacher_name=teacher_name,
            rubric=rubric
        ))
    
    logger.info(
        f"Student {current_user.user_id} fetched {len(items)} assignments "
        f"(school_id={student_school_id})"
    )
    
    return StudentAssignmentListResponse(
        data=items,
        total=len(items)
    )
