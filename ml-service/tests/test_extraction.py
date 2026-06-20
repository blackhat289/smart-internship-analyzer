from services.extraction.pdf_parser import extract_pdf_text
from services.extraction.section_detector import detect_sections
from services.extraction.education_extractor import extract_education


import re

text = extract_pdf_text("uploads/MANSI_Resume.pdf")

headers = re.findall(
    r'(Education|Projects|Technical Skills|Achievements\s*&\s*Certifications)',
    text,
    re.IGNORECASE
)

print(headers)


def test_extract_education_returns_full_payload():
    text = """
    Education
    Bachelor of Technology in Computer Science and Engineering
    Graphic Era Hill University
    2023 - 2027
    CGPA: 9.05
    Percentage: 90.5
    """

    data = extract_education(text)

    assert data["degree"] == "Bachelor of Technology"
    assert data["specialization"] == "Computer Science and Engineering"
    assert data["institution"] == "Graphic Era Hill University"
    assert data["start_year"] == "2023"
    assert data["graduation_year"] == "2027"
    assert data["cgpa"] == "9.05"
    assert data["percentage"] == "90.5"
