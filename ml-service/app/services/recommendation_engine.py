"""Recommendation generation."""

from __future__ import annotations

from app.models.schemas import AnalysisResult


def build_recommendation_prompt(analysis: AnalysisResult, context_docs: list[dict[str, object]]) -> str:
    context = "\n".join(
        f"- {doc.get('title', doc.get('name', 'Resource'))}: {doc.get('description', doc.get('text', ''))}"
        for doc in context_docs[:6]
    )
    return f"""
You are an internship advisor.
Resume summary: {analysis.profile_summary}
Skills: {', '.join(analysis.resume.skills)}
Skill gaps: {', '.join(analysis.skill_gaps)}
Strengths: {', '.join(analysis.strengths)}
Weaknesses: {', '.join(analysis.weaknesses)}
Retrieved context:
{context}

Return concise recommendations for:
1. internship matches
2. career guidance
3. missing skills
4. certification suggestions
5. learning roadmap
""".strip()


def _dedupe_texts(items: list[str]) -> list[str]:
    return [item for item in dict.fromkeys(item.strip() for item in items if item and item.strip())]


def summarize_context_docs(context_docs: list[dict[str, object]]) -> dict[str, object]:
    courses = [doc for doc in context_docs if doc.get("type") == "courses"][:5]
    projects = [doc for doc in context_docs if doc.get("type") == "projects"][:4]
    internships = [doc for doc in context_docs if doc.get("type") == "internships"][:3]
    career_paths = [doc for doc in context_docs if doc.get("type") == "career_paths"][:3]

    return {
        "top_matches": [
            {
                "title": doc.get("title") or doc.get("name") or "Recommendation",
                "description": doc.get("description") or doc.get("text") or "",
                "type": doc.get("type", "resource"),
                "score": round(float(doc.get("score", 0)) * 100, 1) if isinstance(doc.get("score"), (int, float)) else 0,
            }
            for doc in context_docs[:6]
        ],
        "recommended_courses": courses,
        "suggested_projects": projects,
        "internship_recommendations": internships,
        "career_paths": career_paths,
        "summary_bullets": _dedupe_texts(
            [
                f"Focus on {doc.get('title', 'targeted resources')}" for doc in courses[:2]
            ]
            + [f"Build project depth from {doc.get('title', 'portfolio ideas')}" for doc in projects[:2]]
            + [f"Explore {doc.get('title', 'internship paths')}" for doc in internships[:1]]
        ),
    }


def fallback_recommendations(analysis: AnalysisResult, context_docs: list[dict[str, object]]) -> dict[str, object]:
    internships = [doc for doc in context_docs if doc.get("type") == "internships"][:3]
    courses = [doc.get("title", "Recommended course") for doc in context_docs if doc.get("type") == "courses"][:5]
    projects = [doc for doc in context_docs if doc.get("type") == "projects"][:5]
    roadmap = [{"step": i + 1, "item": gap} for i, gap in enumerate(analysis.skill_gaps[:5])]
    return {
        "internship_recommendations": internships,
        "career_guidance": [analysis.profile_summary],
        "missing_skill_recommendations": analysis.skill_gaps,
        "certification_suggestions": courses,
        "learning_roadmap": roadmap or [{"step": 1, "item": "Polish resume and portfolio"}],
        "suggested_projects": projects,
    }
