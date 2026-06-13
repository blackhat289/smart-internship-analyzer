from pydantic import BaseModel, Field


class ResumeTextRequest(BaseModel):
    resumeText: str = Field(..., min_length=1, description="Plain text extracted from a resume PDF")


class SkillExtractionResponse(BaseModel):
    skills: list[str]
    projects: list[str]
