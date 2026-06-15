"""Common response schemas for the service."""

from __future__ import annotations

from pydantic import BaseModel, Field

from models.analysis_schema import (
    AtsAnalysisSchema,
    DomainClassificationSchema,
    ReadinessScoreSchema,
    RecruiterSummarySchema,
    SkillGapSchema,
)
from models.resume_schema import CertificationSchema, EducationSchema, ExperienceSchema, PersonalInfoSchema, ProjectSchema, SkillsSchema


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = "healthy"


class AnalysisDashboardResponse(BaseModel):
    """Final dashboard response returned by the analyze endpoint."""

    readiness_score: ReadinessScoreSchema = Field(default_factory=ReadinessScoreSchema)
    ats_analysis: AtsAnalysisSchema = Field(default_factory=AtsAnalysisSchema)
    personal_information: PersonalInfoSchema = Field(default_factory=PersonalInfoSchema)
    skills: SkillsSchema = Field(default_factory=SkillsSchema)
    education: list[EducationSchema] = Field(default_factory=list)
    projects: list[ProjectSchema] = Field(default_factory=list)
    experience: list[ExperienceSchema] = Field(default_factory=list)
    certifications: list[CertificationSchema] = Field(default_factory=list)
    key_strengths: list[str] = Field(default_factory=list)
    career_insights: DomainClassificationSchema = Field(default_factory=DomainClassificationSchema)
    skill_gap_analysis: SkillGapSchema = Field(default_factory=SkillGapSchema)
    learning_roadmap: list[dict[str, object]] = Field(default_factory=list)
    resume_improvement_suggestions: list[str] = Field(default_factory=list)
    recommended_courses: list[dict[str, object]] = Field(default_factory=list)
    suggested_projects: list[dict[str, object]] = Field(default_factory=list)
    internship_recommendations: list[dict[str, object]] = Field(default_factory=list)
    recruiter_summary: RecruiterSummarySchema = Field(default_factory=RecruiterSummarySchema)
