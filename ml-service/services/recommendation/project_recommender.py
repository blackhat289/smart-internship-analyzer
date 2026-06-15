"""Project recommendation helpers."""

from __future__ import annotations

from typing import Sequence

from rag.retrieval import retrieve


def recommend_projects(career_domain: str, missing_skills: Sequence[str], *, top_k: int = 5) -> dict[str, list[dict[str, object]]]:
    """Recommend projects aligned to a career domain and skill gaps."""

    query = " ".join(part for part in [career_domain, " ".join(missing_skills)] if part).strip()
    results = retrieve(query or career_domain or "project ideas", top_k=max(top_k, len(missing_skills) or top_k), source_filter="projects")
    suggested_projects = [
        {
            "title": item.get("title", ""),
            "description": item.get("description", ""),
            "technologies": item.get("skills", []) if isinstance(item.get("skills"), list) else [],
            "match_score": round(float(item.get("score", 0.0)) * 100, 2),
        }
        for item in results
    ]
    return {"suggested_projects": suggested_projects[:top_k]}
