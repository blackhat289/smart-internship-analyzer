"""Embedding helpers."""

from __future__ import annotations

class EmbeddingService:
    def __init__(self, model_name: str) -> None:
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(model_name)

    def embed_texts(self, texts: list[str]):
        return self.model.encode(texts, normalize_embeddings=True)

    def embed_query(self, text: str):
        return self.model.encode([text], normalize_embeddings=True)[0]
