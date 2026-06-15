"""Experience extraction helpers."""

from __future__ import annotations

import re
from typing import Any

from models.resume_schema import ExperienceExtractionSchema
from services.llm.llm_client import LLMClient, get_default_llm_client

COMPANY_RE = re.compile(r"(?P<company>[A-Z][A-Za-z0-9&.,'\- ]{2,80})")
ROLE_RE = re.compile(
    r"(?P<role>(?:Software|Data|Product|ML|Machine Learning|Backend|Frontend|Full Stack|DevOps)[A-Za-z0-9&.,'\- /]{0,60})",
    re.IGNORECASE,
)
DURATION_RE = re.compile(
    r"(?P<duration>(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*(?:-|–|to)\s*(?:Present|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}?)",
    re.IGNORECASE,
)
RESPONSIBILITY_RE = re.compile(r"^[\-\u2022*]\s*(?P<item>.+)$", re.MULTILINE)


def extract_experience(text: str, *, llm_client: LLMClient | None = None) -> dict[str, object]:
    """Extract the most relevant work experience record from résumé text."""

    if not text.strip():
        return ExperienceExtractionSchema().model_dump()

    client = llm_client or get_default_llm_client()
    llm_payload = client.generate_json(
        "Extract the main work experience record from the résumé section. Return JSON with keys company, role, duration, responsibilities.",
        schema_hint=ExperienceExtractionSchema().model_dump(),
    )
    if llm_payload:
        validated = _validate_experience(llm_payload)
        if validated:
            return validated.model_dump()

    return _regex_extract_experience(text)


def _regex_extract_experience(text: str) -> dict[str, object]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    company = ""
    role = ""
    duration = ""

    for line in lines:
        if not company and "experience" not in line.lower():
            company_match = COMPANY_RE.search(line)
            if company_match and len(company_match.group("company").split()) <= 8:
                company = company_match.group("company").strip(" ,.-")
        if not role:
            role_match = ROLE_RE.search(line)
            if role_match:
                role = role_match.group("role").strip(" ,.-")
        if not duration:
            duration_match = DURATION_RE.search(line)
            if duration_match:
                duration = duration_match.group("duration").strip()

    responsibilities = [match.group("item").strip() for match in RESPONSIBILITY_RE.finditer(text)]
    return {
        "company": company,
        "role": role,
        "duration": duration,
        "responsibilities": responsibilities[:8],
    }


def _validate_experience(payload: dict[str, Any]) -> ExperienceExtractionSchema | None:
    try:
        return ExperienceExtractionSchema.model_validate(payload)
    except Exception:
        return None
