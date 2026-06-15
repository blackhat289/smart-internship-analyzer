"""Resume analysis API routes."""

from fastapi import APIRouter

router = APIRouter(prefix="/analyze", tags=["analyze-resume"])


@router.post("/resume")
async def analyze_resume() -> dict:
    """Placeholder endpoint for resume analysis."""

    return {"message": "Resume analysis endpoint scaffolded."}
