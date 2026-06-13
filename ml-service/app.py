from fastapi import FastAPI

from models.schemas import ResumeTextRequest, SkillExtractionResponse
from services.resume_skill_extractor import extract_resume_skills

app = FastAPI(
    title="Smart Internship Analyzer ML Service",
    version="1.0.0",
)


@app.get("/health")
async def health_check():
    return {"success": True, "message": "OK"}


@app.post("/extract-skills", response_model=SkillExtractionResponse)
async def extract_skills(payload: ResumeTextRequest):
    extracted = extract_resume_skills(payload.resumeText)
    return {
        "skills": extracted["skills"],
        "projects": extracted["projects"],
    }
