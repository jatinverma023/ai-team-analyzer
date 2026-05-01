from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    JWT_SECRET: str = "supersecret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        """Handle ALLOWED_ORIGINS as JSON array string or comma-separated string from env."""
        if isinstance(v, str):
            v = v.strip()
            # Try JSON first: '["url1","url2"]'
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Fall back to comma-separated: 'url1,url2'
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        extra="ignore",
    )


settings = Settings()
