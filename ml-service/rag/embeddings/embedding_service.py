"""Embedding service helpers."""

from __future__ import annotations

import hashlib
import logging
import os
from typing import Final

import httpx

logger = logging.getLogger(__name__)

DEFAULT_EMBEDDING_DIM: Final[int] = 384


def embed_text(text: str) -> list[float]:
    """Create an embedding for text using an OpenAI-compatible API or a stable fallback."""

    cleaned = text.strip()
    if not cleaned:
        return [0.0] * DEFAULT_EMBEDDING_DIM

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    if api_key:
        try:
            return _embed_via_openai(cleaned, api_key=api_key, base_url=base_url, model=model)
        except Exception as exc:  # pragma: no cover - network/provider fallback
            logger.warning("Embedding API failed, falling back to deterministic embeddings: %s", exc)

    return _fallback_embedding(cleaned)


def _embed_via_openai(text: str, *, api_key: str, base_url: str, model: str) -> list[float]:
    payload = {"model": model, "input": text}
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    response = httpx.post(f"{base_url}/embeddings", json=payload, headers=headers, timeout=30.0)
    response.raise_for_status()
    data = response.json()
    embedding = data["data"][0]["embedding"]
    return [float(value) for value in embedding]


def _fallback_embedding(text: str, dimension: int = DEFAULT_EMBEDDING_DIM) -> list[float]:
    """Generate a deterministic embedding when no external model is available."""

    vector = [0.0] * dimension
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimension
        vector[index] += 1.0

    norm = sum(value * value for value in vector) ** 0.5
    if norm == 0:
        return vector
    return [value / norm for value in vector]
