"""Project extraction helpers."""

from __future__ import annotations

import re
from typing import Any

from models.resume_schema import ProjectExtractionSchema
from services.llm.llm_client import LLMClient, get_default_llm_client

PROJECT_HINT_RE = re.compile(r"(?:project|built|developed|created|implemented)\s*[:\-]?\s*(?P<chunk>.+)", re.IGNORECASE)
TECHNOLOGY_RE = re.compile(r"\b([A-Z][A-Za-z0-9+.#-]*(?:\s?[A-Z][A-Za-z0-9+.#-]*)?)\b")
METRIC_RE = re.compile(r"\b\d+(?:\.\d+)?%?|\b(?:improved|reduced|increased|decreased|saved|generated)\b", re.IGNORECASE)


def _parse_technologies(text: str) -> list[str]:
    candidates: list[str] = []
    for item in re.split(r"[,/|]", text):
        token = item.strip(" .:-")
        if 2 <= len(token) <= 40:
            candidates.append(token)
    for match in TECHNOLOGY_RE.findall(text):
        token = match.strip()
        if 2 <= len(token) <= 40:
            candidates.append(token)
    return list(dict.fromkeys(candidates))


def _complexity_from_text(text: str) -> str:
    lowered = text.lower()
    if any(word in lowered for word in ("enterprise", "distributed", "scalable", "multi-user", "real-time")):
        return "high"
    if any(word in lowered for word in ("api", "dashboard", "automation", "analytics")):
        return "medium"
    return "low"


def _score_project(text: str, technologies: list[str], metrics: list[str]) -> int:
    score = 0
    score += min(len(technologies) * 10, 30)
    score += min(len(metrics) * 15, 30)
    if len(text) > 200:
        score += 20
    if len(text) > 500:
        score += 10
    return min(score, 100)


def extract_projects(text: str, llm_client: LLMClient | None = None) -> list[dict[str, Any]]:
    """Extract structured projects using regex first and an optional LLM fallback."""

    if not text.strip():
        return []

    projects: list[dict[str, Any]] = []
    sections = _split_project_candidates(text)
    client = llm_client or get_default_llm_client()

    for chunk in sections[:5]:
        structured = client.generate_json(
            "Extract one project from the following résumé text. Return JSON with title, description, technologies, impact_metrics, complexity, project_score.",
            schema_hint=ProjectExtractionSchema().model_dump(),
        )
        if structured:
            validated = _validate_project(structured)
            if validated:
                projects.append(validated.model_dump())
                continue

        technologies = _parse_technologies(chunk)
        metrics = METRIC_RE.findall(chunk)
        projects.append(
            ProjectExtractionSchema(
                title=chunk[:80].strip(" .:-"),
                description=chunk,
                technologies=technologies,
                impact_metrics=[m.strip() for m in metrics],
                complexity=_complexity_from_text(chunk),
                project_score=_score_project(chunk, technologies, metrics),
            ).model_dump()
        )

    return projects


def _normalize_project(project: dict[str, Any]) -> dict[str, Any]:
    """Normalize an LLM-produced project payload to the expected shape."""

    return {
        "title": str(project.get("title", "")).strip(),
        "description": str(project.get("description", "")).strip(),
        "technologies": list(project.get("technologies", []) or []),
        "impact_metrics": list(project.get("impact_metrics", []) or []),
        "complexity": str(project.get("complexity", "")).strip(),
        "project_score": int(project.get("project_score", 0) or 0),
    }


def _split_project_candidates(text: str) -> list[str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    chunks: list[str] = []
    current: list[str] = []
    for line in lines:
        lowered = line.lower()
        if re.match(r"^(project|projects)\b", lowered) and current:
            chunks.append(" ".join(current).strip())
            current = [line]
        elif line.startswith(("-", "•", "*")) and current:
            current.append(line)
        else:
            current.append(line)
    if current:
        chunks.append(" ".join(current).strip())
    return [chunk for chunk in chunks if len(chunk) > 20]


def _validate_project(payload: dict[str, Any]) -> ProjectExtractionSchema | None:
    try:
        return ProjectExtractionSchema.model_validate(payload)
    except Exception:
        return None
