"""Resume analysis engine."""

from __future__ import annotations

from app.analyzers.domain_classifier import classify_domains, top_domain
from app.models.schemas import AnalysisResult, ResumeData


def analyze_resume(resume: ResumeData, target_domain: str | None = None) -> AnalysisResult:
    domains = classify_domains(resume.skills)
    
    # Map primary domain based on target_domain if specified and valid
    if target_domain and target_domain in ["AI/ML", "Data Science", "Web Development", "Backend Development", "Frontend Development", "Cloud Computing", "DevOps", "Cybersecurity", "Mobile Development", "UI/UX"]:
        # Find if it is already classified
        found_target = next((d for d in domains if d["domain"] == target_domain), None)
        if not found_target:
            from app.analyzers.domain_classifier import DOMAIN_RULES
            normalized = {s.lower() for s in resume.skills}
            keywords = DOMAIN_RULES.get(target_domain, [])
            hits = sum(1 for keyword in keywords if keyword.lower() in normalized)
            confidence = round((hits / max(len(keywords), 1)) * 100, 2)
            found_target = {"domain": target_domain, "confidence": confidence}
            domains.insert(0, found_target)
        else:
            domains.remove(found_target)
            domains.insert(0, found_target)
        primary = found_target
    else:
        primary = top_domain(resume.skills)
        
    required = _requirements_for_domain(primary["domain"])
    matched = [skill for skill in resume.skills if skill.lower() in required]
    missing = [skill for skill in required if skill not in {s.lower() for s in resume.skills}]
    match_percentage = round((len(matched) / max(len(required), 1)) * 100)
    readiness = min(100, max(0, match_percentage + (15 if resume.projects else 0) + (10 if resume.certifications else 0)))
    strengths = _build_strengths(resume, primary["domain"], matched)
    weaknesses = _build_weaknesses(resume, missing)
    summary = _build_summary(primary["domain"], readiness, strengths, weaknesses)
    roadmap = _build_roadmap(primary["domain"], missing)
    
    # Generate ATS analysis
    ats_breakdown = {
        "domain_alignment": min(100, match_percentage),
        "skills_completeness": min(100, round((len(resume.skills) / 10) * 100)) if resume.skills else 0,
        "profile_structure": min(100, (25 if resume.education else 0) + (25 if resume.projects else 0) + (25 if resume.experience else 0) + (25 if resume.certifications else 0)),
        "contact_completeness": min(100, (30 if resume.contact_info.email else 0) + (30 if resume.contact_info.phone else 0) + (20 if resume.contact_info.linkedin else 0) + (20 if resume.contact_info.github else 0)),
    }
    ats_score = round(sum(ats_breakdown.values()) / 4)
    ats_strengths = []
    ats_issues = []
    if resume.contact_info.email and resume.contact_info.phone:
        ats_strengths.append("Contact details listed")
    else:
        ats_issues.append("Missing contact info")
    if resume.contact_info.linkedin:
        ats_strengths.append("LinkedIn profile linked")
    else:
        ats_issues.append("No LinkedIn link")
    if len(resume.skills) >= 5:
        ats_strengths.append("Domain skills cataloged")
    else:
        ats_issues.append("Few skills listed")
    if resume.projects:
        ats_strengths.append("Has projects section")
    else:
        ats_issues.append("No projects section")
    ats_analysis = {
        "ats_score": ats_score,
        "breakdown": ats_breakdown,
        "strengths": ats_strengths,
        "issues": ats_issues,
    }
    
    # Generate career insights
    career_insights = {
        "primary_domain": primary["domain"],
        "secondary_domains": [d["domain"] for d in domains[1:]] if len(domains) > 1 else [],
        "domain_match_percentage": match_percentage,
        "confidence_score": round(primary["confidence"]),
    }
    
    # Generate recruiter summary
    concerns = []
    if not resume.projects:
        concerns.append("Lacks project portfolio")
    if not resume.experience:
        concerns.append("No industry experience")
    if missing:
        concerns.append(f"Missing {', '.join(missing[:3])}")
    hire_rec = "Hold"
    if readiness >= 75:
        hire_rec = "Strong Buy"
    elif readiness >= 55:
        hire_rec = "Buy"
    elif readiness < 35:
        hire_rec = "Pass"
    
    # Generate personalized overall feedback
    skill_count = len(resume.skills)
    project_count = len(resume.projects) if resume.projects else 0
    missing_count = len(missing)
    strengths_count = len(strengths)
    
    if readiness >= 75:
        overall_feedback = f"Candidate is highly qualified for {primary['domain']} with {skill_count} relevant skills and {project_count} projects demonstrating domain expertise. "
        overall_feedback += f"Strong alignment across {strengths_count} key competency areas. Ready for senior-level internship roles."
    elif readiness >= 55:
        overall_feedback = f"Candidate has moderate fit for {primary['domain']} (Match: {match_percentage}%). "
        overall_feedback += f"Has {skill_count} core skills but missing {missing_count} critical ones ({', '.join(missing[:2])}). "
        overall_feedback += f"With {project_count} project(s) on record, prioritize building depth in {primary['domain']} before applying to top-tier roles."
    elif readiness >= 35:
        overall_feedback = f"Candidate shows foundational interest in {primary['domain']} with {skill_count} skills and {project_count} project(s). "
        overall_feedback += f"Significant gaps exist: missing {missing_count} essential skills ({', '.join(missing[:2])}). "
        overall_feedback += f"Recommend 4-6 months focused skill development before pursuing internships."
    else:
        overall_feedback = f"Candidate is early-stage in {primary['domain']} (Readiness: {readiness}%). "
        overall_feedback += f"Currently has {skill_count} skills but lacks {missing_count} foundational ones ({', '.join(missing[:3])}). "
        overall_feedback += f"Start with domain fundamentals; not yet ready for competitive internships."
    recruiter_summary = {
        "strengths": strengths,
        "concerns": concerns,
        "overall_feedback": overall_feedback,
        "hire_recommendation": hire_rec,
    }
    
    # Generate personalized resume improvement suggestions
    resume_suggestions = []
    if not resume.contact_info.linkedin:
        resume_suggestions.append(f"Add LinkedIn profile link to connect with {primary['domain']} recruiters and improve discoverability.")
    if not resume.contact_info.github:
        resume_suggestions.append("Link GitHub profile to showcase actual code; recruiters review repositories before interviews.")
    if missing:
        missing_str = ', '.join(missing[:3])
        resume_suggestions.append(f"Add missing {primary['domain']} skills: {missing_str}. These are required by 80%+ of top internship positions.")
    if not resume.projects:
        resume_suggestions.append(f"Add 2+ concrete projects with {primary['domain']} tech stack (e.g., Flask backend, React frontend). Projects are critical; many recruiters skip resumes without them.")
    else:
        project_tech = ', '.join(set([skill for p in resume.projects for skill in resume.skills[:2]]))  
        resume_suggestions.append(f"Enhance existing {len(resume.projects)} projects: add quantifiable metrics (e.g., '50% faster queries'), tech stack details, and GitHub links.")
    if not resume.experience:
        resume_suggestions.append(f"Add internships, freelance work, or open-source contributions. Experience section differentiates candidates in {primary['domain']} roles.")
    if len(resume_suggestions) < 4:
        resume_suggestions.append(f"Specify learning timeline for {', '.join(missing[:2])}; mention expected proficiency level (e.g., 'Learning Python, Intermediate level in 2 months').")

    return AnalysisResult(
        resume=resume,
        domains=domains,
        strengths=strengths,
        weaknesses=weaknesses,
        readiness_score=readiness,
        profile_summary=summary,
        skill_gaps=missing,
        match_percentage=match_percentage,
        roadmap=roadmap,
        recommended_courses=roadmap["recommended_courses"],
        suggested_projects=roadmap["suggested_projects"],
        internship_recommendations=roadmap["internship_recommendations"],
        ats_analysis=ats_analysis,
        career_insights=career_insights,
        recruiter_summary=recruiter_summary,
        resume_improvement_suggestions=resume_suggestions,
    )


def _requirements_for_domain(domain: str) -> list[str]:
    requirements = {
        "AI/ML": ["python", "machine learning", "tensorflow", "pytorch", "numpy", "pandas"],
        "Data Science": ["python", "sql", "pandas", "numpy", "statistics"],
        "Web Development": ["html", "css", "javascript", "react"],
        "Backend Development": ["python", "java", "sql", "fastapi", "django"],
        "Frontend Development": ["html", "css", "javascript", "react", "typescript"],
        "Cloud Computing": ["aws", "docker", "kubernetes", "terraform"],
        "DevOps": ["linux", "docker", "kubernetes", "ci/cd"],
        "Cybersecurity": ["network security", "cryptography", "linux"],
        "Mobile Development": ["flutter", "kotlin", "swift", "react native"],
        "UI/UX": ["figma", "wireframing", "prototyping", "user research", "user flow"],
    }
    return requirements.get(domain, [])


def _build_strengths(resume: ResumeData, domain: str, matched: list[str]) -> list[str]:
    strengths = []
    if resume.projects:
        strengths.append("Has practical project experience.")
    if resume.experience:
        strengths.append("Includes work experience.")
    if resume.certifications:
        strengths.append("Shows learning initiative through certifications.")
    if matched:
        strengths.append(f"Aligned with {domain} fundamentals.")
    return list(dict.fromkeys(strengths))


def _build_weaknesses(resume: ResumeData, missing: list[str]) -> list[str]:
    weaknesses = []
    if not resume.projects:
        weaknesses.append("Projects section is weak or missing.")
    if not resume.experience:
        weaknesses.append("Work experience is missing.")
    if missing:
        weaknesses.append(f"Missing domain skills: {', '.join(missing[:5])}.")
    return list(dict.fromkeys(weaknesses))


def _build_summary(domain: str, readiness: int, strengths: list[str], weaknesses: list[str]) -> str:
    if readiness >= 75:
        status = "strong"
    elif readiness >= 45:
        status = "moderate"
    else:
        status = "early-stage"
    return f"The profile is a {status} match for {domain} roles with {len(strengths)} strengths and {len(weaknesses)} improvement areas."


def _build_roadmap(domain: str, missing: list[str]) -> dict[str, object]:
    courses = [{"title": f"Learn {skill.title()}", "reason": f"Close the {skill} gap"} for skill in missing[:5]]
    projects = [{"title": f"{domain} portfolio project", "reason": f"Practice {domain.lower()} fundamentals"}]
    internships = [{"role": f"{domain} Intern", "match_score": 85, "required_skills_missing": missing[:3]}]
    return {
        "technologies_to_learn": missing[:5],
        "recommended_courses": courses,
        "suggested_projects": projects,
        "internship_recommendations": internships,
    }
