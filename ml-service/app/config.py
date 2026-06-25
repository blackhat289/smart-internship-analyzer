"""Environment settings for the ML service."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Resume Analyzer ML Service"
    app_version: str = "2.0.0"
    # OpenRouter settings
    openrouter_api_key: str | None = None
    openrouter_model: str = "openai/gpt-4o-mini"
    openrouter_site_url: str = "http://localhost:5173"
    openrouter_site_name: str = "Smart Internship Analyzer"
    ollama_timeout_seconds: int = 120  # reused as general LLM timeout
    embedding_model: str = "all-MiniLM-L6-v2"
    base_dir: str = str(Path(__file__).resolve().parents[1])
    knowledge_base_path: str = str(Path(__file__).resolve().parents[1] / "knowledge_base")
    faiss_index_path: str = str(Path(__file__).resolve().parents[1] / "knowledge_base" / "faiss.index")
    faiss_meta_path: str = str(Path(__file__).resolve().parents[1] / "knowledge_base" / "faiss_meta.json")
    max_upload_mb: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
