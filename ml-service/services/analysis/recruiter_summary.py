"""Recruiter summary generation helpers."""

from __future__ import annotations

from typing import Mapping, Sequence


def generate_summary(profile: Mapping[str, object]) -> dict[str, object]:
    """Generate a recruiter-friendly summary from the analyzed profile."""

    strengths: list[str] = []
    concerns: list[str] = []

    ats = _coerce_mapping(profile.get("ats"))
    readiness = _coerce_mapping(profile.get("readiness"))
    domain = _coerce_mapping(profile.get("domain"))
    skill_gap = _coerce_mapping(profile.get("skill_gap"))

    if int(ats.get("ats_score", 0) or 0) >= 70:
        strengths.append("ATS compatibility is strong.")
    elif int(ats.get("ats_score", 0) or 0) > 0:
        concerns.append("ATS compatibility can still improve.")

    if int(readiness.get("overall", 0) or 0) >= 70:
        strengths.append("Overall readiness is solid.")
    elif int(readiness.get("overall", 0) or 0) > 0:
        concerns.append("Overall readiness is still developing.")

    primary_domain = str(domain.get("primary_domain", "") or "").strip()
    if primary_domain and primary_domain != "Unknown":
        strengths.append(f"Clear alignment with {primary_domain} roles.")
    else:
        concerns.append("Domain fit is not clearly defined.")

    important_missing = list(skill_gap.get("important_missing_skills", []) or [])
    if important_missing:
        concerns.append(f"Important gaps remain: {', '.join(important_missing[:4])}.")
    else:
        strengths.append("No major domain-specific skill gaps detected.")

    return {
        "strengths": strengths,
        "concerns": concerns,
        "overall_feedback": _build_feedback(strengths, concerns),
        "hire_recommendation": _recommendation(strengths, concerns),
    }


def _coerce_mapping(value: object) -> dict[str, object]:
    if isinstance(value, Mapping):
        return dict(value)
    return {}


def _build_feedback(strengths: Sequence[str], concerns: Sequence[str]) -> str:
    if strengths and not concerns:
        return "The candidate looks strong for recruiter review and shortlist consideration."
    if strengths and concerns:
        return "The candidate has real potential, but a few gaps should be addressed before interview progression."
    if concerns:
        return "The profile needs more work before it is competitive for review."
    return "Insufficient information is available to provide a confident summary."


def _recommendation(strengths: Sequence[str], concerns: Sequence[str]) -> str:
    if strengths and not concerns:
        return "Recommend"
    if strengths and concerns:
        return "Review"
    return "Hold"
