"""Retrieval layer."""

from __future__ import annotations

from functools import lru_cache

from app.config import get_settings
from app.rag.embeddings import EmbeddingService
from app.rag.knowledge_base_loader import load_knowledge_base
from app.rag.vector_store import FaissStore


def build_retrieval_query(domain: str, skills: list[str], gaps: list[str]) -> str:
    parts = [domain, " ".join(dict.fromkeys(skills)), " ".join(dict.fromkeys(gaps))]
    return " ".join(part for part in parts if part).strip()


@lru_cache(maxsize=1)
def get_rag_store() -> FaissStore:
    settings = get_settings()
    embeddings = EmbeddingService(settings.embedding_model)
    store = FaissStore(embeddings, settings.faiss_index_path, settings.faiss_meta_path)
    if not store.load():
        documents = load_knowledge_base(settings.knowledge_base_path)
        if documents:
            store.build(documents)
    return store


def retrieve_context(store: FaissStore, domain: str, skills: list[str], gaps: list[str], top_k: int = 5) -> list[dict]:
    query = build_retrieval_query(domain, skills, gaps)
    if not query:
        return []
    return [dict(doc.metadata, score=doc.score) for doc in store.search(query, top_k=top_k)]


def retrieve_context_for_candidate(domain: str, skills: list[str], gaps: list[str], top_k: int = 5) -> list[dict]:
    return retrieve_context(get_rag_store(), domain, skills, gaps, top_k=top_k)
