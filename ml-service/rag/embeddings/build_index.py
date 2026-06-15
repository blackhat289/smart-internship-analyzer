"""Index building utilities for vector search."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

try:  # pragma: no cover - optional dependency
    import faiss  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    faiss = None

from rag.embeddings.embedding_service import embed_text

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
VECTORSTORE_DIR = BASE_DIR / "vectorstore" / "faiss_index"
INDEX_PATH = VECTORSTORE_DIR / "index.faiss"
METADATA_PATH = VECTORSTORE_DIR / "metadata.json"


@dataclass(slots=True)
class IndexedDocument:
    """Indexed document payload."""

    source: str
    category: str
    text: str
    metadata: dict[str, Any]


def build_index() -> dict[str, Any]:
    """Build and persist the FAISS index from knowledge-source JSON files."""

    documents = list(_load_documents())
    VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

    if not documents:
        _write_metadata([])
        if faiss is not None:
            empty_index = faiss.IndexFlatIP(384)
            faiss.write_index(empty_index, str(INDEX_PATH))
        logger.info("No knowledge-source documents found; wrote empty index.")
        return {"documents_indexed": 0, "index_path": str(INDEX_PATH)}

    vectors = [embed_text(document.text) for document in documents]
    dimension = len(vectors[0])

    if faiss is not None:
        index = faiss.IndexFlatIP(dimension)
        index.add(_to_float_matrix(vectors))
        faiss.write_index(index, str(INDEX_PATH))
        logger.info("FAISS index built with %s documents", len(documents))
    else:
        logger.warning("faiss-cpu is unavailable; index metadata only will be persisted.")

    _write_metadata([document.__dict__ for document in documents])
    return {"documents_indexed": len(documents), "index_path": str(INDEX_PATH)}


def _load_documents() -> Iterable[IndexedDocument]:
    for file_path in sorted(DATA_DIR.glob("*.json")):
        try:
            payload = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning("Skipping malformed knowledge source %s: %s", file_path.name, exc)
            continue

        if isinstance(payload, list):
            records = payload
        elif isinstance(payload, dict):
            records = payload.get("items", [])
        else:
            records = []

        for record in records:
            if not isinstance(record, dict):
                continue
            text = _document_text(record)
            if not text:
                continue
            yield IndexedDocument(
                source=file_path.stem,
                category=str(record.get("category", file_path.stem)),
                text=text,
                metadata={key: value for key, value in record.items() if key != "text"},
            )


def _document_text(record: dict[str, Any]) -> str:
    parts = [
        str(record.get("title", "")),
        str(record.get("role", "")),
        str(record.get("domain", "")),
        str(record.get("description", "")),
        " ".join(str(item) for item in record.get("skills", []) if item),
        " ".join(str(item) for item in record.get("tags", []) if item),
    ]
    return " ".join(part for part in parts if part).strip()


def _write_metadata(metadata: list[dict[str, Any]]) -> None:
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def _to_float_matrix(vectors: list[list[float]]):
    if faiss is None:
        raise RuntimeError("faiss is unavailable")
    import numpy as np

    return np.asarray(vectors, dtype="float32")
