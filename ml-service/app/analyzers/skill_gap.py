"""Skill gap analysis."""

from __future__ import annotations

from app.analyzers.domain_classifier import top_domain


DOMAIN_REQUIREMENTS = {
    "AI/ML": ["python", "machine learning", "tensorflow", "pytorch", "numpy", "pandas"],
    "Data Science": ["python", "sql", "pandas", "numpy", "statistics"],
    "Web Development": ["html", "css", "javascript", "react"],
    "Backend Development": ["python", "sql", "fastapi", "django", "rest api"],
    "Frontend Development": ["html", "css", "javascript", "react", "typescript"],
    "Cloud Computing": ["aws", "docker", "kubernetes", "terraform"],
    "DevOps": ["linux", "docker", "kubernetes", "ci/cd"],
    "Cybersecurity": ["network security", "cryptography", "linux"],
    "Mobile Development": ["flutter", "kotlin", "swift", "react native"],
    "UI/UX": ["figma", "wireframing", "prototyping", "user research", "user flow"],
}


def analyze_skill_gap(skills: list[str], target_domain: str | None = None) -> dict[str, object]:
    primary = target_domain if (target_domain and target_domain in DOMAIN_REQUIREMENTS) else top_domain(skills)["domain"]
    required = DOMAIN_REQUIREMENTS.get(primary, [])
    normalized = {skill.lower() for skill in skills}
    missing = [skill for skill in required if skill not in normalized]
    matched = [skill for skill in required if skill in normalized]
    return {
        "target_domain": primary,
        "match_percentage": round((len(matched) / max(len(required), 1)) * 100),
        "missing_skills": missing,
        "matched_skills": matched,
    }

