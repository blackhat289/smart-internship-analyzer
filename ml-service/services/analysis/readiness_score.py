"""Readiness score calculation helpers."""

from __future__ import annotations

from typing import Mapping, Sequence


def calculate_readiness_score(data: Mapping[str, object]) -> dict[str, int]:
    """Calculate a weighted readiness score."""

    skills_score = _coerce_score(data.get("skills_score") or data.get("skills"))
    projects_score = _coerce_score(data.get("projects_score") or data.get("projects"))
    experience_score = _coerce_score(data.get("experience_score") or data.get("experience"))
    certification_score = _coerce_score(data.get("certification_score") or data.get("certifications"))
    ats_score = _coerce_score(data.get("ats_score") or data.get("ats"))

    overall = round(
        skills_score * 0.30
        + projects_score * 0.35
        + experience_score * 0.20
        + certification_score * 0.10
        + ats_score * 0.05
    )

    return {
        "overall": _clamp(overall),
        "skills_score": skills_score,
        "projects_score": projects_score,
        "experience_score": experience_score,
        "certification_score": certification_score,
    }


def _coerce_score(value: object) -> int:
    if value is None:
        return 0
    if isinstance(value, (int, float)):
        return _clamp(int(round(value)))
    if isinstance(value, Mapping):
        if "score" in value:
            return _coerce_score(value["score"])
        if "items" in value and isinstance(value["items"], Sequence):
            return _clamp(min(100, len(value["items"]) * 10))
        return _clamp(min(100, len(value) * 10))
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        return _clamp(min(100, len(value) * 10))
    try:
        return _clamp(int(str(value)))
    except (TypeError, ValueError):
        return 0


def _clamp(value: int) -> int:
    return max(0, min(100, value))
