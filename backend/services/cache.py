"""
Grammar cache service for PostgreSQL-backed caching.
"""

import logging
from typing import Optional
from supabase import create_client, Client

from backend.config import settings

logger = logging.getLogger(__name__)


class GrammarCache:
    """PostgreSQL-backed cache for grammar checking results."""
    
    def __init__(self):
        self._client: Client | None = None
    
    def _get_client(self) -> Client:
        """Lazy initialization of Supabase client with service role key."""
        if self._client is None:
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_service_key or settings.supabase_key
            )
        return self._client
    
    async def get(self, cache_key: str) -> Optional[dict]:
        """
        Retrieve cached result by hash key.
        
        Args:
            cache_key: SHA-256 hash of normalized input
            
        Returns:
            Cached result dict or None if not found
        """
        try:
            client = self._get_client()
            response = client.table("grammar_cache").select("*").eq(
                "input_hash", cache_key
            ).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Cache HIT for key: {cache_key[:8]}...")
                return response.data[0]
            
            logger.info(f"Cache MISS for key: {cache_key[:8]}...")
            return None
            
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
            return None
    
    async def set(
        self, 
        cache_key: str, 
        corrected_text: str,
        errors_json: list,
        error_breakdown: dict,
        score: int,
        grade: str,
        feedback: str
    ) -> bool:
        """
        Store result in cache.
        
        Args:
            cache_key: SHA-256 hash of normalized input
            corrected_text: Corrected text
            errors_json: Full error array as JSON
            error_breakdown: Error breakdown dict
            score: Calculated score
            grade: Letter grade
            feedback: Feedback text
            
        Returns:
            True if successful, False otherwise
        """
        try:
            client = self._get_client()
            client.table("grammar_cache").upsert({
                "input_hash": cache_key,
                "corrected_text": corrected_text,
                "errors_json": errors_json,
                "error_breakdown": error_breakdown,
                "score": score,
                "grade": grade,
                "feedback": feedback
            }).execute()
            
            logger.info(f"Cache WRITE for key: {cache_key[:8]}...")
            return True
            
        except Exception as e:
            logger.error(f"Cache write error: {e}")
            return False
