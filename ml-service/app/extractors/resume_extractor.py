"""Resume extraction and parsing."""

from __future__ import annotations

import re

from app.models.schemas import ContactInfo, EducationItem, ExperienceItem, ProjectItem, ResumeData
from app.extractors.skill_catalog import SKILL_CATALOG, SOFT_SKILLS
from app.utils.text import clean_text, lowercase_safe, split_lines


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,4}\)?[-.\s]?)\d{3,4}[-.\s]?\d{4}")


def extract_resume_data(raw_text: str) -> ResumeData:
    text = clean_text(raw_text)
    lower = lowercase_safe(text)
    lines = split_lines(text)
    contact = _extract_contact(lines, text)
    skills, soft_skills = _extract_skills(lower)
    education = _extract_section_items(lines, "education")
    projects = _extract_project_items(lines)
    certifications = _extract_bullets(lines, ["certification", "certifications", "licenses"])
    experience = _extract_experience(lines)
    return ResumeData(
        raw_text=text,
        contact_info=contact,
        education=education,
        projects=projects,
        certifications=certifications,
        experience=experience,
        skills=skills,
        soft_skills=soft_skills,
    )


def _extract_contact(lines: list[str], text: str) -> ContactInfo:
    email = EMAIL_RE.search(text)
    phone = PHONE_RE.search(text)
    linkedin = next((line for line in lines if "linkedin.com/" in line.lower()), "")
    github = next((line for line in lines if "github.com/" in line.lower()), "")
    email_str = email.group(0) if email else ""
    name = next((line for line in lines[:5] if (not email_str or email_str not in line) and "@" not in line and len(line) < 80), "")
    return ContactInfo(
        name=name,
        email=email_str,
        phone=phone.group(0) if phone else "",
        linkedin=linkedin,
        github=github,
        portfolio=next((line for line in lines if "portfolio" in line.lower() or "website" in line.lower()), ""),
    )


def _extract_skills(lower_text: str) -> tuple[list[str], list[str]]:
    found: list[str] = []
    for category in SKILL_CATALOG.values():
        for skill in category:
            pattern = rf"\b{re.escape(skill.lower())}\b"
            if re.search(pattern, lower_text):
                found.append(skill)
    soft = [skill for skill in SOFT_SKILLS if re.search(rf"\b{re.escape(skill)}\b", lower_text)]
    return _unique(found), _unique(soft)


def _extract_section_items(lines: list[str], section: str) -> list[EducationItem]:
    start = _find_section(lines, section)
    if start == -1:
        return []
    
    section_lines = []
    for line in lines[start + 1 :]:
        if _looks_like_heading(line) and section not in line.lower():
            break
        if len(line.strip()) > 2:
            section_lines.append(line.strip())
            
    items = []
    current_item = None
    degree_keywords = ["bachelor", "master", "ph.d", "b.tech", "m.tech", "b.s", "m.s", "b.sc", "m.sc", "bca", "mca", "bba", "mba", "diploma", "degree", "class xii", "class x", "high school", "ssc", "hsc"]
    year_re = re.compile(r"\b(19|20)\d{2}\b")
    
    for line in section_lines:
        lower_line = line.lower()
        is_new_entry = any(kw in lower_line for kw in degree_keywords) or (current_item is None)
        
        if is_new_entry:
            if current_item:
                items.append(current_item)
            current_item = EducationItem(degree=line, institution="", year="", details="")
        else:
            if not current_item.institution:
                years = year_re.findall(line)
                if years:
                    current_item.year = " - ".join(years) if len(years) > 1 else years[0]
                current_item.institution = line
            else:
                years = year_re.findall(line)
                if years and not current_item.year:
                    current_item.year = " - ".join(years) if len(years) > 1 else years[0]
                if current_item.details:
                    current_item.details += " | " + line
                else:
                    current_item.details = line
                    
    if current_item:
        items.append(current_item)
    return items[:8]


def _extract_project_items(lines: list[str]) -> list[ProjectItem]:
    start = _find_section(lines, "project")
    if start == -1:
        return []
    
    section_lines = []
    for line in lines[start + 1 :]:
        if _looks_like_heading(line) and "project" not in line.lower():
            break
        if len(line.strip()) > 2:
            section_lines.append(line.strip())
            
    items = []
    current_item = None
    bullet_re = re.compile(r"^([-\*•]|\d+\.)")
    
    for line in section_lines:
        is_bullet = bool(bullet_re.match(line))
        is_title = not is_bullet and (len(line) < 60 or "project" in line.lower() or current_item is None)
        
        if is_title:
            if current_item:
                items.append(current_item)
            techs = []
            tech_match = re.search(r"\((.*?)\)", line)
            title = line
            if tech_match:
                tech_str = tech_match.group(1)
                techs = [t.strip() for t in re.split(r"[,/|]", tech_str)]
                title = line.replace(tech_match.group(0), "").strip()
            current_item = ProjectItem(title=title, description="", technologies=techs)
        else:
            clean_line = bullet_re.sub("", line).strip()
            if current_item:
                tech_prefix = re.search(r"\b(tech stack|technologies|built with|using):\s*(.*)", clean_line, re.IGNORECASE)
                if tech_prefix:
                    techs = [t.strip() for t in re.split(r"[,/|]", tech_prefix.group(2))]
                    current_item.technologies = list(dict.fromkeys(current_item.technologies + techs))
                
                if current_item.description:
                    current_item.description += " " + clean_line
                else:
                    current_item.description = clean_line
                    
    if current_item:
        items.append(current_item)
    return items[:8]


def _extract_experience(lines: list[str]) -> list[ExperienceItem]:
    start = _find_section(lines, "experience")
    if start == -1:
        return []
    
    section_lines = []
    for line in lines[start + 1 :]:
        if _looks_like_heading(line) and "experience" not in line.lower():
            break
        if len(line.strip()) > 2:
            section_lines.append(line.strip())
            
    items = []
    current_item = None
    bullet_re = re.compile(r"^([-\*•]|\d+\.)")
    year_re = re.compile(r"\b(19|20)\d{2}\b")
    
    for line in section_lines:
        is_bullet = bool(bullet_re.match(line))
        company_keywords = ["intern", "developer", "engineer", "designer", "consultant", "analyst", "manager", "lead", "officer", "executive", "company", "inc", "ltd", "corp", "solutions", "technologies", "systems"]
        is_new_experience = not is_bullet and (any(kw in line.lower() for kw in company_keywords) or year_re.search(line) or current_item is None)
        
        if is_new_experience:
            if current_item:
                items.append(current_item)
            current_item = ExperienceItem(title=line, company="", duration="", details="")
        else:
            clean_line = bullet_re.sub("", line).strip()
            if current_item:
                dates = year_re.findall(line)
                if dates and not current_item.duration:
                    current_item.duration = line
                elif not current_item.company:
                    current_item.company = line
                else:
                    if current_item.details:
                        current_item.details += " | " + clean_line
                    else:
                        current_item.details = clean_line
                        
    if current_item:
        items.append(current_item)
    return items[:8]


def _extract_bullets(lines: list[str], headings: list[str]) -> list[str]:
    start = next((i for i, line in enumerate(lines) if any(h in line.lower() for h in headings)), -1)
    if start == -1:
        return []
    collected = []
    for line in lines[start + 1 :]:
        if _looks_like_heading(line) and not any(h in line.lower() for h in headings):
            break
        if len(line) > 2:
            collected.append(line)
    return _unique(collected)[:10]


def _find_section(lines: list[str], section: str) -> int:
    for index, line in enumerate(lines):
        if section in line.lower():
            return index
    return -1


def _looks_like_heading(line: str) -> bool:
    value = line.strip().lower()
    if len(value) > 30:
        return False
    heading_keywords = ["education", "project", "experience", "certification", "license", "skill", "achievement", "contact", "summary"]
    return any(hk in value for hk in heading_keywords)


def _unique(items: list[str]) -> list[str]:
    return list(dict.fromkeys(item.strip() for item in items if item.strip()))

