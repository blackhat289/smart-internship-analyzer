"""Skill extraction helpers."""

from __future__ import annotations

from utils.skill_catalog import SKILL_CATALOG

SKILL_OUTPUT_KEYS = (
    "programming",
    "frontend",
    "backend",
    "database",
    "cloud",
    "machine_learning",
    "tools",
)


def _contains_skill(text: str, skill: str) -> bool:
    normalized_text = text.lower()
    normalized_skill = skill.lower()
    return normalized_skill in normalized_text


def extract_skills(text: str) -> dict[str, list[str]]:
    """Extract categorized skills from résumé text."""

    categorized: dict[str, list[str]] = {key: [] for key in SKILL_OUTPUT_KEYS}
    if not text.strip():
        return categorized

    for category, skills in SKILL_CATALOG.items():
        seen = set()
        for skill in skills:
            if _contains_skill(text, skill) and skill not in seen:
                categorized[category].append(skill)
                seen.add(skill)

    return categorized
