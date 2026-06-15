"""Common response schemas for the service."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response schema."""

    success: bool = True
    message: str = "OK"
