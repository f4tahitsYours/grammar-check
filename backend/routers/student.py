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
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
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
    
    # Step 4: Run pipeline
    pipeline_result = await run_pipeline(cleaned_text)
    
    # Merge warning from pipeline if exists
    if pipeline_result.warning and warning:
        warning = f"{warning} {pipeline_result.warning}"
    elif pipeline_result.warning:
        warning = pipeline_result.warning
    
    # Step 5: Determine scoring mode
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
    
    # Step 6: Save to submissions table
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
        "diff_html": "",  # Will be generated on frontend or stored separately
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
    
    # Step 7: Record metrics in background
    background_tasks.add_task(
        record_pipeline_metric,
        source=pipeline_result.source,
        fallback_used=pipeline_result.fallback_used,
        word_count=pipeline_result.word_count,
        error_count=pipeline_result.error_count,
        score=score,
        user_id=current_user.user_id
    )
    
    # Step 8: Log submission
    logger.info(
        f"Submission created: submission_id={submission_id}, "
        f"user_id={current_user.user_id}, mode={'B' if request.assignment_id else 'A'}"
    )
    
    # Step 9: Return response
    return SubmitResponse(
        submission_id=submission_id,
        source=pipeline_result.source,
        original_text=request.text,
        corrected_text=pipeline_result.corrected_text,
        errors=pipeline_result.errors,
        score=score,
        grade=grade,
        word_count=pipeline_result.word_count,
        error_count=pipeline_result.error_count,
        error_breakdown=pipeline_result.error_breakdown,
        feedback=pipeline_result.feedback,
        diff_html="",  # Frontend will generate
        fallback_used=pipeline_result.fallback_used,
        warning=warning,
        rubric_status=rubric_status,
        score_grammar=score_grammar,
        score_mechanics=score_mechanics,
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
        "id, score, grade, word_count, error_count, created_at, "
        "assignment_id, rubric_status, score_grammar, score_mechanics, score_total"
    ).eq(
        "student_id", current_user.user_id
    ).order(
        "created_at", desc=True
    ).range(offset, offset + limit - 1).execute()
    
    items = [
        SubmissionListItem(
            id=str(row["id"]),
            score=row["score"],
            grade=row["grade"],
            word_count=row["word_count"],
            error_count=row["error_count"],
            created_at=row["created_at"],
            assignment_id=str(row["assignment_id"]) if row.get("assignment_id") else None,
            rubric_status=row["rubric_status"],
            score_grammar=row.get("score_grammar"),
            score_mechanics=row.get("score_mechanics"),
            score_total=row.get("score_total"),
        )
        for row in result.data
    ]
    
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
    
    result = supabase.table("submissions").select("*").eq(
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
    
    # Hide score_total if not complete
    score_total = None
    if submission["rubric_status"] == "complete":
        score_total = submission.get("score_total")
    
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
        diff_html=submission.get("diff_html", ""),
        fallback_used=submission["fallback_used"],
        created_at=submission["created_at"],
        assignment_id=str(submission["assignment_id"]) if submission.get("assignment_id") else None,
        rubric_status=submission["rubric_status"],
        score_grammar=submission.get("score_grammar"),
        score_mechanics=submission.get("score_mechanics"),
        score_content=submission.get("score_content"),
        score_unity=submission.get("score_unity"),
        score_total=score_total,
        reviewed_at=submission.get("reviewed_at"),
    )


@router.post("/poster/generate")
async def generate_submission_poster(
    submission_id: str,
    current_user: UserPayload = Depends(require_student),
):
    """
    Generate motivational poster from submission.
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
    
    # Generate poster
    poster_url = await generate_poster(submission["corrected_text"])
    
    return {"poster_url": poster_url}


@router.post("/tts/generate")
async def generate_submission_tts(
    submission_id: str,
    current_user: UserPayload = Depends(require_student),
):
    """
    Generate text-to-speech audio from submission.
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
    
    # Generate TTS
    audio_url = await generate_tts(submission["corrected_text"])
    
    return {"audio_url": audio_url}
