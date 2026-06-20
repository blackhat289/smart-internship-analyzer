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
SPECIALIZATION_RE = re.compile(
    r"\b(?:in|of|for)\s+(?P<value>[^,\n\(\)\|]{2,120}?)(?=(?:\s+(?:at|from|,|\||\(|\b\d{4}\b)|$))",
    re.IGNORECASE,
)
CGPA_RE = re.compile(r"\b(?:CGPA|GPA)\s*[:\-]?\s*(?P<value>\d+(?:\.\d+)?)", re.IGNORECASE)
PERCENTAGE_RE = re.compile(r"\bPercentage\s*[:\-]?\s*(?P<value>\d+(?:\.\d+)?)", re.IGNORECASE)
YEAR_RANGE_RE = re.compile(r"\b(?P<start>19\d{2}|20\d{2})\s*(?:-|to)\s*(?P<end>19\d{2}|20\d{2}|present|current)\b", re.IGNORECASE)
YEAR_RE = re.compile(r"\b(19\d{2}|20\d{2})\b")


def extract_education(text: str, *, llm_client: LLMClient | None = None) -> dict[str, str]:
    """Extract the most relevant education record from resume text."""

    if not text.strip():
        return EducationExtractionSchema().model_dump()

    client = llm_client or get_default_llm_client()
    llm_payload = client.generate_json(
        "Extract the main education record from the resume section. Return JSON with keys degree, specialization, institution, start_year, graduation_year, cgpa, percentage.",
        schema_hint=EducationExtractionSchema().model_dump(),
    )
    if llm_payload:
        validated = _validate_education(llm_payload)
        if validated:
            return validated.model_dump()

    return _regex_extract_education(text)


def _regex_extract_education(text: str) -> dict[str, str]:
    degree = ""
    specialization = ""
    institution = ""
    start_year = ""
    cgpa = ""
    graduation_year = ""
    percentage = ""

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines:
        match = EDUCATION_RE.search(line)
        if not match:
            continue

        degree = match.group("degree").strip()
        degree = re.split(r"\s+(?:in|of)\s+", degree, maxsplit=1, flags=re.IGNORECASE)[0].strip()
        remainder = match.group("rest").strip(" ,-:")
        if remainder:
            institution_match = re.split(r"\s+(?:at|from)\s+", remainder, maxsplit=1, flags=re.IGNORECASE)
            institution = institution_match[-1][:120].strip()
            spec_match = SPECIALIZATION_RE.search(remainder)
            if spec_match:
                specialization = spec_match.group("value").strip(" ,-:")
        break

    cgpa_match = CGPA_RE.search(text)
    if cgpa_match:
        cgpa = cgpa_match.group("value").strip()

    pct_match = PERCENTAGE_RE.search(text)
    if pct_match:
        percentage = pct_match.group("value").strip()

    range_match = YEAR_RANGE_RE.search(text)
    if range_match:
        start_year = range_match.group("start").strip()
        end_year = range_match.group("end").strip()
        if end_year.lower() not in {"present", "current"}:
            graduation_year = end_year
    else:
        years = YEAR_RE.findall(text)
        if years:
            graduation_year = years[-1]
            if len(years) > 1:
                start_year = years[0]

    return {
        "degree": degree,
        "specialization": specialization,
        "institution": institution,
        "start_year": start_year,
        "graduation_year": graduation_year,
        "cgpa": cgpa,
        "percentage": percentage,
    }


def _validate_education(payload: dict[str, Any]) -> EducationExtractionSchema | None:
    try:
        return EducationExtractionSchema.model_validate(payload)
    except Exception:
        return None
