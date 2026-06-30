"""
Test suite for teacher API endpoints.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4

from backend.routers.teacher import router
from backend.models.response import UserPayload
from backend.dependencies import require_teacher
from fastapi.testclient import TestClient
from fastapi import FastAPI

# Create test app
app = FastAPI()
app.include_router(router)


@pytest.fixture
def mock_teacher_user():
    """Mock teacher user for authentication."""
    return UserPayload(
        user_id="teacher-123",
        email="teacher@test.com",
        role="teacher",
        name="Test Teacher"
    )


@pytest.fixture
def override_auth(mock_teacher_user):
    """Override authentication dependency."""
    async def mock_require_teacher():
        return mock_teacher_user
    
    app.dependency_overrides[require_teacher] = mock_require_teacher
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch('backend.routers.teacher.get_supabase_client') as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


def test_dashboard_no_filters(override_auth, mock_supabase):
    """Test 1: GET /dashboard with no filters → returns all submissions in school"""
    # Mock teacher school lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"school_id": "school-1"}]
    )
    
    # Mock query builder chain for submissions
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.range.return_value.execute.return_value = MagicMock(
        count=2,
        data=[
            {
                "id": "sub-1",
                "student_id": "student-1",
                "users": {"name": "Student One", "school_id": "school-1"},
                "assignment_id": "assign-1",
                "assignments": {"title": "Essay 1"},
                "score": 95,
                "grade": "A",
                "word_count": 100,
                "error_count": 2,
                "rubric_status": "complete",
                "created_at": "2024-01-02T00:00:00Z",
            },
            {
                "id": "sub-2",
                "student_id": "student-2",
                "users": {"name": "Student Two", "school_id": "school-1"},
                "assignment_id": None,
                "assignments": None,
                "score": 85,
                "grade": "B",
                "word_count": 80,
                "error_count": 5,
                "rubric_status": "auto_only",
                "created_at": "2024-01-01T00:00:00Z",
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/teacher/dashboard?page=1&limit=20")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["page"] == 1
    assert data["limit"] == 20
    assert len(data["items"]) == 2
    assert data["items"][0]["submission_id"] == "sub-1"
    assert data["items"][0]["student_name"] == "Student One"


def test_dashboard_with_filters(override_auth, mock_supabase):
    """Test 2: GET /dashboard with student_id filter → returns filtered results"""
    # Mock teacher school lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"school_id": "school-1"}]
    )
    
    # Mock query builder chain
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.range.return_value.execute.return_value = MagicMock(
        count=1,
        data=[
            {
                "id": "sub-1",
                "student_id": "student-1",
                "users": {"name": "Student One", "school_id": "school-1"},
                "assignment_id": "assign-1",
                "assignments": {"title": "Essay 1"},
                "score": 95,
                "grade": "A",
                "word_count": 100,
                "error_count": 2,
                "rubric_status": "complete",
                "created_at": "2024-01-02T00:00:00Z",
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/teacher/dashboard?student_id=student-1")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["student_id"] == "student-1"


def test_get_submission_detail_same_school(override_auth, mock_supabase):
    """Test 3: GET /submission/{id} within same school → 200, full detail"""
    submission_id = "sub-123"
    
    # Mock teacher school lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        MagicMock(data=[{"school_id": "school-1"}]),  # Teacher lookup
        MagicMock(data=[{  # Submission lookup
            "id": submission_id,
            "student_id": "student-1",
            "original_text": "Original text",
            "corrected_text": "Corrected text",
            "errors_json": [],
            "score": 95,
            "grade": "A",
            "word_count": 50,
            "error_count": 2,
            "error_breakdown": {"spelling": 2},
            "feedback": "Good work!",
            "fallback_used": False,
            "created_at": "2024-01-01T00:00:00Z",
            "assignment_id": "assign-1",
            "rubric_status": "complete",
            "score_grammar": 5,
            "score_mechanics": 4,
            "score_content": 5,
            "score_unity": 4,
            "score_total": 18,
            "reviewed_at": "2024-01-02T00:00:00Z",
            "users": {"school_id": "school-1"},
        }])
    ]
    
    client = TestClient(app)
    response = client.get(f"/api/v1/teacher/submission/{submission_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == submission_id
    assert data["score_total"] == 18
    assert data["grade"] == "A"


def test_get_submission_detail_different_school(override_auth, mock_supabase):
    """Test 4: GET /submission/{id} from different school → 404"""
    submission_id = "sub-456"
    
    # Mock teacher school lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        MagicMock(data=[{"school_id": "school-1"}]),  # Teacher lookup
        MagicMock(data=[{  # Submission lookup
            "id": submission_id,
            "student_id": "student-2",
            "users": {"school_id": "school-2"},  # Different school
        }])
    ]
    
    client = TestClient(app)
    response = client.get(f"/api/v1/teacher/submission/{submission_id}")
    
    assert response.status_code == 404


def test_export_csv_streaming(override_auth, mock_supabase):
    """Test 5: GET /export → returns CSV with streaming, correct headers"""
    # Mock teacher school lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"school_id": "school-1"}]
    )
    
    # Mock query builder chain
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    
    # Mock range query for batch
    mock_query.range.return_value.execute.side_effect = [
        MagicMock(data=[
            {
                "id": "sub-1",
                "student_id": "student-1",
                "users": {"name": "Student One", "school_id": "school-1"},
                "assignment_id": "assign-1",
                "assignments": {"title": "Essay 1"},
                "score": 95,
                "grade": "A",
                "word_count": 100,
                "error_count": 2,
                "rubric_status": "complete",
                "score_grammar": 5,
                "score_mechanics": 4,
                "score_content": 5,
                "score_unity": 4,
                "score_total": 18,
                "created_at": "2024-01-01T00:00:00Z",
            }
        ]),
        MagicMock(data=[]),  # Empty batch to stop iteration
    ]
    
    client = TestClient(app)
    response = client.get("/api/v1/teacher/export")
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment" in response.headers["content-disposition"]
    
    # Check CSV content
    csv_content = response.text
    assert "submission_id" in csv_content
    assert "student_name" in csv_content
    assert "Student One" in csv_content


def test_create_assignment_with_rubric(override_auth, mock_supabase):
    """Test 6: POST /assignment with rubric → 200, assignment and rubric created"""
    assignment_id = str(uuid4())
    
    # Mock assignment insert
    mock_supabase.table.return_value.insert.return_value.execute.side_effect = [
        MagicMock(data=[{"id": assignment_id}]),  # Assignment
        MagicMock(data=[{"id": "rubric-1"}]),  # Rubric
    ]
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/teacher/assignment",
        json={
            "title": "Essay Assignment",
            "description": "Write an essay",
            "class_target": "Class A",
            "rubric": {
                "grammar_weight": 5,
                "mechanics_weight": 5,
                "content_weight": 5,
                "unity_weight": 5,
                "grading_scale": {"17": "A", "13": "B", "9": "C", "0": "D"}
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["assignment_id"] == assignment_id
    assert data["title"] == "Essay Assignment"


def test_create_assignment_without_rubric(override_auth, mock_supabase):
    """Test 7: POST /assignment without rubric → 200, only assignment created"""
    assignment_id = str(uuid4())
    
    # Mock assignment insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": assignment_id}]
    )
    
    client = TestClient(app)
    response = client.post(
        "/api/v1/teacher/assignment",
        json={
            "title": "Simple Assignment",
            "description": "No rubric",
            "class_target": "Class B",
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["assignment_id"] == assignment_id


def test_update_assignment_owner(override_auth, mock_supabase):
    """Test 8: PATCH /assignment/{id} by owner → 200, updated"""
    assignment_id = "assign-123"
    
    # Mock ownership check
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        MagicMock(data=[{"teacher_id": "teacher-123"}]),  # Ownership check
        MagicMock(data=[{"id": "rubric-1"}]),  # Rubric check
    ]
    
    # Mock update
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": assignment_id}]
    )
    
    client = TestClient(app)
    response = client.patch(
        f"/api/v1/teacher/assignment/{assignment_id}",
        json={
            "title": "Updated Assignment",
            "description": "Updated description",
            "class_target": "Class A",
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Assignment"


def test_update_assignment_not_owner(override_auth, mock_supabase):
    """Test 9: PATCH /assignment/{id} by non-owner → 403"""
    assignment_id = "assign-456"
    
    # Mock ownership check (different teacher)
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"teacher_id": "other-teacher-456"}]
    )
    
    client = TestClient(app)
    response = client.patch(
        f"/api/v1/teacher/assignment/{assignment_id}",
        json={
            "title": "Updated Assignment",
            "description": "Updated description",
            "class_target": "Class A",
        }
    )
    
    assert response.status_code == 403


def test_get_pending_reviews(override_auth, mock_supabase):
    """Test 10: GET /pending-reviews → returns awaiting_review submissions, oldest first"""
    # Mock teacher school lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"school_id": "school-1"}]
    )
    
    # Mock pending submissions query
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value.execute.return_value = MagicMock(
        data=[
            {
                "id": "sub-1",
                "student_id": "student-1",
                "users": {"name": "Student One", "school_id": "school-1"},
                "assignment_id": "assign-1",
                "assignments": {"title": "Essay 1"},
                "word_count": 100,
                "error_count": 2,
                "score_grammar": 5,
                "score_mechanics": 4,
                "created_at": "2024-01-01T00:00:00Z",
            },
            {
                "id": "sub-2",
                "student_id": "student-2",
                "users": {"name": "Student Two", "school_id": "school-1"},
                "assignment_id": "assign-1",
                "assignments": {"title": "Essay 1"},
                "word_count": 80,
                "error_count": 5,
                "score_grammar": 4,
                "score_mechanics": 3,
                "created_at": "2024-01-02T00:00:00Z",
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/teacher/pending-reviews")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    # Verify oldest first
    assert data["items"][0]["submission_id"] == "sub-1"
    assert data["items"][0]["created_at"] == "2024-01-01T00:00:00Z"


def test_review_submission_success(override_auth, mock_supabase):
    """Test 11: PATCH /submission/{id}/review with valid scores → 200, calculates total"""
    submission_id = "sub-123"
    
    # Mock 3 separate queries: submission, assignment, rubric
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        # Query 1: Get submission data
        MagicMock(data=[{
            "id": submission_id,
            "assignment_id": "assign-1",
            "score_grammar": 5,
            "score_mechanics": 4,
            "rubric_status": "awaiting_review",
        }]),
        # Query 2: Get assignment to check teacher ownership
        MagicMock(data=[{
            "teacher_id": "teacher-123",
        }]),
        # Query 3: Get rubric for validation
        MagicMock(data=[{
            "grammar_weight": 5,
            "mechanics_weight": 5,
            "content_weight": 5,
            "unity_weight": 5,
            "grading_scale": {"17": "A", "13": "B", "9": "C", "0": "D"}
        }]),
    ]
    
    # Mock update
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": submission_id}]
    )
    
    client = TestClient(app)
    response = client.patch(
        f"/api/v1/teacher/submission/{submission_id}/review",
        json={
            "score_content": 5,
            "score_unity": 4,
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["score_content"] == 5
    assert data["score_unity"] == 4
    assert data["score_total"] == 18  # 5+4+5+4
    assert data["grade"] == "A"
    assert data["rubric_status"] == "complete"


def test_review_submission_already_reviewed(override_auth, mock_supabase):
    """Test 12: PATCH /submission/{id}/review when already complete → 409"""
    submission_id = "sub-456"
    
    # Mock submission lookup (already complete)
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": submission_id,
            "assignment_id": "assign-1",
            "score_grammar": 5,
            "score_mechanics": 4,
            "rubric_status": "complete",  # Already reviewed
        }]
    )
    
    client = TestClient(app)
    response = client.patch(
        f"/api/v1/teacher/submission/{submission_id}/review",
        json={
            "score_content": 5,
            "score_unity": 4,
        }
    )
    
    assert response.status_code == 409
    assert "already reviewed" in response.json()["detail"].lower()


def test_get_assignments_list(override_auth, mock_supabase):
    """Test 13: GET /assignment → returns all assignments for teacher with rubrics"""
    # Mock assignments query with rubrics
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
        data=[
            {
                "id": "assign-1",
                "title": "Essay Assignment 1",
                "description": "Write about your favorite book",
                "class_target": "10A",
                "is_active": True,
                "show_score": False,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-02T00:00:00Z",
                "assignment_rubrics": [
                    {
                        "grammar_weight": 5,
                        "mechanics_weight": 5,
                        "content_weight": 5,
                        "unity_weight": 5,
                    }
                ]
            },
            {
                "id": "assign-2",
                "title": "Essay Assignment 2",
                "description": "Write about your dream job",
                "class_target": "10B",
                "is_active": True,
                "show_score": True,
                "created_at": "2024-01-03T00:00:00Z",
                "updated_at": None,
                "assignment_rubrics": []  # No rubric
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/teacher/assignment")
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 2
    
    # Check first assignment
    assert data["data"][0]["assignment_id"] == "assign-1"
    assert data["data"][0]["title"] == "Essay Assignment 1"
    assert data["data"][0]["show_score"] is False
    assert "rubric" in data["data"][0]
    assert data["data"][0]["rubric"]["grammar_weight"] == 5
    
    # Check second assignment (no rubric)
    assert data["data"][1]["assignment_id"] == "assign-2"
    assert data["data"][1]["show_score"] is True
    assert "rubric" not in data["data"][1]


def test_get_assignments_empty(override_auth, mock_supabase):
    """Test 14: GET /assignment when teacher has no assignments → returns empty list"""
    # Mock empty assignments query
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
        data=[]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/teacher/assignment")
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 0
