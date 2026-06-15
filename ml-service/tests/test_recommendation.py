from app.analyzers.analysis_engine import analyze_resume
from app.extractors.resume_extractor import extract_resume_data
from app.services.recommendation_engine import fallback_recommendations


def test_fallback_recommendations_returns_structured_payload():
    resume = extract_resume_data("John\njohn@example.com\nSkills Python React\nProjects X")
    analysis = analyze_resume(resume)
    result = fallback_recommendations(analysis, [{"type": "courses", "title": "FastAPI"}])
    assert "internship_recommendations" in result
    assert "learning_roadmap" in result

