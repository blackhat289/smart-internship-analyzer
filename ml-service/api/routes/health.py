"""Health check API routes."""

from __future__ import annotations

from fastapi import APIRouter

from models.response_schema import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health() -> HealthResponse:
    """Basic service health endpoint."""

    return HealthResponse()
