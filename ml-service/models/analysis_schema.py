"""Pydantic schemas for the analysis layer."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AtsAnalysisSchema(BaseModel):
    """ATS analysis output schema."""

    ats_score: int = Field(default=0, ge=0, le=100)
    issues: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)


class ReadinessScoreSchema(BaseModel):
    """Readiness score output schema."""

    overall: int = Field(default=0, ge=0, le=100)
    skills_score: int = Field(default=0, ge=0, le=100)
    projects_score: int = Field(default=0, ge=0, le=100)
    experience_score: int = Field(default=0, ge=0, le=100)
    certification_score: int = Field(default=0, ge=0, le=100)


class DomainClassificationSchema(BaseModel):
    """Domain classification output schema."""

    primary_domain: str = ""
    secondary_domains: list[str] = Field(default_factory=list)
    domain_match_percentage: int = Field(default=0, ge=0, le=100)


class SkillGapSchema(BaseModel):
    """Skill gap output schema."""

    missing_skills: list[str] = Field(default_factory=list)
    important_missing_skills: list[str] = Field(default_factory=list)


class RecruiterSummarySchema(BaseModel):
    """Recruiter summary output schema."""

    strengths: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    overall_feedback: str = ""
