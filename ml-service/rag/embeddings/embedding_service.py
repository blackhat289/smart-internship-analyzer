from __future__ import annotations

from functools import lru_cache

from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> list[float]:
    """
    Generate semantic embeddings using Sentence Transformers.
    """

    text = text.strip()

    if not text:
        return [0.0] * 384

    model = get_model()

    embedding = model.encode(
        text,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    return embedding.tolist()