"""Project extraction helpers."""

from __future__ import annotations

import re
from typing import Any

from models.resume_schema import ProjectExtractionSchema
from services.llm.llm_client import LLMClient, get_default_llm_client

PROJECT_HINT_RE = re.compile(r"(?:project|built|developed|created|implemented)\s*[:\-]?\s*(?P<chunk>.+)", re.IGNORECASE)
PROJECT_SECTION_RE = re.compile(
    r"(?is)\bprojects?\b(.*?)(?=\n\s*(?:technical skills|skills|experience|education|certifications|achievements)\b|\Z)"
)
TECHNOLOGY_RE = re.compile(r"\b([A-Z][A-Za-z0-9+.#-]*(?:\s?[A-Z][A-Za-z0-9+.#-]*)?)\b")
METRIC_RE = re.compile(r"\b\d+(?:\.\d+)?%?|\b(?:improved|reduced|increased|decreased|saved|generated)\b", re.IGNORECASE)


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
                projects.append(_normalize_project(validated.model_dump()))
                continue

        technologies = _parse_technologies(chunk)[:8]
        metrics = METRIC_RE.findall(chunk)[:3]
        projects.append(
            ProjectExtractionSchema(
                title=_derive_title(chunk),
                description=chunk[:300],
                technologies=technologies,
                impact_metrics=[m.strip() for m in metrics],
                complexity=_complexity_from_text(chunk),
                project_score=_score_project(chunk, technologies, metrics),
            ).model_dump()
        )

    return projects


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


def _split_project_candidates(text: str) -> list[str]:
    section_match = PROJECT_SECTION_RE.search(text)
    source = section_match.group(1) if section_match else text
    lines = [line.strip() for line in source.splitlines() if line.strip()]
    chunks: list[str] = []
    current: list[str] = []

    for line in lines:
        if re.match(r"^[A-Z][A-Za-z0-9&/().,:\-\s]{3,80}\s*\|", line) or re.match(
            r"^[A-Z][A-Za-z0-9&/().,:\-\s]{3,80}:\s*", line
        ):
            if current:
                chunks.append(" ".join(current).strip())
            current = [line]
            continue
        if line.startswith(("-", "•", "*")):
            current.append(line)
            continue
        if current:
            current.append(line)

    if current:
        chunks.append(" ".join(current).strip())

    if not chunks:
        fallback = list(PROJECT_HINT_RE.finditer(source))
        chunks = [match.group("chunk").strip() for match in fallback]

    return [chunk for chunk in chunks if len(chunk) > 20]


def _derive_title(chunk: str) -> str:
    first_line = chunk.splitlines()[0].strip()
    title = re.split(r"\s*[|:-]\s*", first_line, maxsplit=1)[0].strip()
    return title[:80].strip(" .:-") or "Project"


def _normalize_project(project: dict[str, Any]) -> dict[str, Any]:
    """Normalize an LLM-produced project payload to the expected shape."""

    return {
        "title": str(project.get("title", "")).strip(),
        "description": str(project.get("description", "")).strip()[:300],
        "technologies": list(project.get("technologies", []) or [])[:8],
        "impact_metrics": list(project.get("impact_metrics", []) or [])[:3],
        "complexity": str(project.get("complexity", "")).strip(),
        "project_score": int(project.get("project_score", 0) or 0),
    }


def _validate_project(payload: dict[str, Any]) -> ProjectExtractionSchema | None:
    try:
        return ProjectExtractionSchema.model_validate(payload)
    except Exception:
        return None
