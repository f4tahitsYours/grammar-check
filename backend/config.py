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

# Debug prints (temporary - remove after verification)
print(f"[CONFIG] SUPABASE_URL loaded: {bool(settings.supabase_url)}")
print(f"[CONFIG] SUPABASE_KEY loaded: {bool(settings.supabase_key)}")
