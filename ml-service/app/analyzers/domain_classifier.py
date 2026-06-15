"""Rule-based domain classification."""

from __future__ import annotations

from app.extractors.skill_catalog import SKILL_CATALOG

DOMAIN_RULES = {
    "AI/ML": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "nlp"],
    "Data Science": ["python", "sql", "pandas", "numpy", "matplotlib", "statistics", "tableau"],
    "Web Development": ["html", "css", "javascript", "react", "node.js", "express"],
    "Backend Development": ["java", "python", "node.js", "fastapi", "django", "sql", "mongodb"],
    "Frontend Development": ["html", "css", "javascript", "react", "typescript", "next.js"],
    "Cloud Computing": ["aws", "azure", "gcp", "terraform", "docker", "kubernetes"],
    "DevOps": ["linux", "docker", "kubernetes", "jenkins", "ci/cd", "github actions"],
    "Cybersecurity": ["network security", "threat modeling", "penetration testing", "cryptography"],
    "Mobile Development": ["flutter", "dart", "kotlin", "swift", "react native"],
    "UI/UX": ["figma", "wireframing", "prototyping", "user research", "user flow", "sketch", "adobe xd", "design"],
}


def classify_domains(skills: list[str]) -> list[dict[str, object]]:
    normalized = {skill.lower() for skill in skills}
    scored = []
    for domain, keywords in DOMAIN_RULES.items():
        hits = sum(1 for keyword in keywords if keyword.lower() in normalized)
        confidence = round((hits / max(len(keywords), 1)) * 100, 2)
        if hits:
            scored.append({"domain": domain, "confidence": confidence})
    return sorted(scored, key=lambda item: item["confidence"], reverse=True)


def top_domain(skills: list[str]) -> dict[str, object]:
    domains = classify_domains(skills)
    if not domains:
        return {"domain": "General", "confidence": 0.0}
    return domains[0]

