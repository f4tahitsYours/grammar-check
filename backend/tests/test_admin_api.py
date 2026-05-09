"""
Test suite for admin API endpoints.
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

from backend.routers.admin import router
from backend.models.response import UserPayload
from backend.dependencies import require_admin
from fastapi.testclient import TestClient
from fastapi import FastAPI

# Create test app
app = FastAPI()
app.include_router(router)


@pytest.fixture
def mock_admin_user():
    """Mock admin user for authentication."""
    return UserPayload(
        user_id="admin-123",
        email="admin@test.com",
        role="admin",
        name="Test Admin"
    )


@pytest.fixture
def override_auth(mock_admin_user):
    """Override authentication dependency."""
    async def mock_require_admin():
        return mock_admin_user
    
    app.dependency_overrides[require_admin] = mock_require_admin
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch('backend.routers.admin.get_supabase_client') as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


def test_get_metrics_summary(override_auth, mock_supabase):
    """Test 1: GET /metrics/summary → returns aggregated metrics with top error type"""
    # Mock metrics query
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.gte.return_value = mock_query
    mock_query.lte.return_value = mock_query
    mock_query.order.return_value.execute.return_value = MagicMock(
        data=[
            {
                "id": "metric-1",
                "recorded_at": "2024-01-01T00:00:00Z",
                "total_submissions": 100,
                "cache_hits": 60,
                "cache_misses": 40,
                "lt_calls": 40,
                "llm_calls": 35,
                "fallback_count": 5,
                "avg_score": 85.5,
                "avg_latency_ms": 1500,
                "estimated_cost_usd": "0.003500",
                "active_students": 87,
                "active_teachers": 6,
            },
        ]
    )
    
    # Mock submissions query for error breakdown
    mock_supabase.table.return_value.select.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
        data=[
            {"error_breakdown": {"tense": 10, "spelling": 5}},
            {"error_breakdown": {"tense": 8, "grammar": 3}},
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/admin/metrics/summary?days=7")
    
    assert response.status_code == 200
    data = response.json()
    assert "period" in data
    assert data["total_submissions"] == 100
    assert data["cache_hit_rate"] == 0.6
    assert data["top_error_type"] == "tense"
    assert data["note"] == "estimated, not billed"


def test_get_daily_metrics(override_auth, mock_supabase):
    """Test 2: GET /metrics/daily → returns daily breakdown"""
    # Mock daily metrics query
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.gte.return_value = mock_query
    mock_query.lte.return_value = mock_query
    mock_query.order.return_value.execute.return_value = MagicMock(
        data=[
            {
                "recorded_at": "2024-01-01T00:00:00Z",
                "total_submissions": 45,
                "cache_hits": 12,
                "llm_calls": 33,
                "estimated_cost_usd": "0.12",
                "avg_score": 72.4,
            },
            {
                "recorded_at": "2024-01-02T00:00:00Z",
                "total_submissions": 50,
                "cache_hits": 15,
                "llm_calls": 35,
                "estimated_cost_usd": "0.14",
                "avg_score": 75.0,
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/admin/metrics/daily")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["date"] == "2024-01-01"
    assert data[0]["submissions"] == 45


def test_list_users_no_filters(override_auth, mock_supabase):
    """Test 3: GET /users with no filters → returns all users paginated"""
    # Mock users query
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.range.return_value.execute.return_value = MagicMock(
        count=3,
        data=[
            {
                "id": "user-1",
                "email": "student1@test.com",
                "name": "Student One",
                "role": "student",
                "class_name": "Class A",
                "school_id": "school-1",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z",
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/admin/users?page=1&limit=50")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["users"]) == 1


def test_update_user_role(override_auth, mock_supabase):
    """Test 4: PATCH /users/{id}/role → updates role, audit logged"""
    user_id = "user-123"
    
    # Mock user lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": user_id,
            "email": "student@test.com",
            "role": "student",
        }]
    )
    
    # Mock update
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": user_id, "role": "teacher"}]
    )
    
    # Mock audit log insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": "audit-1"}]
    )
    
    client = TestClient(app)
    response = client.patch(
        f"/api/v1/admin/users/{user_id}/role",
        json={"role": "teacher"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert data["role"] == "teacher"


def test_delete_user(override_auth, mock_supabase):
    """Test 5: DELETE /users/{id} → soft deletes user, audit logged"""
    user_id = "user-456"
    
    # Mock user lookup
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{
            "id": user_id,
            "email": "student@test.com",
            "is_active": True,
        }]
    )
    
    # Mock update
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
        data=[{"id": user_id, "is_active": False}]
    )
    
    # Mock audit log insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": "audit-2"}]
    )
    
    client = TestClient(app)
    response = client.delete(f"/api/v1/admin/users/{user_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["deleted"] is True
    assert data["user_id"] == user_id


def test_get_audit_log(override_auth, mock_supabase):
    """Test 6: GET /audit-log → returns paginated audit log entries"""
    # Mock audit log query
    mock_query = MagicMock()
    mock_supabase.table.return_value.select.return_value = mock_query
    mock_query.gte.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.range.return_value.execute.return_value = MagicMock(
        count=2,
        data=[
            {
                "id": "audit-1",
                "user_id": "admin-123",
                "action": "user.role_change",
                "resource": "user",
                "resource_id": "user-123",
                "metadata": {"old_role": "student", "new_role": "teacher"},
                "ip_address": None,
                "created_at": "2024-01-02T00:00:00Z",
            },
        ]
    )
    
    client = TestClient(app)
    response = client.get("/api/v1/admin/audit-log?page=1&limit=50")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["logs"]) == 1


def test_clear_cache(override_auth, mock_supabase):
    """Test 7: DELETE /cache → clears ALL cache entries, audit logged"""
    # Mock count query
    mock_supabase.table.return_value.select.return_value.execute.return_value = MagicMock(
        count=50
    )
    
    # Mock delete
    mock_supabase.table.return_value.delete.return_value.neq.return_value.execute.return_value = MagicMock(
        data=[]
    )
    
    # Mock audit log insert
    mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[{"id": "audit-3"}]
    )
    
    client = TestClient(app)
    response = client.delete("/api/v1/admin/cache")
    
    assert response.status_code == 200
    data = response.json()
    assert data["deleted_count"] == 50


def test_get_cache_stats(override_auth, mock_supabase):
    """Test 8: GET /cache/stats → returns cache statistics with savings"""
    # Create separate mock chains for each query
    mock_count_query = MagicMock()
    mock_count_query.execute.return_value = MagicMock(count=1000, data=[])
    
    mock_metrics_query = MagicMock()
    mock_metrics_query.execute.return_value = MagicMock(
        data=[
            {"cache_hits": 500},
            {"cache_hits": 300},
        ]
    )
    
    mock_oldest_query = MagicMock()
    mock_oldest_query.order.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"created_at": "2024-01-01T00:00:00Z"}]
    )
    
    mock_newest_query = MagicMock()
    mock_newest_query.order.return_value.limit.return_value.execute.return_value = MagicMock(
        data=[{"created_at": "2024-01-31T23:59:59Z"}]
    )
    
    # Set up the mock to return different query chains in sequence
    mock_supabase.table.return_value.select.side_effect = [
        mock_count_query,   # First call: count query
        mock_metrics_query, # Second call: metrics query
        mock_oldest_query,  # Third call: oldest entry
        mock_newest_query,  # Fourth call: newest entry
    ]
    
    client = TestClient(app)
    response = client.get("/api/v1/admin/cache/stats")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_cache_entries"] == 1000
    assert data["cache_hit_count_all_time"] == 800  # 500 + 300
    assert data["estimated_savings_usd"] == 0.12  # 800 * 0.00015
    assert data["oldest_entry"] == "2024-01-01T00:00:00Z"
    assert data["newest_entry"] == "2024-01-31T23:59:59Z"
