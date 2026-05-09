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
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self.admin_client: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        )

    async def sign_in(self, email: str, password: str) -> dict:
        response = self.client.auth.sign_in_with_password({"email": email, "password": password})
        if not response.user:
            raise ValueError("Invalid credentials")
        return {
            "user": response.user,
            "session": response.session
        }

    async def sign_up(self, email: str, password: str, metadata: dict) -> dict:
        response = self.client.auth.sign_up({
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
