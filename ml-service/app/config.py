"""Environment settings for the ML service."""

from __future__ import annotations

from functools import lru_cache
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Resume Analyzer ML Service"
    app_version: str = "2.0.0"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    embedding_model: str = "all-MiniLM-L6-v2"
    knowledge_base_path: str = "knowledge_base"
    faiss_index_path: str = "knowledge_base/faiss.index"
    faiss_meta_path: str = "knowledge_base/faiss_meta.json"
    max_upload_mb: int = 10


@lru_cache
def get_settings() -> Settings:
    return Settings()

