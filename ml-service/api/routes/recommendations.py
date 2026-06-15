"""Recommendation API routes."""

from fastapi import APIRouter

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("")
async def get_recommendations() -> dict:
    """Placeholder endpoint for recommendations."""

    return {"message": "Recommendations endpoint scaffolded."}
