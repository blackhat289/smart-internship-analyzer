"""Resume analysis API routes."""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from models.response_schema import AnalysisDashboardResponse
from services.analysis.ats_analyzer import analyze_ats
from services.analysis.domain_classifier import classify_domain
from services.analysis.readiness_score import calculate_readiness_score
from services.analysis.recruiter_summary import generate_summary
from services.analysis.skill_gap_analyzer import analyze_skill_gap
from services.extraction.certification_extractor import extract_certifications
from services.extraction.education_extractor import extract_education
from services.extraction.experience_extractor import extract_experience
from services.extraction.personal_info_extractor import extract_personal_info
from services.extraction.pdf_parser import extract_pdf_text
from services.extraction.project_extractor import extract_projects
from services.extraction.section_detector import detect_sections
from services.extraction.skill_extractor import extract_skills
from services.recommendation.course_recommender import recommend_courses
from services.recommendation.internship_recommender import recommend_internships
from services.recommendation.project_recommender import recommend_projects
from services.recommendation.roadmap_generator import generate_roadmap
from api.dependencies import get_service_name

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analyze-resume"])


@router.post("", response_model=AnalysisDashboardResponse, summary="Analyze uploaded resume PDF")
async def analyze_resume(
    file: UploadFile = File(...),
    service_name: str = Depends(get_service_name),
) -> AnalysisDashboardResponse:
    """Run the full resume analysis pipeline on an uploaded PDF."""

    logger.info("Starting analysis via %s", service_name)
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported.")

    temp_path = await _save_upload(file)
    try:
        raw_text = extract_pdf_text(str(temp_path))
        sections = detect_sections(raw_text)

        personal_information = extract_personal_info(raw_text)
        skills = extract_skills(sections.get("skills") or raw_text)
        education = extract_education(sections.get("education") or raw_text)
        projects = extract_projects(sections.get("projects") or raw_text)
        experience = extract_experience(sections.get("experience") or raw_text)
        certifications = extract_certifications(sections.get("certifications") or raw_text)

        ats_analysis = analyze_ats(
            raw_text,
            personal_info=personal_information,
            skills=skills,
            projects=projects,
            certifications=certifications,
        )

        career_insights = classify_domain(raw_text, skill_buckets=skills)
        skill_gap_analysis = analyze_skill_gap({"skills": skills}, domain=career_insights["primary_domain"])
        readiness_score = calculate_readiness_score(
            {
                "skills": skills,
                "projects": projects,
                "experience": experience.get("responsibilities", []),
                "certifications": certifications.get("certifications", []),
                "ats": ats_analysis.get("ats_score", 0),
            }
        )

        recommended_courses = recommend_courses(
            {"primary_domain": career_insights["primary_domain"], "skills": skills},
            skill_gap_analysis["missing_skills"],
        )["recommended_courses"]
        suggested_projects = recommend_projects(
            career_insights["primary_domain"],
            skill_gap_analysis["missing_skills"],
        )["suggested_projects"]
        internship_recommendations = recommend_internships(
            skills,
            projects,
            career_insights["primary_domain"],
        )["internship_recommendations"]
        learning_roadmap = generate_roadmap(
            career_insights["primary_domain"],
            skill_gap_analysis["missing_skills"],
        )["learning_roadmap"]
        recruiter_summary = generate_summary(
            {
                "ats": ats_analysis,
                "readiness": readiness_score,
                "domain": career_insights,
                "skill_gap": skill_gap_analysis,
            }
        )

        key_strengths = list(dict.fromkeys([*ats_analysis.get("strengths", []), f"Primary domain: {career_insights['primary_domain']}"]))
        resume_improvement_suggestions = list(
            dict.fromkeys(
                [
                    *ats_analysis.get("issues", []),
                    *(f"Consider learning {skill}" for skill in skill_gap_analysis["missing_skills"][:5]),
                ]
            )
        )

        return AnalysisDashboardResponse(
            readiness_score=readiness_score,
            ats_analysis=ats_analysis,
            personal_information=personal_information,
            skills=skills,
            education=[education],
            projects=projects,
            experience=[experience],
            certifications=[certifications],
            key_strengths=key_strengths,
            career_insights=career_insights,
            skill_gap_analysis=skill_gap_analysis,
            learning_roadmap=learning_roadmap,
            resume_improvement_suggestions=resume_improvement_suggestions,
            recommended_courses=recommended_courses,
            suggested_projects=suggested_projects,
            internship_recommendations=internship_recommendations,
            recruiter_summary=recruiter_summary,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Resume analysis failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
    finally:
        temp_path.unlink(missing_ok=True)


async def _save_upload(file: UploadFile) -> Path:
    """Persist the uploaded file to a temporary PDF path."""

    suffix = ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        return Path(tmp.name)
