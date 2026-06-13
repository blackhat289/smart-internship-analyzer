import re

from utils.skill_catalog import SKILL_CATALOG


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _extract_skills(resume_text: str) -> list[str]:
    normalized_text = _normalize(resume_text)
    extracted = []

    for skill in SKILL_CATALOG:
        if skill.lower() in normalized_text:
            extracted.append(skill)

    return list(dict.fromkeys(extracted))


def _extract_projects(resume_text: str) -> list[str]:
    patterns = [
        r"(?:project|projects)\s*[:\-]\s*(.+)",
        r"(?:built|developed|created)\s+(?:an?|the)?\s*([A-Z][\w\s&-]{2,80})",
    ]

    projects = []
    for pattern in patterns:
        matches = re.findall(pattern, resume_text, flags=re.IGNORECASE | re.MULTILINE)
        for match in matches:
            candidate = match.strip(" .:-\t")
            if 2 <= len(candidate) <= 80:
                projects.append(candidate)

    return list(dict.fromkeys(projects))


def extract_resume_skills(resume_text: str) -> dict:
    if not resume_text or not resume_text.strip():
        return {"skills": [], "projects": []}

    return {
        "skills": _extract_skills(resume_text),
        "projects": _extract_projects(resume_text),
    }
