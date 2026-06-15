"""Education extraction helpers."""

from __future__ import annotations

import re
from typing import Any

from models.resume_schema import EducationExtractionSchema
from services.llm.llm_client import LLMClient, get_default_llm_client

EDUCATION_RE = re.compile(
    r"(?P<degree>\b(?:B\.?Tech\.?|M\.?Tech\.?|B\.?Sc\.?|M\.?Sc\.?|B\.?E\.?|M\.?E\.?|BCA|MCA|MBA|PhD|Bachelor[^,\n]*|Master[^,\n]*)\b)"
    r"(?P<rest>.*)",
    re.IGNORECASE,
)
CGPA_RE = re.compile(r"\b(?:CGPA|GPA|Percentage)\s*[:\-]?\s*(?P<value>\d+(?:\.\d+)?)", re.IGNORECASE)
YEAR_RE = re.compile(r"\b(19\d{2}|20\d{2})\b")


def extract_education(text: str, *, llm_client: LLMClient | None = None) -> dict[str, str]:
    """Extract the most relevant education record from résumé text."""

    if not text.strip():
        return EducationExtractionSchema().model_dump()

    client = llm_client or get_default_llm_client()
    llm_payload = client.generate_json(
        "Extract the main education record from the résumé section. Return JSON with keys degree, institution, cgpa, graduation_year.",
        schema_hint=EducationExtractionSchema().model_dump(),
    )
    if llm_payload:
        validated = _validate_education(llm_payload)
        if validated:
            return validated.model_dump()

    return _regex_extract_education(text)


def _regex_extract_education(text: str) -> dict[str, str]:
    degree = ""
    institution = ""
    cgpa = ""
    graduation_year = ""

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines:
        match = EDUCATION_RE.search(line)
        if match:
            degree = match.group("degree").strip()
            remainder = match.group("rest").strip(" ,-:")
            if remainder:
                institution = remainder[:120]
            break

    cgpa_match = CGPA_RE.search(text)
    if cgpa_match:
        cgpa = cgpa_match.group("value").strip()

    year_matches = YEAR_RE.findall(text)
    if year_matches:
        graduation_year = year_matches[-1]

    return {
        "degree": degree,
        "institution": institution,
        "cgpa": cgpa,
        "graduation_year": graduation_year,
    }


def _validate_education(payload: dict[str, Any]) -> EducationExtractionSchema | None:
    try:
        return EducationExtractionSchema.model_validate(payload)
    except Exception:
        return None
