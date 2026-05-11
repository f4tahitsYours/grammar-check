"""
Metrics recording service for system monitoring.
"""

import logging
from typing import Optional
from datetime import datetime, date
from supabase import create_client, Client

from backend.config import settings

logger = logging.getLogger(__name__)

# Cost constants (USD)
COST_PER_LT_CALL: float = 0.0  # LanguageTool is free
COST_PER_LLM_CALL: float = 0.0001  # GPT-4o-mini approximate cost per call
COST_PER_POSTER_CALL: float = 0.0  # Placeholder for Phase 7
COST_PER_TTS_CALL: float = 0.0  # Placeholder for Phase 7


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for metrics operations."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key or settings.supabase_key
    )


async def record_pipeline_metric(
    source: str,
    fallback_used: bool,
    word_count: int,
    error_count: int,
    score: int,
    user_id: Optional[str] = None
) -> None:
    """
    Record pipeline execution metrics to system_metrics table.
    
    Aggregates metrics by day. If a record for today exists, updates it.
    Otherwise, creates a new record.
    
    Args:
        source: "cache" or "pipeline"
        fallback_used: Whether fallback was used
        word_count: Word count of submission
        error_count: Error count found
        score: Final score
        user_id: Optional user ID
    """
    try:
        supabase = get_supabase_client()
        today = date.today().isoformat()
        
        # Get today's metrics record
        result = supabase.table("system_metrics").select("*").gte(
            "recorded_at", f"{today}T00:00:00"
        ).lte(
            "recorded_at", f"{today}T23:59:59"
        ).execute()
        
        if result.data:
            # Update existing record
            existing = result.data[0]
            
            # Calculate new averages
            old_total = existing["total_submissions"]
            new_total = old_total + 1
            
            old_avg_score = float(existing["avg_score"] or 0)
            new_avg_score = ((old_avg_score * old_total) + score) / new_total
            
            # Increment counters
            cache_hits = existing["cache_hits"] + (1 if source == "cache" else 0)
            cache_misses = existing["cache_misses"] + (1 if source == "pipeline" else 0)
            lt_calls = existing["lt_calls"] + (0 if source == "cache" else 1)
            llm_calls = existing["llm_calls"] + (0 if source == "cache" or fallback_used else 1)
            fallback_count = existing["fallback_count"] + (1 if fallback_used else 0)
            
            # Calculate cost increment
            cost_increment = 0.0
            if source == "pipeline":
                cost_increment += COST_PER_LT_CALL
                if not fallback_used:
                    cost_increment += COST_PER_LLM_CALL
            
            new_cost = float(existing["estimated_cost_usd"] or 0) + cost_increment
            
            # Update record
            supabase.table("system_metrics").update({
                "total_submissions": new_total,
                "cache_hits": cache_hits,
                "cache_misses": cache_misses,
                "lt_calls": lt_calls,
                "llm_calls": llm_calls,
                "fallback_count": fallback_count,
                "avg_score": round(new_avg_score, 2),
                "estimated_cost_usd": round(new_cost, 6),
            }).eq("id", existing["id"]).execute()
            
        else:
            # Create new record for today
            cache_hits = 1 if source == "cache" else 0
            cache_misses = 1 if source == "pipeline" else 0
            lt_calls = 0 if source == "cache" else 1
            llm_calls = 0 if source == "cache" or fallback_used else 1
            fallback_count = 1 if fallback_used else 0
            
            # Calculate cost
            cost = 0.0
            if source == "pipeline":
                cost += COST_PER_LT_CALL
                if not fallback_used:
                    cost += COST_PER_LLM_CALL
            
            supabase.table("system_metrics").insert({
                "recorded_at": datetime.utcnow().isoformat(),
                "total_submissions": 1,
                "cache_hits": cache_hits,
                "cache_misses": cache_misses,
                "lt_calls": lt_calls,
                "llm_calls": llm_calls,
                "fallback_count": fallback_count,
                "poster_calls": 0,
                "tts_calls": 0,
                "avg_score": score,
                "avg_latency_ms": None,  # Not tracked yet
                "estimated_cost_usd": round(cost, 6),
                "active_students": 0,  # Not tracked yet
                "active_teachers": 0,  # Not tracked yet
            }).execute()
        
        logger.info(
            f"Metrics recorded: source={source}, fallback={fallback_used}, "
            f"score={score}, user_id={user_id}"
        )
        
    except Exception as e:
        # Don't fail the request if metrics recording fails
        logger.error(f"Failed to record metrics: {e}", exc_info=True)
