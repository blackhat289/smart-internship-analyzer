"""Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""


class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""
    details: str = ""


class ProjectItem(BaseModel):
    title: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)


class ExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    duration: str = ""
    details: str = ""


class ResumeData(BaseModel):
    raw_text: str = ""
    contact_info: ContactInfo = Field(default_factory=ContactInfo)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)


class DomainScore(BaseModel):
    domain: str
    confidence: float


class AnalysisResult(BaseModel):
    resume: ResumeData
    domains: list[DomainScore] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    readiness_score: int = 0
    profile_summary: str = ""
    skill_gaps: list[str] = Field(default_factory=list)
    match_percentage: int = 0
    roadmap: dict[str, object] = Field(default_factory=dict)
    recommended_courses: list[dict] = Field(default_factory=list)
    suggested_projects: list[dict] = Field(default_factory=list)
    internship_recommendations: list[dict] = Field(default_factory=list)
    ats_analysis: dict = Field(default_factory=dict)
    career_insights: dict = Field(default_factory=dict)
    recruiter_summary: dict = Field(default_factory=dict)
    resume_improvement_suggestions: list[str] = Field(default_factory=list)


class RecommendationResponse(BaseModel):
    internship_recommendations: list[dict] = Field(default_factory=list)
    career_guidance: list[str] = Field(default_factory=list)
    missing_skill_recommendations: list[str] = Field(default_factory=list)
    certification_suggestions: list[str] = Field(default_factory=list)
    learning_roadmap: list[dict] = Field(default_factory=list)
    suggested_projects: list[dict] = Field(default_factory=list)


class MatchScoreResponse(BaseModel):
    match_percentage: int
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
