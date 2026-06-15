"""Recommendation API routes."""

from __future__ import annotations

from fastapi import APIRouter

from services.recommendation.course_recommender import recommend_courses
from services.recommendation.internship_recommender import recommend_internships
from services.recommendation.project_recommender import recommend_projects
from services.recommendation.roadmap_generator import generate_roadmap

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", summary="Recommendation helpers")
async def get_recommendations() -> dict:
    """Return a small sample recommendation payload for direct API use."""

    return {
        "recommended_courses": recommend_courses({"primary_domain": "Backend", "skills": {}}, [])["recommended_courses"],
        "suggested_projects": recommend_projects("Backend", [])["suggested_projects"],
        "internship_recommendations": recommend_internships({}, [], "Backend")["internship_recommendations"],
        "learning_roadmap": generate_roadmap("Backend", [])["learning_roadmap"],
    }
