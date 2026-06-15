"""Personal information extraction helpers."""

from __future__ import annotations

import re
from typing import Any

NAME_CANDIDATE_RE = re.compile(r"^[A-Za-z][A-Za-z\s'.-]{1,60}$")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}")
GITHUB_RE = re.compile(r"(https?://(?:www\.)?github\.com/[A-Za-z0-9_.-]+|github\.com/[A-Za-z0-9_.-]+)", re.I)
LINKEDIN_RE = re.compile(r"(https?://(?:www\.)?linkedin\.com/in/[A-Za-z0-9_.-]+|linkedin\.com/in/[A-Za-z0-9_.-]+)", re.I)
LOCATION_RE = re.compile(r"\b(?P<city>[A-Z][a-zA-Z.\- ]{1,40}),\s*(?P<region>[A-Z]{2}|[A-Za-z][a-zA-Z.\- ]{1,40})\b")
ADDRESS_HINTS = ("road", "street", "st.", "ave", "lane", "city", "state", "india", "usa", "united states")


def _first_match(pattern: re.Pattern[str], text: str) -> str:
    match = pattern.search(text)
    return match.group(0).strip() if match else ""


def _extract_name(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()[:8] if line.strip()]
    for line in lines:
        if EMAIL_RE.search(line) or PHONE_RE.search(line) or "linkedin" in line.lower() or "github" in line.lower():
            continue
        cleaned = re.sub(r"[^A-Za-z\s'.-]", "", line).strip()
        if 2 <= len(cleaned.split()) <= 5 and NAME_CANDIDATE_RE.match(cleaned):
            return cleaned
    return ""


def extract_personal_info(text: str) -> dict[str, str]:
    """Extract basic personal details from résumé text."""

    if not text.strip():
        return {"name": "", "email": "", "phone": "", "github": "", "linkedin": "", "location": ""}

    info: dict[str, Any] = {
        "name": _extract_name(text),
        "email": _first_match(EMAIL_RE, text),
        "phone": _first_match(PHONE_RE, text),
        "github": _first_match(GITHUB_RE, text),
        "linkedin": _first_match(LINKEDIN_RE, text),
        "location": "",
    }

    lines = [line.strip() for line in text.splitlines()[:12] if line.strip()]
    for line in lines:
        if info["email"] in line or info["phone"] in line:
            continue
        if any(marker in line.lower() for marker in ("github", "linkedin", "mailto:")):
            continue
        if any(hint in line.lower() for hint in ADDRESS_HINTS):
            location_match = LOCATION_RE.search(line)
            if location_match:
                info["location"] = f"{location_match.group('city').strip()}, {location_match.group('region').strip()}"
                break
        location_match = LOCATION_RE.search(line)
        if location_match:
            info["location"] = f"{location_match.group('city').strip()}, {location_match.group('region').strip()}"
            break

    return {key: str(value or "") for key, value in info.items()}
