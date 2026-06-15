"""Course recommendation helpers."""

from __future__ import annotations

import logging
from typing import Mapping, Sequence

from rag.retrieval import retrieve

logger = logging.getLogger(__name__)


def recommend_courses(
    profile: Mapping[str, object],
    missing_skills: Sequence[str],
    *,
    top_k: int = 5,
) -> dict[str, list[dict[str, object]]]:
    """Recommend courses for the candidate based on missing skills."""

    query = _build_query(profile, missing_skills)
    results = retrieve(query, top_k=max(top_k, len(missing_skills) or top_k), source_filter="courses")
    recommended_courses = [
        {
            "title": item.get("title", item.get("name", "")),
            "description": item.get("description", ""),
            "url": item.get("url", ""),
            "match_score": round(float(item.get("score", 0.0)) * 100, 2),
        }
        for item in results
    ]
    return {"recommended_courses": recommended_courses[:top_k]}


def _build_query(profile: Mapping[str, object], missing_skills: Sequence[str]) -> str:
    domain = str(profile.get("primary_domain", "") or profile.get("domain", "")).strip()
    parts = [domain, " ".join(missing_skills)]
    return " ".join(part for part in parts if part).strip() or "software development"
