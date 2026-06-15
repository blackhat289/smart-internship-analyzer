"""API router definitions."""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Body, File, HTTPException, UploadFile

from app.analyzers.analysis_engine import analyze_resume
from app.analyzers.skill_gap import analyze_skill_gap
from app.extractors.file_extractor import extract_text_from_file
from app.extractors.resume_extractor import extract_resume_data
from app.models.schemas import AnalysisResult, MatchScoreResponse, RecommendationResponse, ResumeData
from app.rag.retriever import retrieve_context_for_candidate
from app.services.ollama_client import OllamaClient
from app.services.recommendation_engine import (
    build_recommendation_prompt,
    fallback_recommendations,
    summarize_context_docs,
)
from app.config import get_settings
from app.utils.logging import get_logger

def map_role_to_domain(role: str | None) -> str | None:
    if not role:
        return None
    r = role.lower()
    if "ai/ml" in r or "machine learning" in r or "deep learning" in r or "artificial intelligence" in r:
        return "AI/ML"
    if "data" in r or "analyst" in r or "science" in r:
        return "Data Science"
    if "frontend" in r:
        return "Frontend Development"
    if "backend" in r:
        return "Backend Development"
    if "full stack" in r or "fullstack" in r or "web" in r:
        return "Web Development"
    if "ui/ux" in r or "design" in r:
        return "UI/UX"
    if "cloud" in r:
        return "Cloud Computing"
    if "devops" in r:
        return "DevOps"
    if "cyber" in r or "security" in r:
        return "Cybersecurity"
    if "mobile" in r or "ios" in r or "android" in r or "flutter" in r:
        return "Mobile Development"
    return None


def _primary_domain_name(analysis: AnalysisResult) -> str:
    if not analysis.domains:
        return "General"
    first = analysis.domains[0]
    return first.domain if hasattr(first, "domain") else first.get("domain", "General")


logger = get_logger(__name__)
router = APIRouter()


@router.get("/")
async def root() -> dict:
    """Root endpoint - API documentation."""
    return {
        "success": True,
        "service": "Resume Analyzer ML Service",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
            "extract": "POST /extract (upload file)",
            "extract_skills": "POST /extract-skills (from text)",
            "analyze": "POST /analyze (analyze resume)",
            "match_internship": "POST /match-internship (match skills)",
            "recommend": "POST /recommend (get recommendations)",
        },
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@router.get("/health")
async def health() -> dict:
    return {"success": True, "status": "healthy"}


@router.post("/extract", response_model=ResumeData)
async def extract(file: UploadFile = File(...)) -> ResumeData:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".pdf", ".docx"}:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name
    try:
        raw_text = extract_text_from_file(temp_path)
        return extract_resume_data(raw_text)
    finally:
        Path(temp_path).unlink(missing_ok=True)


@router.post("/extract-skills")
async def extract_skills(payload: dict = Body(...)) -> dict:
    resume_text = str(payload.get("resumeText", "") or payload.get("resume_text", ""))
    resume = extract_resume_data(resume_text)
    return {"success": True, "skills": resume.skills, "soft_skills": resume.soft_skills}


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(payload: dict = Body(default_factory=dict)) -> AnalysisResult:
    resume_text = str(payload.get("resumeText", "") or payload.get("resume_text", ""))
    if not resume_text and not payload.get("skills"):
        raise HTTPException(status_code=400, detail="Provide resumeText or skills for analysis.")
    resume = extract_resume_data(resume_text)
    if payload.get("skills"):
        resume.skills = list(dict.fromkeys([*resume.skills, *payload.get("skills", [])]))
    if payload.get("projects"):
        resume.projects = payload.get("projects", [])
        
    target_role = payload.get("selected_role") or payload.get("selectedRole") or payload.get("target_role")
    target_domain = map_role_to_domain(target_role)
    analysis = analyze_resume(resume, target_domain=target_domain)
    
    # Query RAG store to enrich analysis courses/projects/internships if store loads successfully
    try:
        primary_domain = _primary_domain_name(analysis)
        context_docs = retrieve_context_for_candidate(primary_domain, resume.skills, analysis.skill_gaps)
        rag_summary = summarize_context_docs(context_docs)
        courses = [doc for doc in context_docs if doc.get("type") == "courses"]
        projects = [doc for doc in context_docs if doc.get("type") == "projects"]
        internships = [doc for doc in context_docs if doc.get("type") == "internships"]
        
        if courses:
            analysis.recommended_courses = courses[:5]
            analysis.roadmap["recommended_courses"] = courses[:5]
        if projects:
            analysis.suggested_projects = projects[:5]
            analysis.roadmap["suggested_projects"] = projects[:5]
        if internships:
            analysis.internship_recommendations = [
                {
                    "role": doc.get("title", f"{primary_domain} Intern"),
                    "company": doc.get("company", "Industry Partner"),
                    "match_score": 85,
                    "required_skills_missing": analysis.skill_gaps[:3]
                }
                for doc in internships[:3]
            ]
            analysis.roadmap["internship_recommendations"] = analysis.internship_recommendations

        analysis.career_insights = {
            **analysis.career_insights,
            "rag_summary": rag_summary,
            "context_preview": rag_summary["top_matches"],
        }
        if rag_summary["summary_bullets"]:
            analysis.resume_improvement_suggestions = list(
                dict.fromkeys([*rag_summary["summary_bullets"], *analysis.resume_improvement_suggestions])
            )[:8]
    except Exception as e:
        logger.error(f"Failed to populate RAG in analyze endpoint: {e}")
        
    return analysis


@router.post("/match-internship", response_model=MatchScoreResponse)
async def match_internship(payload: dict = Body(default_factory=dict)) -> MatchScoreResponse:
    analysis = await analyze(payload=payload)
    target_role = payload.get("selected_role") or payload.get("selectedRole") or payload.get("target_role")
    target_domain = map_role_to_domain(target_role)
    match = analyze_skill_gap(analysis.resume.skills, target_domain=target_domain)
    return MatchScoreResponse(
        match_percentage=match["match_percentage"],
        matched_skills=match["matched_skills"],
        missing_skills=analysis.skill_gaps,
    )


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(payload: dict = Body(default_factory=dict)) -> RecommendationResponse:
    settings = get_settings()
    resume_text = str(payload.get("resumeText", "") or payload.get("resume_text", ""))
    resume = extract_resume_data(resume_text)
    if payload.get("skills"):
        resume.skills = list(dict.fromkeys([*resume.skills, *payload.get("skills", [])]))
    if payload.get("projects"):
        resume.projects = payload.get("projects", [])
        
    target_role = payload.get("selected_role") or payload.get("selectedRole") or payload.get("target_role")
    target_domain = map_role_to_domain(target_role)
    analysis = analyze_resume(resume, target_domain=target_domain)
    
    primary_domain = _primary_domain_name(analysis)
    context_docs = retrieve_context_for_candidate(primary_domain, resume.skills, analysis.skill_gaps)
    rag_summary = summarize_context_docs(context_docs)
    prompt = build_recommendation_prompt(analysis, context_docs)
    client = OllamaClient(settings.ollama_base_url, settings.ollama_model)
    try:
        generated = await client.generate(prompt)
        if generated.strip():
            projects = [doc for doc in context_docs if doc.get("type") == "projects"][:5]
            return RecommendationResponse(
                internship_recommendations=context_docs[:3],
                career_guidance=[generated.strip()],
                missing_skill_recommendations=analysis.skill_gaps,
                certification_suggestions=[doc.get("title", "") for doc in context_docs if doc.get("type") == "courses"],
                learning_roadmap=[{"step": i + 1, "item": gap} for i, gap in enumerate(analysis.skill_gaps[:5])],
                suggested_projects=projects,
            )
    except Exception as exc:
        logger.exception("Ollama generation failed")
    fallback = fallback_recommendations(analysis, context_docs)
    fallback["career_guidance"] = [*rag_summary["summary_bullets"], *fallback["career_guidance"]][:5]
    fallback["certification_suggestions"] = [
        *(doc.get("title", "") for doc in rag_summary["recommended_courses"]),
        *fallback["certification_suggestions"],
    ][:6]
    return RecommendationResponse(**fallback)


@router.post("/recommendations")
async def recommendations_alias(
    payload: dict = Body(default_factory=dict),
) -> dict:
    response = await recommend(payload=payload)
    return response.model_dump()
