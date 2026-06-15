from app.extractors.resume_extractor import extract_resume_data


def test_extract_resume_data_finds_skills_and_contact():
    text = """
    John Doe
    john@example.com
    +1 555-555-5555
    GitHub: github.com/johndoe

    Education
    B.Tech in Computer Science

    Projects
    Resume Parser

    Skills
    Python JavaScript React Communication
    """
    data = extract_resume_data(text)
    assert data.contact_info.email == "john@example.com"
    assert "python" in [skill.lower() for skill in data.skills]
    assert data.projects

