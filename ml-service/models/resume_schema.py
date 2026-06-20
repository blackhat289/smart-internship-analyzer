"""Pydantic schemas for resume input and structured extraction output."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ResumeTextRequest(BaseModel):
    """Request schema for raw resume text."""

    resume_text: str = Field(..., min_length=1)


class PersonalInfoSchema(BaseModel):
    """Structured personal information extracted from a resume."""

    name: str = ""
    email: str = ""
    phone: str = ""
    github: str = ""
    linkedin: str = ""
    location: str = ""


class SkillsSchema(BaseModel):
    """Categorized skill payload."""

    programming: list[str] = Field(default_factory=list)
    frontend: list[str] = Field(default_factory=list)
    backend: list[str] = Field(default_factory=list)
    database: list[str] = Field(default_factory=list)
    cloud: list[str] = Field(default_factory=list)
    machine_learning: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)


class EducationSchema(BaseModel):
    """Education payload extracted from a résumé."""

    degree: str = ""
    specialization: str = ""
    institution: str = ""
    start_year: str = ""
    graduation_year: str = ""
    cgpa: str = ""
    percentage: str = ""


class ProjectSchema(BaseModel):
    """Project payload extracted from a résumé."""

    title: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    impact_metrics: list[str] = Field(default_factory=list)
    complexity: str = ""
    project_score: int = 0


class ExperienceSchema(BaseModel):
    """Work experience payload extracted from a résumé."""

    company: str = ""
    role: str = ""
    duration: str = ""
    responsibilities: list[str] = Field(default_factory=list)


class CertificationSchema(BaseModel):
    """Certification payload extracted from a résumé."""

    certifications: list[str] = Field(default_factory=list)


class ProjectExtractionSchema(BaseModel):
    """Structured project extraction payload."""

    title: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    impact_metrics: list[str] = Field(default_factory=list)
    complexity: str = ""
    project_score: int = 0


class EducationExtractionSchema(BaseModel):
    """Structured education extraction payload."""

    degree: str = ""
    specialization: str = ""
    institution: str = ""
    start_year: str = ""
    graduation_year: str = ""
    cgpa: str = ""
    percentage: str = ""


class ExperienceExtractionSchema(BaseModel):
    """Structured experience extraction payload."""

    company: str = ""
    role: str = ""
    duration: str = ""
    responsibilities: list[str] = Field(default_factory=list)
