"""Skill gap analysis helpers."""

from __future__ import annotations

from typing import Mapping, Sequence


DOMAIN_REQUIREMENTS = {
    "Backend": {
        "required": ["Python", "FastAPI", "REST API", "SQL"],
        "important": ["Docker", "Git", "MongoDB", "PostgreSQL"],
    },
    "Frontend": {
        "required": ["HTML", "CSS", "JavaScript", "React"],
        "important": ["TypeScript", "Tailwind CSS", "Git", "REST API"],
    },
    "Full Stack": {
        "required": ["HTML", "CSS", "JavaScript", "React", "Python", "FastAPI"],
        "important": ["SQL", "MongoDB", "Git", "Docker"],
    },
    "Cloud": {
        "required": ["AWS", "Docker", "Kubernetes"],
        "important": ["CI/CD", "Linux", "Git", "Terraform"],
    },
    "Data Science": {
        "required": ["Python", "SQL", "Pandas", "NumPy"],
        "important": ["Statistics", "Matplotlib", "Seaborn", "Jupyter"],
    },
    "Machine Learning": {
        "required": ["Python", "Machine Learning", "NumPy", "scikit-learn"],
        "important": ["TensorFlow", "PyTorch", "NLP", "Jupyter"],
    },
}

SKILL_ALIASES = {
    "js": "JavaScript",
    "reactjs": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "sklearn": "scikit-learn",
    "machinelearning": "Machine Learning",
}


def analyze_skill_gap(profile: Mapping[str, object], *, domain: str) -> dict[str, list[str]]:
    """Compare candidate skills against the selected domain requirements."""

    candidate_skills = _normalize_skills(_flatten_skills(profile.get("skills")))
    requirements = DOMAIN_REQUIREMENTS.get(domain, {"required": [], "important": []})

    missing_skills = [skill for skill in requirements["required"] if not _has_skill(candidate_skills, skill)]
    important_missing_skills = [skill for skill in requirements["important"] if not _has_skill(candidate_skills, skill)]

    return {
        "missing_skills": missing_skills,
        "important_missing_skills": important_missing_skills,
    }


def _flatten_skills(skills: object) -> list[str]:
    if isinstance(skills, Mapping):
        return [skill for values in skills.values() for skill in (values or [])]
    if isinstance(skills, Sequence) and not isinstance(skills, (str, bytes)):
        return list(skills)
    return []


def _normalize_skills(skills: Sequence[str]) -> list[str]:
    normalized: list[str] = []
    for skill in skills:
        cleaned = skill.strip()
        if not cleaned:
            continue
        lookup_key = cleaned.lower().replace(" ", "")
        normalized.append(SKILL_ALIASES.get(lookup_key, cleaned))
    return list(dict.fromkeys(normalized))


def _has_skill(candidate_skills: Sequence[str], required_skill: str) -> bool:
    required = required_skill.lower()
    return any(required in skill.lower() or skill.lower() in required for skill in candidate_skills)
