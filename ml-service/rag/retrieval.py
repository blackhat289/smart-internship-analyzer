"""Retrieval helpers for RAG queries."""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

try:  # pragma: no cover - optional dependency
    import faiss  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    faiss = None

from rag.embeddings.embedding_service import embed_text

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
VECTORSTORE_DIR = BASE_DIR / "vectorstore" / "faiss_index"
INDEX_PATH = VECTORSTORE_DIR / "index.faiss"
METADATA_PATH = VECTORSTORE_DIR / "metadata.json"


@lru_cache(maxsize=1)
def _load_metadata() -> list[dict[str, Any]]:
    if not METADATA_PATH.exists():
        return []
    try:
        payload = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        return payload if isinstance(payload, list) else []
    except Exception as exc:
        logger.warning("Unable to load FAISS metadata: %s", exc)
        return []


def retrieve(query: str, *, top_k: int = 5, source_filter: str | None = None) -> list[dict[str, Any]]:
    """Retrieve the top-k relevant documents."""

    if not query.strip():
        return []

    metadata = _load_metadata()
    if not metadata:
        return []

    query_vector = embed_text(query)
    ranked = _rank_documents(query_vector, metadata, top_k=top_k, source_filter=source_filter)
    return ranked


def _rank_documents(
    query_vector: list[float],
    metadata: list[dict[str, Any]],
    *,
    top_k: int,
    source_filter: str | None,
) -> list[dict[str, Any]]:
    candidates = [doc for doc in metadata if not source_filter or doc.get("source") == source_filter]
    if not candidates:
        return []

    if faiss is not None and INDEX_PATH.exists():
        try:
            index = faiss.read_index(str(INDEX_PATH))
            if index.ntotal > 0:
                import numpy as np

                scores, indices = index.search(np.asarray([query_vector], dtype="float32"), min(top_k, index.ntotal))
                results: list[dict[str, Any]] = []
                for score, idx in zip(scores[0], indices[0]):
                    if idx < 0 or idx >= len(metadata):
                        continue
                    item = dict(metadata[idx])
                    if source_filter and item.get("source") != source_filter:
                        continue
                    item["score"] = float(score)
                    results.append(item)
                    if len(results) >= top_k:
                        break
                return results
        except Exception as exc:
            logger.warning("FAISS retrieval failed, falling back to local ranking: %s", exc)

    return _local_rank(query_vector, candidates, top_k=top_k)


def _local_rank(query_vector: list[float], docs: list[dict[str, Any]], *, top_k: int) -> list[dict[str, Any]]:
    scored: list[dict[str, Any]] = []
    for doc in docs:
        doc_vector = embed_text(_document_text(doc))
        score = _cosine_similarity(query_vector, doc_vector)
        item = dict(doc)
        item["score"] = score
        scored.append(item)
    scored.sort(key=lambda item: item["score"], reverse=True)
    return scored[:top_k]


def _document_text(doc: dict[str, Any]) -> str:
    parts = [str(doc.get("title", "")), str(doc.get("role", "")), str(doc.get("domain", "")), str(doc.get("description", ""))]
    return " ".join(part for part in parts if part).strip()


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = sum(a * a for a in left) ** 0.5
    right_norm = sum(b * b for b in right) ** 0.5
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)
