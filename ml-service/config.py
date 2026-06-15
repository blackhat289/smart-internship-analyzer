"""Application configuration for the ML service."""

from pydantic import BaseModel


class Settings(BaseModel):
    """Minimal settings container for environment-driven configuration."""

    app_name: str = "Smart Internship Analyzer ML Service"
    app_version: str = "1.0.0"
    host: str = "0.0.0.0"
    port: int = 8000


settings = Settings()
