"""Health check API routes."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Basic service health endpoint."""

    return {"success": True, "message": "OK"}
