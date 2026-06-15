from services.extraction.pdf_parser import extract_pdf_text
from services.extraction.section_detector import detect_sections


import re

text = extract_pdf_text("uploads/MANSI_Resume.pdf")

headers = re.findall(
    r'(Education|Projects|Technical Skills|Achievements\s*&\s*Certifications)',
    text,
    re.IGNORECASE
)

print(headers)