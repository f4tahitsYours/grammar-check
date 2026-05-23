from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional
from uuid import UUID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    role: Literal['student', 'teacher', 'admin']
    class_name: Optional[str] = None

class SubmitRequest(BaseModel):
    text: str = Field(min_length=1)
    assignment_id: Optional[UUID] = None

class ReviewRequest(BaseModel):
    score_content: int = Field(ge=1, le=5)
    score_unity: int = Field(ge=1, le=5)

class AssignmentCreateRequest(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    class_target: str = Field(min_length=1)
    is_active: bool = True
    show_score: bool = False
    rubric: Optional['RubricConfigRequest'] = None

class RubricConfigRequest(BaseModel):
    grammar_weight: int = Field(ge=1, le=5, default=5)
    mechanics_weight: int = Field(ge=1, le=5, default=5)
    content_weight: int = Field(ge=1, le=5, default=5)
    unity_weight: int = Field(ge=1, le=5, default=5)
    grading_scale: dict[str, str] = Field(default={"17": "A", "13": "B", "9": "C", "0": "D"})
