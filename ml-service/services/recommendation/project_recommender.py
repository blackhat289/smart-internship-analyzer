"""Project recommendation helpers."""

from __future__ import annotations

from typing import Sequence

from rag.retrieval import retrieve


def recommend_projects(career_domain: str, missing_skills: Sequence[str], *, top_k: int = 5) -> dict[str, list[dict[str, object]]]:
    """Recommend projects aligned to a career domain and skill gaps."""

    query = " ".join(part for part in [career_domain, " ".join(missing_skills)] if part).strip()
    results = retrieve(query or career_domain or "project ideas", top_k=max(top_k, len(missing_skills) or top_k), source_filter="projects")
    suggested_projects = _consolidate_projects(results)
    return {"suggested_projects": suggested_projects[:top_k]}


def _consolidate_projects(results: Sequence[dict[str, object]]) -> list[dict[str, object]]:
    grouped: dict[str, dict[str, object]] = {}
    for item in results:
        title = str(item.get("title", "") or item.get("name", "")).strip()
        if not title:
            continue
        key = title.lower()
        existing = grouped.setdefault(
            key,
            {
                "title": title,
                "description": "",
                "technologies": [],
                "achievements": [],
                "complexity": "Medium",
                "duration": "",
                "match_score": 0.0,
            },
        )
        if not existing["description"]:
            existing["description"] = str(item.get("description", "") or item.get("summary", "")).strip()
        technologies = item.get("technologies", [])
        if not isinstance(technologies, list):
            technologies = item.get("skills", []) if isinstance(item.get("skills"), list) else []
        existing["technologies"] = _unique_list([*existing["technologies"], *technologies])
        achievements = item.get("achievements", [])
        if not isinstance(achievements, list):
            achievements = []
        existing["achievements"] = _unique_list([*existing["achievements"], *achievements])
        if item.get("complexity") and existing["complexity"] == "Medium":
            existing["complexity"] = str(item.get("complexity")).strip() or "Medium"
        if item.get("duration") and not existing["duration"]:
            existing["duration"] = str(item.get("duration")).strip()
        existing["match_score"] = max(existing["match_score"], round(float(item.get("score", 0.0)) * 100, 2))

    return list(grouped.values())


def _unique_list(values: Sequence[object]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for value in values:
        text = str(value or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        output.append(text)
    return output
