"""Pydantic schemas for recommendations."""

from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    """Basic recommendation response schema."""

    items: list[str] = []
