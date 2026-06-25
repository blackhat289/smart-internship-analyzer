"""Embedding helpers."""

from __future__ import annotations

import hashlib
import math


class EmbeddingService:
    def __init__(self, model_name: str) -> None:
        self.model = None
        self.model_name = model_name
        try:
            from sentence_transformers import SentenceTransformer

            self.model = SentenceTransformer(model_name)
        except Exception:
            self.model = None

    def embed_texts(self, texts: list[str]):
        if self.model is not None:
            return self.model.encode(texts, normalize_embeddings=True)
        return [self._fallback_embed(text) for text in texts]

    def embed_query(self, text: str):
        if self.model is not None:
            return self.model.encode([text], normalize_embeddings=True)[0]
        return self._fallback_embed(text)

    def _fallback_embed(self, text: str, dimensions: int = 384):
        tokens = [token for token in str(text).lower().split() if token]
        vector = [0.0] * dimensions
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % dimensions
            weight = 1.0 + (int.from_bytes(digest[4:8], "big") % 1000) / 1000.0
            vector[index] += weight
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]
