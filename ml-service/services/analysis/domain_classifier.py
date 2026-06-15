"""Domain classification helpers."""

from __future__ import annotations

from typing import Mapping, Sequence


DOMAIN_KEYWORDS = {
    "Backend": ("fastapi", "django", "flask", "api", "rest", "database", "server", "node.js", "express"),
    "Frontend": ("react", "next.js", "vue", "angular", "html", "css", "tailwind"),
    "Full Stack": ("full stack", "frontend", "backend", "api", "react", "node.js"),
    "Cloud": ("aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform", "devops"),
    "Data Science": ("pandas", "numpy", "statistics", "visualization", "sql", "tableau", "power bi"),
    "Machine Learning": ("machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "nlp"),
}


def classify_domain(text: str, *, skill_buckets: Mapping[str, Sequence[str]] | None = None) -> dict[str, object]:
    """Classify the dominant career domain from résumé content."""

    corpus_parts = [text.lower()]
    if skill_buckets:
        corpus_parts.append(" ".join(skill for values in skill_buckets.values() for skill in values).lower())
    corpus = " ".join(corpus_parts)

    scores = {domain: _score_keywords(corpus, keywords) for domain, keywords in DOMAIN_KEYWORDS.items()}
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    primary_domain, primary_score = ranked[0] if ranked else ("Unknown", 0)
    secondary_domains = [domain for domain, score in ranked[1:3] if score > 0]

    max_score = max(len(keywords) for keywords in DOMAIN_KEYWORDS.values())
    match_percentage = int(min(100, (primary_score / max(max_score, 1)) * 100))

    return {
        "primary_domain": primary_domain or "Unknown",
        "secondary_domains": secondary_domains,
        "domain_match_percentage": match_percentage,
    }


def _score_keywords(text: str, keywords: tuple[str, ...]) -> int:
    score = 0
    for keyword in keywords:
        if keyword in text:
            score += 1
    return score
