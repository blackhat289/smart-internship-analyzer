"""ATS analysis helpers."""

from __future__ import annotations

import re
from typing import Mapping, Sequence

from services.analysis.domain_classifier import DOMAIN_KEYWORDS

CONTACT_PATTERNS = {
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "phone": re.compile(r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}"),
    "linkedin": re.compile(r"linkedin\.com/in/[A-Za-z0-9_.-]+", re.IGNORECASE),
    "github": re.compile(r"github\.com/[A-Za-z0-9_.-]+", re.IGNORECASE),
}

COMMON_KEYWORDS = tuple(sorted({keyword for keywords in DOMAIN_KEYWORDS.values() for keyword in keywords}))


def analyze_ats(
    text: str,
    *,
    personal_info: Mapping[str, object] | None = None,
    skills: Mapping[str, Sequence[str]] | None = None,
    projects: Sequence[Mapping[str, object]] | None = None,
    certifications: Mapping[str, Sequence[str]] | Sequence[str] | None = None,
    keyword_terms: Sequence[str] | None = None,
) -> dict[str, object]:
    """Calculate a practical ATS-style score for a résumé."""

    if not text.strip():
        return {"ats_score": 0, "issues": ["Resume text is empty."], "strengths": []}

    personal_info = dict(personal_info or {})
    skills = dict(skills or {})
    projects = list(projects or [])
    keyword_terms = list(keyword_terms or COMMON_KEYWORDS)
    certification_items = _flatten_certifications(certifications)

    strengths: list[str] = []
    issues: list[str] = []
    score = 0

    if _has_contact(text, personal_info):
        score += 20
        strengths.append("Contact information is present.")
    else:
        issues.append("Contact information is missing or incomplete.")

    if personal_info.get("linkedin") or CONTACT_PATTERNS["linkedin"].search(text):
        score += 10
        strengths.append("LinkedIn profile is present.")
    else:
        issues.append("LinkedIn profile is missing.")

    if personal_info.get("github") or CONTACT_PATTERNS["github"].search(text):
        score += 10
        strengths.append("GitHub profile is present.")
    else:
        issues.append("GitHub profile is missing.")

    skill_count = _count_structured_skills(skills)
    if skill_count:
        score += 20
        strengths.append("Skills section appears to be present.")
    else:
        issues.append("Skills section is weak or missing.")

    if projects:
        score += 15
        strengths.append("Projects section is present.")
    else:
        issues.append("Projects section is missing.")

    if certification_items:
        score += 5
        strengths.append("Certifications are mentioned.")
    else:
        issues.append("Certifications are missing or not mentioned.")

    if len(text.split()) >= 120:
        score += 10
        strengths.append("Resume has reasonable content depth.")
    else:
        issues.append("Resume looks too short to be complete.")

    keyword_hits = sum(1 for term in keyword_terms if term.lower() in text.lower())
    if keyword_terms:
        coverage = int((keyword_hits / len(keyword_terms)) * 100)
        score += min(20, coverage // 5)
        if coverage >= 50:
            strengths.append("Keyword coverage is acceptable.")
        else:
            issues.append("Keyword coverage is limited.")

    return {
        "ats_score": min(score, 100),
        "issues": _unique(issues),
        "strengths": _unique(strengths),
    }


def _has_contact(text: str, personal_info: Mapping[str, object]) -> bool:
    if personal_info.get("email") or personal_info.get("phone"):
        return True
    return bool(CONTACT_PATTERNS["email"].search(text) or CONTACT_PATTERNS["phone"].search(text))


def _count_structured_skills(skills: Mapping[str, Sequence[str]]) -> int:
    return sum(len(values or []) for values in skills.values())


def _flatten_certifications(certifications: Mapping[str, Sequence[str]] | Sequence[str] | None) -> list[str]:
    if certifications is None:
        return []
    if isinstance(certifications, Mapping):
        return list(certifications.get("certifications", []) or [])
    if isinstance(certifications, Sequence) and not isinstance(certifications, (str, bytes)):
        return list(certifications)
    return []


def _unique(items: Sequence[str]) -> list[str]:
    return list(dict.fromkeys(items))
