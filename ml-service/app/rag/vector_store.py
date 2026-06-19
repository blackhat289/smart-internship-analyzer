"""FAISS vector store."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import faiss
import numpy as np

from app.rag.embeddings import EmbeddingService


@dataclass
class RetrievedDocument:
    text: str
    metadata: dict[str, object]
    score: float


class FaissStore:
    def __init__(self, embedding_service: EmbeddingService, index_path: str, meta_path: str) -> None:
        self.embedding_service = embedding_service
        self.index_path = Path(index_path)
        self.meta_path = Path(meta_path)
        self.index = None
        self.metadata: list[dict[str, object]] = []

    def build(self, documents: list[dict[str, object]]) -> None:
        if not documents:
            self.index = None
            self.metadata = []
            if self.index_path.exists():
                self.index_path.unlink()
            if self.meta_path.exists():
                self.meta_path.unlink()
            return
        texts = [doc["text"] for doc in documents]
        vectors = np.array(self.embedding_service.embed_texts(texts), dtype="float32")
        dimension = vectors.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(vectors)
        self.metadata = documents
        self._persist()

    def load(self) -> bool:
        if not self.index_path.exists() or not self.meta_path.exists():
            return False
        self.index = faiss.read_index(str(self.index_path))
        self.metadata = json.loads(self.meta_path.read_text(encoding="utf-8"))
        return True

    def search(self, query: str, top_k: int = 5) -> list[RetrievedDocument]:
        if self.index is None:
            loaded = self.load()
            if not loaded:
                return []
        if self.index is None or not self.metadata:
            return []
        query_vector = np.array([self.embedding_service.embed_query(query)], dtype="float32")
        top_k = max(1, min(top_k, len(self.metadata)))
        scores, indices = self.index.search(query_vector, top_k)
        results: list[RetrievedDocument] = []
        for score, index in zip(scores[0], indices[0]):
            if index < 0 or index >= len(self.metadata):
                continue
            metadata = self.metadata[index]
            results.append(RetrievedDocument(text=metadata["text"], metadata=metadata, score=float(score)))
        return results

    def _persist(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))
        self.meta_path.write_text(json.dumps(self.metadata, indent=2), encoding="utf-8")
