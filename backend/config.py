# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    supabase_url: str = "http://localhost:8000"
    supabase_key: str = "anon-key"
    supabase_service_key: Optional[str] = None
    jwt_secret: str = "super-secret-jwt-key"
    jwt_algorithm: str = "HS256"
    openai_api_key: str = ""
    languagetool_url: str = "https://api.languagetool.org/v2"
    environment: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=["backend/.env", ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Debug prints for verification
print(f"[CONFIG] SUPABASE_URL: {settings.supabase_url}")
print(f"[CONFIG] SUPABASE_KEY: '{settings.supabase_key[:25]}...'")
print(f"[CONFIG] SERVICE_KEY: '{str(settings.supabase_service_key)[:25]}...'")
print(f"[CONFIG] OPENAI_API_KEY: '{settings.openai_api_key[:20]}...' (length: {len(settings.openai_api_key)})")
print(f"[CONFIG] OPENAI_API_KEY is {'EMPTY' if not settings.openai_api_key else 'SET'}")
