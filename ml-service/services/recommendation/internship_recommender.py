"""Internship recommendation helpers."""

from __future__ import annotations

from typing import Mapping, Sequence

from rag.retrieval import retrieve


def recommend_internships(
    skills: Mapping[str, Sequence[str]] | Sequence[str],
    projects: Sequence[Mapping[str, object]],
    domain: str,
    *,
    top_k: int = 5,
) -> dict[str, list[dict[str, object]]]:
    """Recommend internships and rank them by skill overlap."""

    query = _build_query(skills, projects, domain)
    results = retrieve(query, top_k=max(top_k, 10), source_filter="internships")

    candidate_skills = _flatten_skills(skills)
    project_titles = {str(project.get("title", "")).lower() for project in projects}

    internships: list[dict[str, object]] = []
    for item in results[:top_k]:
        required_skills = _normalize_list(item.get("required_skills", []))
        missing = [skill for skill in required_skills if not _has_skill(candidate_skills, skill)]
        match_score = _compute_match_score(candidate_skills, project_titles, domain, required_skills, item)
        internships.append(
            {
                "role": item.get("role", item.get("title", "")),
                "match_score": match_score,
                "required_skills_missing": missing,
            }
        )

    return {"internship_recommendations": internships}


def _build_query(
    skills: Mapping[str, Sequence[str]] | Sequence[str],
    projects: Sequence[Mapping[str, object]],
    domain: str,
) -> str:
    skill_text = " ".join(_flatten_skills(skills))
    project_text = " ".join(str(project.get("title", "")) for project in projects)
    return " ".join(part for part in [domain, skill_text, project_text] if part).strip()


def _flatten_skills(skills: Mapping[str, Sequence[str]] | Sequence[str]) -> list[str]:
    if isinstance(skills, Mapping):
        return [skill for values in skills.values() for skill in (values or [])]
    return list(skills)


def _normalize_list(values: object) -> list[str]:
    if isinstance(values, Sequence) and not isinstance(values, (str, bytes)):
        return [str(value) for value in values if str(value).strip()]
    return []


def _has_skill(candidate_skills: Sequence[str], required_skill: str) -> bool:
    required = required_skill.lower()
    return any(required in skill.lower() or skill.lower() in required for skill in candidate_skills)


def _compute_match_score(
    candidate_skills: Sequence[str],
    project_titles: set[str],
    domain: str,
    required_skills: Sequence[str],
    item: Mapping[str, object],
) -> int:
    score = 0
    score += min(len([skill for skill in required_skills if _has_skill(candidate_skills, skill)]) * 15, 60)
    score += 10 if domain and domain.lower() in str(item.get("domain", "")).lower() else 0
    score += 10 if any(title and title in str(item.get("description", "")).lower() for title in project_titles) else 0
    return min(score, 100)
