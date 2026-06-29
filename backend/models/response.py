from pydantic import BaseModel, EmailStr
from typing import Literal, Optional, List
from dataclasses import dataclass

class UserPayload(BaseModel):
    user_id: str
    email: EmailStr
    role: Literal['student', 'teacher', 'admin']
    name: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Literal['student', 'teacher', 'admin']
    user_id: str
    name: str

class RegisterResponse(BaseModel):
    user_id: str
    email: EmailStr
    role: Literal['student', 'teacher', 'admin']

@dataclass
class NormalizedError:
    original: str
    correction: str
    error_type: str
    explanation: str
    source: Literal["rule_based", "llm"]
    offset: Optional[int]

class PipelineResult(BaseModel):
    source: Literal["cache", "pipeline"]
    corrected_text: str
    errors: list[dict]  # Will be serialized NormalizedError
    score: int
    grade: str
    word_count: int
    error_count: int
    error_breakdown: dict[str, int]
    feedback: str
    fallback_used: bool
    warning: Optional[str] = None

class RubricAutoScore(BaseModel):
    score_grammar: int
    score_mechanics: int

class RubricFinalScore(BaseModel):
    score_grammar: int
    score_mechanics: int
    score_content: int
    score_unity: int
    score_total: int
    grade: str
    rubric_status: Literal['auto_only', 'awaiting_review', 'complete']

class SubmitResponse(BaseModel):
    submission_id: str
    source: Literal["cache", "pipeline"]
    original_text: str
    corrected_text: str
    errors: list[dict]
    score: Optional[int]
    grade: Optional[str]
    word_count: int
    error_count: int
    error_breakdown: dict[str, int]
    feedback: str
    diff_html: str
    fallback_used: bool
    warning: Optional[str] = None
    rubric_status: str
    score_grammar: Optional[int] = None
    score_mechanics: Optional[int] = None
    score_hidden: bool = False

class SubmissionListItem(BaseModel):
    id: str
    score: Optional[int]
    grade: Optional[str]
    word_count: int
    error_count: int
    created_at: str
    assignment_id: Optional[str] = None
    assignment_title: Optional[str] = None  # For display in list
    original_text_preview: Optional[str] = None  # First 100 chars for card title
    rubric_status: str
    score_grammar: Optional[int] = None
    score_mechanics: Optional[int] = None
    score_total: Optional[int] = None
    score_hidden: bool = False

class SubmissionListResponse(BaseModel):
    items: List[SubmissionListItem]
    total: int
    page: int
    limit: int

class SubmissionDetailResponse(BaseModel):
    id: str
    original_text: str
    corrected_text: str
    errors: list[dict]
    score: Optional[int]
    grade: Optional[str]
    word_count: int
    error_count: int
    error_breakdown: dict[str, int]
    feedback: str
    diff_html: str
    fallback_used: bool
    created_at: str
    assignment_id: Optional[str] = None
    rubric_status: str
    score_grammar: Optional[int] = None
    score_mechanics: Optional[int] = None
    score_content: Optional[int] = None
    score_unity: Optional[int] = None
    score_total: Optional[int] = None
    reviewed_at: Optional[str] = None
    score_hidden: bool = False
    poster_url: Optional[str] = None
    audio_url: Optional[str] = None

class DashboardItem(BaseModel):
    submission_id: str
    student_id: str
    student_name: str
    assignment_id: Optional[str] = None
    assignment_title: Optional[str] = None
    score: int
    grade: str
    word_count: int
    error_count: int
    rubric_status: str
    created_at: str

class DashboardResponse(BaseModel):
    items: List[DashboardItem]
    total: int
    page: int
    limit: int

class PendingReviewItem(BaseModel):
    submission_id: str
    student_id: str
    student_name: str
    assignment_id: str
    assignment_title: str
    word_count: int
    error_count: int
    score_grammar: int
    score_mechanics: int
    created_at: str

class RubricConfig(BaseModel):
    grammar_weight: int
    mechanics_weight: int
    content_weight: int
    unity_weight: int
    grading_scale: dict[str, str]

class AssignmentRubricInfo(BaseModel):
    grammar_weight: int
    mechanics_weight: int
    content_weight: int
    unity_weight: int

class StudentAssignmentItem(BaseModel):
    assignment_id: str
    title: str
    description: str
    class_target: Optional[str] = None
    is_active: bool
    created_at: str
    teacher_name: Optional[str] = None
    rubric: Optional[AssignmentRubricInfo] = None

class StudentAssignmentListResponse(BaseModel):
    data: List[StudentAssignmentItem]
    total: int
