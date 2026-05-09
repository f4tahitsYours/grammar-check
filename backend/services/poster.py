"""
Poster generation service for student submissions.
"""

import logging
import httpx
from datetime import datetime
from supabase import create_client, Client

from backend.config import settings
from backend.services.mcp_clients import OpenAIPosterMCP

logger = logging.getLogger(__name__)


class PosterGenerationError(Exception):
    """Exception raised when poster generation fails."""
    pass


def get_supabase_client() -> Client:
    """Get Supabase client with service role key for storage operations."""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    )


async def generate_poster(corrected_text: str, submission_id: str) -> str:
    """
    Generate motivational poster from corrected text.
    
    Args:
        corrected_text: The corrected text to use for poster
        submission_id: ID of the submission for filename generation
        
    Returns:
        URL to generated poster image
        
    Raises:
        PosterGenerationError: If generation or upload fails
    """
    try:
        # Step 1: Initialize OpenAI Poster MCP
        poster_mcp = OpenAIPosterMCP(api_key=settings.OPENAI_API_KEY)
        
        # Step 2: Generate image description prompt using GPT-4o-mini
        prompt, input_tokens, output_tokens = await poster_mcp.generate_prompt(corrected_text)
        
        logger.info(
            f"Poster prompt generated, input_tokens={input_tokens}, "
            f"output_tokens={output_tokens}"
        )
        
        # Step 3: Generate image using DALL-E 3
        image_url = await poster_mcp.generate_image(prompt)
        
        logger.info("DALL-E call made, estimated_cost_usd=0.04")
        
        # Step 4: Download image bytes from DALL-E URL
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()
            image_bytes = response.content
        
        # Step 5: Generate filename
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"{submission_id}_{timestamp}.png"
        
        # Step 6: Upload to Supabase Storage
        supabase = get_supabase_client()
        
        upload_result = supabase.storage.from_("posters").upload(
            path=filename,
            file=image_bytes,
            file_options={"content-type": "image/png"}
        )
        
        # Step 7: Get public URL
        public_url = supabase.storage.from_("posters").get_public_url(filename)
        
        logger.info(f"Poster uploaded successfully: {filename}")
        
        return public_url
        
    except Exception as e:
        logger.error(f"Poster generation failed: {e}", exc_info=True)
        raise PosterGenerationError(f"Failed to generate poster: {str(e)}")
