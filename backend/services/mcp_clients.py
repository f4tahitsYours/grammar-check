from typing import Any, Dict
from supabase import create_client, Client
from backend.config import settings

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
            self._client = create_client(settings.supabase_url, settings.supabase_key)
        return self._client
    
    def _get_admin_client(self) -> Client:
        """Lazy initialization of Supabase admin client."""
        if self._admin_client is None:
            self._admin_client = create_client(
                settings.supabase_url, 
                settings.supabase_service_key or settings.supabase_key
            )
        return self._admin_client

    async def sign_in(self, email: str, password: str) -> dict:
        client = self._get_client()
        response = client.auth.sign_in_with_password({"email": email, "password": password})
        if not response.user:
            raise ValueError("Invalid credentials")
        return {
            "user": response.user,
            "session": response.session
        }

    async def sign_up(self, email: str, password: str, metadata: dict) -> dict:
        client = self._get_client()
        response = client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": metadata
            }
        })
        if not response.user:
            raise ValueError("Sign up failed")
        return {
            "user": response.user
        }
        
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
    """MCP client for OpenAI poster generation (GPT-4o-mini + DALL-E 3)."""
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
        Generate image using DALL-E 3.
        
        Returns:
            str: Image URL from DALL-E response
        """
        client = self._get_client()
        response = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        
        return response.data[0].url
    
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
        
        # Read audio bytes from response
        audio_bytes = b""
        async for chunk in response.iter_bytes():
            audio_bytes += chunk
        
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
