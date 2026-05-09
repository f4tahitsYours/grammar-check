"""
Test suite for student API endpoints.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4

from backend.routers.student import router
from backend.models.response import UserPayload
from backend.dependencies import require_student
from fastapi.testclient import TestClient
from fastapi import FastAPI

# Create test app
app = FastAPI()
app.include_router(router)


@pytest.fixture
def mock_student_user():
    """Mock student user for authentication."""
    return UserPayload(
        user_id="student-123",
        email="student@test.com",
        role="student",
        name="Test Student"
    )


@pytest.fixture
def override_auth(mock_student_user):
    """Override authentication dependency."""
    async def mock_require_student():
        return mock_student_user
    
    app.dependency_overrides[require_student] = mock_require_student
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch('backend.routers.student.get_supabase_client') as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


@pytest.fixture
def mock_pipeline():
    """Mock pipeline execution."""
    with patch('backend.routers.student.run_pipeline') as mock:
        async def mock_run(text):
            return MagicMock(
                source="pipeline",
                corrected_text=text,
                errors=[],
                score=100,
                grade="A",
                word_count=len(text.split()),
                error_count=0,
                error_breakdown={},
                feedback="Excellent work!",
                fallback_used=False,
                warning=None
            )
        mock.side_effect = mock_run
        yield mock


def test_submit_valid_text_free_practice(override_auth, mock_supabase, mock_pipeline):
    """Test 1: Submit valid text (>20 words, no assignment_id) → 200, rubric_status=auto_only"""
    # Mock Supabase insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": "sub-123"}]
    )
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/student/submit",
        json={
            "text": "This is a test submission with more than twenty words to pass validation. "
                    "It contains enough content to be processed by the system."
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["rubric_status"] == "auto_only"
    assert data["score_grammar"] is None
    assert data["score_mechanics"] is None
    assert data["score"] == 100
    assert data["grade"] == "A"


def test_submit_valid_text_with_assignment(override_auth, mock_supabase, mock_pipeline):
    """Test 2: Submit valid text with assignment_id → 200, rubric_status=awaiting_review"""
    assignment_id = str(uuid4())
    
    # Mock Supabase insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": "sub-456"}]
    )
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/student/submit",
        json={
            "text": "This is a test submission with more than twenty words to pass validation. "
                    "It contains enough content to be processed by the system.",
            "assignment_id": assignment_id
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["rubric_status"] == "awaiting_review"
    assert data["score_grammar"] is not None
    assert data["score_mechanics"] is not None
    assert 1 <= data["score_grammar"] <= 5
    assert 1 <= data["score_mechanics"] <= 5
    assert data["score"] == 0  # Not final
    assert data["grade"] == "-"  # Not final


def test_submit_text_too_short(override_auth, mock_supabase, mock_pipeline):
    """Test 3: Submit < 20 words → 422"""
    client = TestClient(app)
    response = client.post(
        "/api/v1/student/submit",
        json={"text": "This is too short."}
    )
    
    assert response.status_code == 422
    assert "at least 20 words" in response.json()["detail"]


def test_submit_text_too_long(override_auth, mock_supabase, mock_pipeline):
    """Test 4: Submit > 500 words → 200, warning contains 'truncated'"""
    # Create text with > 500 words
    long_text = " ".join(["word"] * 600)
    
    # Mock Supabase insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": "sub-789"}]
    )
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/student/submit",
        json={"text": long_text}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["warning"] is not None
    assert "truncated" in data["warning"].lower()
    assert data["word_count"] == 500


def test_get_submissions_list(override_auth, mock_supabase):
    """Test 5: GET /submissions → list ordered by created_at DESC, pagination correct"""
    # Mock count query
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        count=2
    )
    
    # Mock data query
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
        data=[
            {
                "id": "sub-1",
                "score": 95,
                "grade": "A",
                "word_count": 100,
                "error_count": 2,
                "created_at": "2024-01-02T00:00:00Z",
                "assignment_id": None,
                "rubric_status": "auto_only",
                "score_grammar": None,
                "score_mechanics": None,
                "score_total": None,
            },
            {
                "id": "sub-2",
                "score": 85,
                "grade": "B",
                "word_count": 80,
                "error_count": 5,
                "created_at": "2024-01-01T00:00:00Z",
                "assignment_id": None,
                "rubric_status": "auto_only",
                "score_grammar": None,
                "score_mechanics": None,
                "score_total": None,
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/student/submissions?page=1&limit=20")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["page"] == 1
    assert data["limit"] == 20
    assert len(data["items"]) == 2
    # Verify ordering (most recent first)
    assert data["items"][0]["id"] == "sub-1"
    assert data["items"][1]["id"] == "sub-2"


def test_get_submission_detail_own(override_auth, mock_supabase):
    """Test 6: GET /submission/{id} own submission → 200, all fields present"""
    submission_id = "sub-123"
    
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": submission_id,
            "student_id": "student-123",
            "original_text": "Original text here",
            "corrected_text": "Corrected text here",
            "errors_json": [],
            "score": 95,
            "grade": "A",
            "word_count": 50,
            "error_count": 2,
            "error_breakdown": {"spelling": 2},
            "feedback": "Good work!",
            "diff_html": "",
            "fallback_used": False,
            "created_at": "2024-01-01T00:00:00Z",
            "assignment_id": None,
            "rubric_status": "auto_only",
            "score_grammar": None,
            "score_mechanics": None,
            "score_content": None,
            "score_unity": None,
            "score_total": None,
            "reviewed_at": None,
        }]
    )
    
    client = TestClient(app)
    response = client.get(f"/api/v1/student/submission/{submission_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == submission_id
    assert data["original_text"] == "Original text here"
    assert data["score"] == 95
    assert data["grade"] == "A"


def test_get_submission_detail_other_student(override_auth, mock_supabase):
    """Test 7: GET /submission/{id} other student's submission → 404"""
    submission_id = "sub-456"
    
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": submission_id,
            "student_id": "other-student-456",  # Different student
            "original_text": "Original text here",
            "corrected_text": "Corrected text here",
            "errors_json": [],
            "score": 95,
            "grade": "A",
            "word_count": 50,
            "error_count": 2,
            "error_breakdown": {},
            "feedback": "Good work!",
            "diff_html": "",
            "fallback_used": False,
            "created_at": "2024-01-01T00:00:00Z",
            "assignment_id": None,
            "rubric_status": "auto_only",
            "score_grammar": None,
            "score_mechanics": None,
            "score_content": None,
            "score_unity": None,
            "score_total": None,
            "reviewed_at": None,
        }]
    )
    
    client = TestClient(app)
    response = client.get(f"/api/v1/student/submission/{submission_id}")
    
    assert response.status_code == 404


def test_get_submission_detail_awaiting_review_no_total(override_auth, mock_supabase):
    """Test 8: GET /submission/{id} with rubric_status=awaiting_review → score_total=None"""
    submission_id = "sub-789"
    
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": submission_id,
            "student_id": "student-123",
            "original_text": "Original text here",
            "corrected_text": "Corrected text here",
            "errors_json": [],
            "score": 0,
            "grade": "-",
            "word_count": 50,
            "error_count": 2,
            "error_breakdown": {},
            "feedback": "Awaiting review",
            "diff_html": "",
            "fallback_used": False,
            "created_at": "2024-01-01T00:00:00Z",
            "assignment_id": "assign-123",
            "rubric_status": "awaiting_review",
            "score_grammar": 4,
            "score_mechanics": 4,
            "score_content": None,
            "score_unity": None,
            "score_total": 16,  # This should be hidden
            "reviewed_at": None,
        }]
    )
    
    client = TestClient(app)
    response = client.get(f"/api/v1/student/submission/{submission_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["rubric_status"] == "awaiting_review"
    assert data["score_total"] is None  # Hidden until complete
