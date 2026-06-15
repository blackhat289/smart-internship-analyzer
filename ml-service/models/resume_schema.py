"""Pydantic schemas for resume input and output."""

from pydantic import BaseModel, Field


class ResumeTextRequest(BaseModel):
    """Request schema for raw resume text."""

    resume_text: str = Field(..., min_length=1)
