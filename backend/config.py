# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    SUPABASE_URL: str = "http://localhost:8000"
    SUPABASE_KEY: str = "anon-key"
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    JWT_SECRET: str = "super-secret-jwt-key"
    JWT_ALGORITHM: str = "HS256"
    OPENAI_API_KEY: str = ""
    LANGUAGETOOL_URL: str = "https://api.languagetool.org/v2"
    ENVIRONMENT: str = "development"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
