"""Roadmap generation helpers."""

from __future__ import annotations

from typing import Sequence


def generate_roadmap(career_domain: str, missing_skills: Sequence[str]) -> dict[str, list[dict[str, object]]]:
    """Generate a learning roadmap for the candidate."""

    roadmap: list[dict[str, object]] = []
    for index, technology in enumerate(list(dict.fromkeys(missing_skills)), start=1):
        roadmap.append({"step": index, "technology": technology})
    if not roadmap and career_domain:
        roadmap.append({"step": 1, "technology": career_domain})
    return {"learning_roadmap": roadmap}
