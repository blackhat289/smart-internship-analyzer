"""Education extraction helpers."""

from __future__ import annotations

import re
from typing import Any

from models.resume_schema import EducationExtractionSchema
from services.llm.llm_client import LLMClient, get_default_llm_client

YEAR_RANGE_RE = re.compile(
    r"\b(?P<start>19\d{2}|20\d{2})\s*(?:-|to|–|—)\s*(?P<end>19\d{2}|20\d{2}|present|current)\b",
    re.IGNORECASE,
)
SCORE_RE = re.compile(r"\b(?:cgpa|gpa|cpi|percentage)\s*[:\-]?\s*(?P<value>\d+(?:\.\d+)?)", re.IGNORECASE)
DEGREE_RE = re.compile(
    r"\b(?:b\.?tech(?:\s*cse|\s*computer science(?: and engineering)?)?|m\.?tech|b\.?sc|m\.?sc|b\.?e|m\.?e|bca|mca|mba|phd|intermediate|higher secondary|secondary|bachelor[^,\n]*|master[^,\n]*|diploma[^,\n]*)\b",
    re.IGNORECASE,
)


def extract_education(text: str, *, llm_client: LLMClient | None = None) -> dict[str, str]:
    """Extract structured education data from resume text."""

    if not text.strip():
        return EducationExtractionSchema().model_dump()

    client = llm_client or get_default_llm_client()
    llm_payload = client.generate_json(
        "Extract structured education records as JSON array. Each object must contain degree, institution, cgpa, start_year, end_year, specialization.",
        schema_hint=[EducationExtractionSchema().model_dump()],
    )
    validated = _validate_education_payload(llm_payload)
    if validated:
        return validated[0]

    records = _regex_extract_educations(text)
    return records[0] if records else EducationExtractionSchema().model_dump()


def _regex_extract_educations(text: str) -> list[dict[str, str]]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    records: list[dict[str, str]] = []
    current: dict[str, str] | None = None

    def flush_current() -> None:
        nonlocal current
        if not current:
            return
        normalized = _normalize_record(current)
        if normalized["degree"] and normalized["institution"]:
            records.append(normalized)
        current = None

    for line in lines:
        if _is_noise(line):
            continue

        if DEGREE_RE.search(line):
            flush_current()
            current = {
                "degree": _clean_degree(line),
                "specialization": _extract_specialization(line),
                "institution": "",
                "cgpa": "",
                "start_year": "",
                "end_year": "",
                "percentage": "",
            }
            continue

        if not current:
            continue

        year_range = YEAR_RANGE_RE.search(line)
        if year_range:
            current["start_year"] = year_range.group("start")
            end_year = year_range.group("end")
            current["end_year"] = "Present" if end_year.lower() in {"present", "current"} else end_year
            continue

        score = SCORE_RE.search(line)
        if score:
            if re.search(r"\bpercentage\b", line, re.IGNORECASE):
                current["percentage"] = score.group("value")
            else:
                current["cgpa"] = score.group("value")
            continue

        if not current["institution"] and _looks_like_institution(line):
            current["institution"] = _clean_value(line)
            continue

        if not current["cgpa"] and re.fullmatch(r"\d{1,3}(?:\.\d+)?", line):
            current["cgpa"] = line

    flush_current()
    return records


def _is_noise(line: str) -> bool:
    value = line.strip().lower()
    if not value:
        return True
    return any(
        token in value
        for token in (
            "examination",
            "institute",
            "year",
            "cpi",
            "aggregate",
            "marks",
            "subjects",
            "board",
        )
    )


def _looks_like_institution(line: str) -> bool:
    value = line.strip()
    if not value or _is_noise(value):
        return False
    if YEAR_RANGE_RE.search(value) or SCORE_RE.search(value):
        return False
    return bool(re.search(r"[A-Za-z]", value)) and len(value) > 3


def _extract_specialization(line: str) -> str:
    match = re.search(r"\bin\s+(?P<value>[A-Za-z &/-]{3,120})", line, re.IGNORECASE)
    return _clean_value(match.group("value")) if match else ""


def _clean_degree(line: str) -> str:
    cleaned = re.sub(r"\b(?:graduation|education|examination|institute|year|cpi|percentage)\b.*$", "", line, flags=re.IGNORECASE)
    cleaned = re.split(r"\s+in\s+", cleaned, maxsplit=1, flags=re.IGNORECASE)[0]
    return _clean_value(cleaned)


def _clean_value(value: str) -> str:
    return re.sub(r"\s{2,}", " ", value).replace("|", " ").strip()


def _normalize_record(record: dict[str, str]) -> dict[str, str]:
    degree = _clean_value(record.get("degree", ""))
    specialization = _clean_value(record.get("specialization", ""))
    institution = _clean_value(record.get("institution", ""))
    cgpa = _clean_value(record.get("cgpa", ""))
    start_year = _clean_value(record.get("start_year", ""))
    end_year = _clean_value(record.get("end_year", ""))

    return {
        "degree": degree,
        "specialization": specialization,
        "institution": institution,
        "cgpa": cgpa,
        "percentage": _clean_value(record.get("percentage", "")),
        "start_year": start_year,
        "end_year": end_year,
        "graduation_year": end_year,
    }


def _validate_education_payload(payload: object) -> list[dict[str, str]] | None:
    if not isinstance(payload, list):
        return None

    validated: list[dict[str, str]] = []
    for item in payload:
        if not isinstance(item, dict):
            continue
        degree = _clean_value(str(item.get("degree", "")))
        institution = _clean_value(str(item.get("institution", "")))
        if not degree or not institution:
            continue
        validated.append(
            {
                "degree": degree,
                "specialization": _clean_value(str(item.get("specialization", ""))),
                "institution": institution,
                "cgpa": _clean_value(str(item.get("cgpa", ""))),
                "percentage": _clean_value(str(item.get("percentage", ""))),
                "start_year": _clean_value(str(item.get("start_year", ""))),
                "end_year": _clean_value(str(item.get("end_year", ""))),
                "graduation_year": _clean_value(str(item.get("graduation_year", item.get("end_year", "")))),
            }
        )

    return validated or None


def _validate_education(payload: dict[str, Any]) -> EducationExtractionSchema | None:
    try:
        return EducationExtractionSchema.model_validate(payload)
    except Exception:
        return None
