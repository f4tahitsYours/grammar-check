from typing import Any, Dict
from supabase import create_client, Client
from backend.config import settings
import logging

logger = logging.getLogger(__name__)

# Import Supabase/GoTrue error types for proper exception handling
try:
    from gotrue.errors import AuthApiError
except ImportError:
    try:
        from supabase_auth.errors import AuthApiError
    except ImportError:
        # Fallback if neither import works
        AuthApiError = Exception

class BaseMCPClient:
    tool_name: str
    
    async def call(self, input: dict) -> dict:
        raise NotImplementedError
        
    async def health_check(self) -> bool:
        raise NotImplementedError

class SupabaseAuthMCP(BaseMCPClient):
    tool_name = "supabase_auth"
    
    def __init__(self):
        self._client: Client | None = None
        self._admin_client: Client | None = None
    
    def _get_client(self) -> Client:
        """Lazy initialization of Supabase client."""
        if self._client is None:
            key_preview = settings.supabase_key[:20] if len(settings.supabase_key) > 20 else settings.supabase_key
            logger.info(f"Initializing Supabase client with anon key: {key_preview}...")
            self._client = create_client(settings.supabase_url, settings.supabase_key)
        return self._client
    
    def _get_admin_client(self) -> Client:
        """Lazy initialization of Supabase admin client."""
        if self._admin_client is None:
            service_key = settings.supabase_service_key or settings.supabase_key
            key_preview = service_key[:20] if len(service_key) > 20 else service_key
            logger.info(f"Initializing Supabase admin client with service key: {key_preview}...")
            self._admin_client = create_client(
                settings.supabase_url, 
                service_key
            )
        return self._admin_client

    async def sign_in(self, email: str, password: str) -> dict:
        client = self._get_client()
        logger.info(f"Attempting sign_in for email: {email}")
        try:
            response = client.auth.sign_in_with_password({"email": email, "password": password})
            if not response.user:
                raise ValueError("Invalid credentials - no user returned")
            return {
                "user": response.user,
                "session": response.session
            }
        except AuthApiError as e:
            logger.error(f"sign_in failed with AuthApiError: {str(e)}")
            # Convert to ValueError for consistent error handling
            raise ValueError(f"Authentication error: {str(e)}")
        except Exception as e:
            logger.error(f"sign_in failed with unexpected exception: {type(e).__name__}: {str(e)}")
            raise

    async def sign_up(self, email: str, password: str, metadata: dict) -> dict:
        client = self._get_client()
        logger.info(f"Attempting sign_up for email: {email}")
        try:
            response = client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": metadata
                }
            })
            logger.info(f"sign_up response received: user={response.user is not None}")
            if not response.user:
                raise ValueError("Sign up failed - no user returned")
            return {
                "user": response.user
            }
        except AuthApiError as e:
            # Supabase Auth API errors (including invalid API key)
            logger.error(f"sign_up failed with AuthApiError: {str(e)}")
            # Convert to ValueError for consistent error handling in auth.py
            if "already registered" in str(e).lower() or "already exists" in str(e).lower():
                raise ValueError(f"Email already registered: {str(e)}")
            raise ValueError(f"Authentication error: {str(e)}")
        except Exception as e:
            logger.error(f"sign_up failed with unexpected exception: {type(e).__name__}: {str(e)}")
            raise
        
    async def call(self, input: dict) -> dict:
        action = input.get("action")
        if action == "sign_in":
            return await self.sign_in(input["email"], input["password"])
        elif action == "sign_up":
            return await self.sign_up(input["email"], input["password"], input.get("metadata", {}))
        raise ValueError(f"Unknown action {action}")

    async def health_check(self) -> bool:
        try:
            return True
        except Exception:
            return False


# Note: LanguageToolMCP and OpenAIGrammarMCP are defined in their respective modules
# (backend/services/grammar/languagetool_client.py and backend/services/grammar/llm_refiner.py)
# to maintain separation of concerns and avoid circular imports.


class OpenAIPosterMCP(BaseMCPClient):
    """MCP client for OpenAI poster generation (GPT-4o-mini + GPT Image 1.5)."""
    tool_name = "openai_poster"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client = None
    
    def _get_client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            import openai
            self._client = openai.AsyncOpenAI(api_key=self.api_key)
        return self._client
    
    async def generate_prompt(self, corrected_text: str) -> tuple[str, int, int]:
        """
        Generate image description prompt using GPT-4o-mini.
        
        Returns:
            tuple: (prompt, input_tokens, output_tokens)
        """
        client = self._get_client()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            max_tokens=100,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Create a concise visual description for an "
                        "educational poster based on this student's text. "
                        "The image should be colorful, school-appropriate, "
                        "and illustrate the main topic. "
                        "Return ONLY the image generation prompt, "
                        "maximum 50 words. No preamble."
                    )
                },
                {
                    "role": "user",
                    "content": corrected_text
                }
            ]
        )
        
        prompt = response.choices[0].message.content.strip()
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        
        return prompt, input_tokens, output_tokens
    
    async def generate_image(self, prompt: str) -> str:
        """
        Generate image using GPT Image 1.5 (current flagship model).
        
        gpt-image-1.5 returns images as base64-encoded data by default.
        This method decodes the base64 data and uploads it to Supabase Storage.
        
        Returns:
            str: Public URL of uploaded image from Supabase Storage
        """
        import base64
        import uuid
        from datetime import datetime
        
        client = self._get_client()
        
        # Generate image (gpt-image-1.5 returns b64_json by default, no need to specify response_format)
        response = await client.images.generate(
            model="gpt-image-1.5",
            prompt=prompt,
            size="1024x1024",
            quality="high",  # Valid values for gpt-image-1.5: 'low', 'medium', 'high', 'auto'
            n=1
        )
        
        # Extract base64 data
        image_item = response.data[0]
        
        # gpt-image-1.5 may return either url or b64_json
        # Try url first (if OpenAI provides it), fallback to b64_json
        if hasattr(image_item, 'url') and image_item.url:
            logger.info(f"[POSTER] Received direct URL: {image_item.url}")
            return image_item.url
        
        # Otherwise, expect b64_json
        if not hasattr(image_item, 'b64_json') or not image_item.b64_json:
            logger.error("[POSTER] No b64_json or url data in response")
            raise ValueError("Invalid response from OpenAI: no base64 image data or URL")
        
        b64_data = image_item.b64_json
        logger.info(f"[POSTER] Received base64 image data (length: {len(b64_data)} chars)")
        
        # Decode base64 to bytes
        try:
            image_bytes = base64.b64decode(b64_data)
            logger.info(f"[POSTER] Decoded image: {len(image_bytes)} bytes")
        except Exception as e:
            logger.error(f"[POSTER] Failed to decode base64: {e}")
            raise ValueError(f"Failed to decode base64 image data: {e}")
        
        # Upload to Supabase Storage
        try:
            # Generate unique filename
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"poster_{timestamp}_{uuid.uuid4().hex[:8]}.png"
            
            # Initialize Supabase client for storage (use service key for full access)
            supabase = create_client(
                settings.supabase_url, 
                settings.supabase_service_key or settings.supabase_key
            )
            
            # Upload to 'posters' bucket
            # Note: Bucket must be created in Supabase dashboard with public access
            bucket_name = "posters"
            
            try:
                upload_response = supabase.storage.from_(bucket_name).upload(
                    path=filename,
                    file=image_bytes,
                    file_options={"content-type": "image/png", "upsert": "false"}
                )
                logger.info(f"[POSTER] Upload response: {upload_response}")
            except Exception as upload_error:
                error_msg = str(upload_error).lower()
                if "bucket" in error_msg and "not found" in error_msg:
                    logger.error(f"[POSTER] Bucket '{bucket_name}' does not exist")
                    raise ValueError(
                        f"Storage bucket '{bucket_name}' not found. "
                        f"Please create it in Supabase Dashboard → Storage → New Bucket → "
                        f"Name: 'posters', Public: Yes"
                    )
                else:
                    raise
            
            # Get public URL
            public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
            logger.info(f"[POSTER] Uploaded successfully: {public_url}")
            
            return public_url
            
        except Exception as e:
            logger.error(f"[POSTER] Storage upload failed: {e}")
            raise ValueError(f"Failed to upload image to storage: {e}")
    
    async def call(self, input: dict) -> dict:
        """Generic call interface for MCP."""
        action = input.get("action")
        if action == "generate_prompt":
            prompt, input_tokens, output_tokens = await self.generate_prompt(input["text"])
            return {"prompt": prompt, "input_tokens": input_tokens, "output_tokens": output_tokens}
        elif action == "generate_image":
            url = await self.generate_image(input["prompt"])
            return {"url": url}
        raise ValueError(f"Unknown action {action}")
    
    async def health_check(self) -> bool:
        """Check if OpenAI API is accessible."""
        try:
            client = self._get_client()
            await client.models.list()
            return True
        except Exception:
            return False


class OpenAITTSMCP(BaseMCPClient):
    """MCP client for OpenAI TTS-1."""
    tool_name = "openai_tts"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client = None
    
    def _get_client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            import openai
            self._client = openai.AsyncOpenAI(api_key=self.api_key)
        return self._client
    
    async def generate_audio(self, text: str) -> bytes:
        """
        Generate audio from text using TTS-1.
        
        Returns:
            bytes: Audio data in MP3 format
        """
        client = self._get_client()
        response = await client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text,
            response_format="mp3"
        )
        
        # Read audio bytes from async response
        # For AsyncOpenAI, use .aread() method to get full audio bytes
        audio_bytes = await response.aread()
        
        return audio_bytes
    
    async def call(self, input: dict) -> dict:
        """Generic call interface for MCP."""
        action = input.get("action")
        if action == "generate_audio":
            audio_bytes = await self.generate_audio(input["text"])
            return {"audio_bytes": audio_bytes}
        raise ValueError(f"Unknown action {action}")
    
    async def health_check(self) -> bool:
        """Check if OpenAI API is accessible."""
        try:
            client = self._get_client()
            await client.models.list()
            return True
        except Exception:
            return False
