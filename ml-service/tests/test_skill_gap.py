from app.analyzers.skill_gap import analyze_skill_gap


def test_skill_gap_returns_missing_skills():
    result = analyze_skill_gap(["python"])
    assert "missing_skills" in result

