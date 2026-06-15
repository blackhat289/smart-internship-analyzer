"""Section detection helpers for resume parsing."""

from __future__ import annotations

import re
from typing import Final

SECTION_KEYS: Final[tuple[str, ...]] = (
    "education",
    "skills",
    "projects",
    "experience",
    "certifications",
    "achievements",
)

SECTION_ALIASES: Final[dict[str, tuple[str, ...]]] = {
    "education": ("education", "academic background", "academics"),
    "skills": ("skills", "technical skills", "core competencies"),
    "projects": ("projects", "project experience"),
    "experience": ("experience", "work experience", "employment history", "professional experience"),
    "certifications": ("certifications", "certificates", "licenses & certifications"),
    "achievements": ("achievements", "awards", "honors", "accomplishments"),
}


def detect_sections(text: str) -> dict[str, str]:
    """Detect common résumé sections and return their text slices."""

    if not text.strip():
        return {key: "" for key in SECTION_KEYS}

    lines = [line.rstrip() for line in text.splitlines()]
    section_positions: list[tuple[str, int]] = []

    for index, line in enumerate(lines):
        header = _normalize_header(line)
        if not header:
            continue
        for section, aliases in SECTION_ALIASES.items():
            if header in aliases:
                section_positions.append((section, index))
                break

    if not section_positions:
        return {key: "" for key in SECTION_KEYS}

    deduped: list[tuple[str, int]] = []
    seen_sections: set[str] = set()
    for section, index in sorted(section_positions, key=lambda item: item[1]):
        if section not in seen_sections:
            deduped.append((section, index))
            seen_sections.add(section)

    result: dict[str, str] = {key: "" for key in SECTION_KEYS}
    for idx, (section, start_index) in enumerate(deduped):
        end_index = deduped[idx + 1][1] if idx + 1 < len(deduped) else len(lines)
        result[section] = "\n".join(lines[start_index + 1 : end_index]).strip()

    return result


def _normalize_header(line: str) -> str:
    header = line.strip().lower().rstrip(":")
    header = re.sub(r"\s+", " ", header)
    return header if len(header) <= 40 else ""
