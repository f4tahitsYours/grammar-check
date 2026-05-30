"""
Admin API endpoints for system observability and user management.
"""

import logging
from typing import Optional
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from supabase import create_client, Client

from backend.config import settings
from backend.dependencies import require_admin
from backend.models.response import UserPayload

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# Cost constant for cache savings calculation
COST_PER_LLM_CALL: float = 0.00015


class RoleUpdateRequest(BaseModel):
    """Request model for role update."""
    role: str


class SchoolCreateRequest(BaseModel):
    """Request model for creating a new school."""
    name: str


class SchoolUpdateRequest(BaseModel):
    """Request model for updating school name."""
    name: str


class UserSchoolAssignRequest(BaseModel):
    """Request model for assigning user to a school."""
    school_id: str


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for admin operations."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key or settings.supabase_key
    )


@router.get("/metrics/summary")
async def get_metrics_summary(
    days: int = Query(default=7, ge=1, le=90),
    current_user: UserPayload = Depends(require_admin),
):
    """
    Get system metrics summary for the last N days.
    Returns aggregated metrics with top error type.
    """
    supabase = get_supabase_client()
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Query metrics
    metrics_result = supabase.table("system_metrics").select("*").gte(
        "recorded_at", start_date.isoformat()
    ).lte(
        "recorded_at", end_date.isoformat()
    ).order("recorded_at", desc=True).execute()
    
    if not metrics_result.data:
        return {
            "period": {
                "from": start_date.isoformat(),
                "to": end_date.isoformat()
            },
            "total_submissions": 0,
            "cache_hit_rate": 0.0,
            "avg_pipeline_latency_ms": 0,
            "fallback_rate": 0.0,
            "estimated_cost_usd": 0.0,
            "active_students": 0,
            "active_teachers": 0,
            "avg_score_system": 0.0,
            "top_error_type": None,
            "note": "estimated, not billed"
        }
    
    # Calculate aggregated metrics
    total_submissions = sum(m["total_submissions"] for m in metrics_result.data)
    total_cache_hits = sum(m["cache_hits"] for m in metrics_result.data)
    total_cache_misses = sum(m["cache_misses"] for m in metrics_result.data)
    total_fallbacks = sum(m["fallback_count"] for m in metrics_result.data)
    total_cost = sum(float(m["estimated_cost_usd"] or 0) for m in metrics_result.data)
    
    # Get latest active counts
    latest_metric = metrics_result.data[0] if metrics_result.data else {}
    active_students = latest_metric.get("active_students", 0)
    active_teachers = latest_metric.get("active_teachers", 0)
    
    # Calculate rates
    cache_hit_rate = 0.0
    if (total_cache_hits + total_cache_misses) > 0:
        cache_hit_rate = total_cache_hits / (total_cache_hits + total_cache_misses)
    
    fallback_rate = 0.0
    if total_submissions > 0:
        fallback_rate = total_fallbacks / total_submissions
    
    # Calculate average score (weighted by submissions)
    weighted_score_sum = sum(
        float(m["avg_score"] or 0) * m["total_submissions"] 
        for m in metrics_result.data
    )
    avg_score_system = weighted_score_sum / total_submissions if total_submissions > 0 else 0.0
    
    # Calculate average latency (weighted by submissions)
    weighted_latency_sum = sum(
        (m["avg_latency_ms"] or 0) * m["total_submissions"]
        for m in metrics_result.data
        if m.get("avg_latency_ms")
    )
    avg_pipeline_latency_ms = int(weighted_latency_sum / total_submissions) if total_submissions > 0 else 0
    
    # Get top error type from submissions in period
    submissions_result = supabase.table("submissions").select(
        "error_breakdown"
    ).gte(
        "created_at", start_date.isoformat()
    ).lte(
        "created_at", end_date.isoformat()
    ).execute()
    
    # Aggregate error types
    error_counts = {}
    for submission in submissions_result.data:
        error_breakdown = submission.get("error_breakdown", {})
        for error_type, count in error_breakdown.items():
            error_counts[error_type] = error_counts.get(error_type, 0) + count
    
    top_error_type = max(error_counts, key=error_counts.get) if error_counts else None
    
    return {
        "period": {
            "from": start_date.isoformat(),
            "to": end_date.isoformat()
        },
        "total_submissions": total_submissions,
        "cache_hit_rate": round(cache_hit_rate, 2),
        "avg_pipeline_latency_ms": avg_pipeline_latency_ms,
        "fallback_rate": round(fallback_rate, 2),
        "estimated_cost_usd": round(total_cost, 2),
        "active_students": active_students,
        "active_teachers": active_teachers,
        "avg_score_system": round(avg_score_system, 1),
        "top_error_type": top_error_type,
        "note": "estimated, not billed"
    }


@router.get("/metrics/daily")
async def get_daily_metrics(
    from_date: Optional[str] = Query(default=None),
    to_date: Optional[str] = Query(default=None),
    current_user: UserPayload = Depends(require_admin),
):
    """
    Get daily metrics breakdown.
    Returns list of metrics per day.
    """
    supabase = get_supabase_client()
    
    # Calculate date range
    if to_date:
        end_date = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
    else:
        end_date = datetime.utcnow()
    
    if from_date:
        start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
    else:
        start_date = end_date - timedelta(days=7)
    
    # Query metrics
    result = supabase.table("system_metrics").select("*").gte(
        "recorded_at", start_date.isoformat()
    ).lte(
        "recorded_at", end_date.isoformat()
    ).order("recorded_at", desc=False).execute()
    
    # Format response
    daily_metrics = []
    for metric in result.data:
        recorded_date = datetime.fromisoformat(metric["recorded_at"].replace('Z', '+00:00'))
        daily_metrics.append({
            "date": recorded_date.date().isoformat(),
            "submissions": metric["total_submissions"],
            "cache_hits": metric["cache_hits"],
            "llm_calls": metric["llm_calls"],
            "estimated_cost_usd": round(float(metric["estimated_cost_usd"] or 0), 2),
            "avg_score": round(float(metric["avg_score"] or 0), 1)
        })
    
    return daily_metrics


@router.get("/users")
async def list_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    role: Optional[str] = Query(default=None),
    school_id: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    current_user: UserPayload = Depends(require_admin),
):
    """
    List all users with optional filters.
    Supports pagination and filtering by role, school_id, and is_active.
    """
    supabase = get_supabase_client()
    
    # Build query
    query = supabase.table("users").select(
        "id, email, name, role, class_name, school_id, is_active, created_at",
        count="exact"
    )
    
    # Apply filters
    if role:
        query = query.eq("role", role)
    
    if school_id:
        query = query.eq("school_id", school_id)
    
    if is_active is not None:
        query = query.eq("is_active", is_active)
    
    # Paginate
    offset = (page - 1) * limit
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    # Execute
    result = query.execute()
    
    return {
        "users": result.data,
        "total": result.count or 0,
        "page": page,
        "limit": limit,
    }


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    request: RoleUpdateRequest,
    current_user: UserPayload = Depends(require_admin),
):
    """
    Update user role.
    Logs action to audit_log.
    """
    supabase = get_supabase_client()
    
    # Validate role
    valid_roles = ["student", "teacher", "admin"]
    if request.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Get current user data
    user_result = supabase.table("users").select("id, email, role").eq(
        "id", user_id
    ).execute()
    
    if not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = user_result.data[0]
    old_role = user["role"]
    
    # Update role
    update_result = supabase.table("users").update({
        "role": request.role
    }).eq("id", user_id).execute()
    
    if not update_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )
    
    # Sync role ke Supabase Auth user_metadata
    # Ini memastikan JWT baru akan punya role yang sudah diupdate
    try:
        supabase.auth.admin.update_user_by_id(
            user_id,
            {"user_metadata": {"role": request.role}}
        )
        logger.info(
            f"Role synced to Supabase Auth: user_id={user_id}, "
            f"new_role={request.role}"
        )
    except Exception as e:
        logger.warning(
            f"Failed to sync role to Supabase Auth: user_id={user_id}, "
            f"error={e}. Database update succeeded."
        )
    
    # Log to audit_log
    supabase.table("audit_log").insert({
        "user_id": current_user.user_id,
        "action": "user.role_change",
        "resource": "user",
        "resource_id": user_id,
        "metadata": {
            "old_role": old_role,
            "new_role": request.role
        },
    }).execute()
    
    logger.info(
        f"User role updated: user_id={user_id}, old_role={old_role}, "
        f"new_role={request.role}, admin_id={current_user.user_id}"
    )
    
    return {
        "user_id": user_id,
        "role": request.role
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: UserPayload = Depends(require_admin),
):
    """
    Soft delete a user by setting is_active = false.
    Logs action to audit_log.
    Submissions remain intact.
    """
    supabase = get_supabase_client()
    
    # Check if user exists
    user_result = supabase.table("users").select("id, email, is_active").eq(
        "id", user_id
    ).execute()
    
    if not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = user_result.data[0]
    
    # Soft delete
    update_result = supabase.table("users").update({
        "is_active": False
    }).eq("id", user_id).execute()
    
    if not update_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    # Log to audit_log
    supabase.table("audit_log").insert({
        "user_id": current_user.user_id,
        "action": "user.soft_delete",
        "resource": "user",
        "resource_id": user_id,
        "metadata": {"email": user["email"]},
    }).execute()
    
    logger.warning(
        f"User soft deleted: user_id={user_id}, admin_id={current_user.user_id}"
    )
    
    return {
        "deleted": True,
        "user_id": user_id
    }


@router.get("/audit-log")
async def get_audit_log(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    action: Optional[str] = Query(default=None),
    user_id: Optional[str] = Query(default=None),
    days: int = Query(default=30, ge=1, le=365),
    current_user: UserPayload = Depends(require_admin),
):
    """
    Get audit log entries with optional filters.
    Returns paginated audit log ordered by created_at DESC.
    """
    supabase = get_supabase_client()
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Build query
    query = supabase.table("audit_log").select(
        "id, user_id, action, resource, resource_id, metadata, ip_address, created_at",
        count="exact"
    ).gte("created_at", start_date.isoformat())
    
    # Apply filters
    if action:
        query = query.eq("action", action)
    
    if user_id:
        query = query.eq("user_id", user_id)
    
    # Paginate
    offset = (page - 1) * limit
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    # Execute
    result = query.execute()
    
    return {
        "logs": result.data,
        "total": result.count or 0,
        "page": page,
        "limit": limit,
    }


@router.delete("/cache")
async def clear_cache(
    current_user: UserPayload = Depends(require_admin),
):
    """
    Clear ALL grammar cache entries.
    Logs action to audit_log.
    """
    supabase = get_supabase_client()
    
    # Count entries before deletion
    count_result = supabase.table("grammar_cache").select(
        "input_hash", count="exact"
    ).execute()
    
    entries_to_delete = count_result.count or 0
    
    if entries_to_delete == 0:
        return {
            "deleted_count": 0
        }
    
    # Delete ALL entries (no date filter)
    delete_result = supabase.table("grammar_cache").delete().neq(
        "input_hash", ""  # This will match all rows
    ).execute()
    
    # Log to audit_log
    supabase.table("audit_log").insert({
        "user_id": current_user.user_id,
        "action": "cache.purge",
        "resource": "grammar_cache",
        "metadata": {
            "deleted_count": entries_to_delete
        },
    }).execute()
    
    logger.warning(
        f"Cache purged: deleted_count={entries_to_delete}, "
        f"admin_id={current_user.user_id}"
    )
    
    return {
        "deleted_count": entries_to_delete
    }


@router.get("/cache/stats")
async def get_cache_stats(
    current_user: UserPayload = Depends(require_admin),
):
    """
    Get cache statistics including total entries, cache hits, and estimated savings.
    """
    supabase = get_supabase_client()
    
    # Get total cache entries
    count_result = supabase.table("grammar_cache").select(
        "input_hash", count="exact"
    ).execute()
    
    total_cache_entries = count_result.count or 0
    
    # Get cache hit count from system_metrics (all time)
    metrics_result = supabase.table("system_metrics").select("cache_hits").execute()
    
    cache_hit_count_all_time = sum(m["cache_hits"] for m in metrics_result.data)
    
    # Calculate estimated savings
    estimated_savings_usd = cache_hit_count_all_time * COST_PER_LLM_CALL
    
    # Get oldest and newest entries
    oldest_result = supabase.table("grammar_cache").select(
        "created_at"
    ).order("created_at", desc=False).limit(1).execute()
    
    newest_result = supabase.table("grammar_cache").select(
        "created_at"
    ).order("created_at", desc=True).limit(1).execute()
    
    oldest_entry = oldest_result.data[0]["created_at"] if oldest_result.data else None
    newest_entry = newest_result.data[0]["created_at"] if newest_result.data else None
    
    return {
        "total_cache_entries": total_cache_entries,
        "cache_hit_count_all_time": cache_hit_count_all_time,
        "estimated_savings_usd": round(estimated_savings_usd, 3),
        "oldest_entry": oldest_entry,
        "newest_entry": newest_entry,
    }


@router.get("/health")
async def health_check(
    current_user: UserPayload = Depends(require_admin),
):
    """
    System health check endpoint.
    Returns status of database connection and basic system info.
    """
    supabase = get_supabase_client()
    
    try:
        # Test database connection
        result = supabase.table("users").select("id", count="exact").limit(1).execute()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/schools")
async def list_schools(
    current_user: UserPayload = Depends(require_admin),
):
    """
    List all schools with total user count per school.
    Returns list of schools with their user counts.
    """
    supabase = get_supabase_client()
    
    # Get all schools
    schools_result = supabase.table("schools").select(
        "id, name, created_at"
    ).order("name", desc=False).execute()
    
    # Get user counts per school
    schools_with_counts = []
    for school in schools_result.data:
        # Count users for this school
        users_result = supabase.table("users").select(
            "id", count="exact"
        ).eq("school_id", school["id"]).execute()
        
        schools_with_counts.append({
            "id": school["id"],
            "name": school["name"],
            "created_at": school["created_at"],
            "total_users": users_result.count or 0
        })
    
    return schools_with_counts


@router.post("/schools")
async def create_school(
    request: SchoolCreateRequest,
    current_user: UserPayload = Depends(require_admin),
):
    """
    Create a new school.
    Validates name uniqueness and logs action to audit_log.
    """
    supabase = get_supabase_client()
    
    # Validate name is not empty or whitespace
    if not request.name or not request.name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="School name cannot be empty or whitespace"
        )
    
    # Check for duplicate name
    existing_result = supabase.table("schools").select("id").eq(
        "name", request.name.strip()
    ).execute()
    
    if existing_result.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="School name already exists"
        )
    
    # Insert new school
    insert_result = supabase.table("schools").insert({
        "name": request.name.strip()
    }).execute()
    
    if not insert_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create school"
        )
    
    school = insert_result.data[0]
    
    # Log to audit_log
    supabase.table("audit_log").insert({
        "user_id": current_user.user_id,
        "action": "school.create",
        "resource": "school",
        "resource_id": school["id"],
        "metadata": {
            "school_name": school["name"]
        },
    }).execute()
    
    logger.info(
        f"School created: school_id={school['id']}, name={school['name']}, "
        f"admin_id={current_user.user_id}"
    )
    
    return {
        "id": school["id"],
        "name": school["name"],
        "created_at": school["created_at"]
    }


@router.patch("/schools/{school_id}")
async def update_school(
    school_id: str,
    request: SchoolUpdateRequest,
    current_user: UserPayload = Depends(require_admin),
):
    """
    Update school name.
    Validates name uniqueness and logs action to audit_log.
    """
    supabase = get_supabase_client()
    
    # Validate name is not empty or whitespace
    if not request.name or not request.name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="School name cannot be empty or whitespace"
        )
    
    # Check if school exists
    school_result = supabase.table("schools").select("id, name").eq(
        "id", school_id
    ).execute()
    
    if not school_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    
    old_school = school_result.data[0]
    
    # Check for duplicate name (excluding current school)
    duplicate_result = supabase.table("schools").select("id").eq(
        "name", request.name.strip()
    ).neq("id", school_id).execute()
    
    if duplicate_result.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="School name already exists"
        )
    
    # Update school
    update_result = supabase.table("schools").update({
        "name": request.name.strip()
    }).eq("id", school_id).execute()
    
    if not update_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update school"
        )
    
    school = update_result.data[0]
    
    # Log to audit_log
    supabase.table("audit_log").insert({
        "user_id": current_user.user_id,
        "action": "school.update",
        "resource": "school",
        "resource_id": school_id,
        "metadata": {
            "old_name": old_school["name"],
            "new_name": school["name"]
        },
    }).execute()
    
    logger.info(
        f"School updated: school_id={school_id}, old_name={old_school['name']}, "
        f"new_name={school['name']}, admin_id={current_user.user_id}"
    )
    
    return {
        "id": school["id"],
        "name": school["name"],
        "created_at": school["created_at"]
    }


@router.patch("/users/{user_id}/school")
async def assign_user_to_school(
    user_id: str,
    request: UserSchoolAssignRequest,
    current_user: UserPayload = Depends(require_admin),
):
    """
    Assign or move user to a specific school.
    Validates user and school existence, logs action to audit_log.
    """
    supabase = get_supabase_client()
    
    # Check if user exists
    user_result = supabase.table("users").select("id, email, school_id").eq(
        "id", user_id
    ).execute()
    
    if not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user = user_result.data[0]
    
    # Check if school exists
    school_result = supabase.table("schools").select("id, name").eq(
        "id", request.school_id
    ).execute()
    
    if not school_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School not found"
        )
    
    school = school_result.data[0]
    
    # Update user's school_id
    update_result = supabase.table("users").update({
        "school_id": request.school_id
    }).eq("id", user_id).execute()
    
    if not update_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign user to school"
        )
    
    # Log to audit_log
    supabase.table("audit_log").insert({
        "user_id": current_user.user_id,
        "action": "user.school_assign",
        "resource": "user",
        "resource_id": user_id,
        "metadata": {
            "user_id": user_id,
            "school_id": request.school_id,
            "school_name": school["name"]
        },
    }).execute()
    
    logger.info(
        f"User assigned to school: user_id={user_id}, school_id={request.school_id}, "
        f"school_name={school['name']}, admin_id={current_user.user_id}"
    )
    
    return {
        "user_id": user_id,
        "school_id": request.school_id,
        "school_name": school["name"]
    }
