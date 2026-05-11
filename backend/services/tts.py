"""
Text-to-Speech service for student submissions.
"""

import logging
from typing import Optional
from datetime import datetime
from supabase import create_client, Client

from backend.config import settings
from backend.services.mcp_clients import OpenAITTSMCP

logger = logging.getLogger(__name__)


class TTSGenerationError(Exception):
    """Exception raised when TTS generation fails."""
    pass


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for storage operations."""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key or settings.supabase_key
    )


async def generate_tts(corrected_text: str, submission_id: str) -> Optional[str]:
    """
    Generate audio from corrected text using TTS.
    
    Args:
        corrected_text: The corrected text to convert to speech
        submission_id: ID of the submission for filename generation
        
    Returns:
        URL to generated audio file, or None if generation fails
        
    Raises:
        TTSGenerationError: If generation or upload fails
    """
    try:
        # Step 1: Cost guard - truncate to 3000 characters
        text = corrected_text[:3000]
        
        if len(corrected_text) > 3000:
            logger.warning(
                f"TTS input truncated from {len(corrected_text)} to 3000 chars"
            )
        
        # Step 2: Initialize OpenAI TTS MCP
        tts_mcp = OpenAITTSMCP(api_key=settings.openai_api_key)
        
        # Step 3: Generate audio using TTS-1
        audio_bytes = await tts_mcp.generate_audio(text)
        
        # Calculate estimated cost: $15 per 1M characters
        estimated_cost_usd = round(len(text) / 1_000_000 * 15, 6)
        
        logger.info(
            f"TTS call made, chars={len(text)}, "
            f"estimated_cost_usd={estimated_cost_usd}"
        )
        
        # Step 4: Generate filename
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"{submission_id}_{timestamp}.mp3"
        
        # Step 5: Upload to Supabase Storage
        supabase = get_supabase_client()
        
        upload_result = supabase.storage.from_("audio").upload(
            path=filename,
            file=audio_bytes,
            file_options={"content-type": "audio/mpeg"}
        )
        
        # Step 6: Get public URL
        public_url = supabase.storage.from_("audio").get_public_url(filename)
        
        logger.info(f"TTS audio uploaded successfully: {filename}")
        
        return public_url
        
    except Exception as e:
        logger.error(f"TTS generation failed: {e}", exc_info=True)
        raise TTSGenerationError(f"Failed to generate TTS: {str(e)}")
