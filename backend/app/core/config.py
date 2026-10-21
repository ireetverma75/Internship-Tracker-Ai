from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./internships.db"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    AI_PROVIDER: str = "demo"
    AI_API_KEY: Optional[str] = None
    CORS_ORIGINS: str = "http://localhost:3000"
    DEBUG: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
