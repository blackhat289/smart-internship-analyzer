"""Unified file extraction."""

from __future__ import annotations

from pathlib import Path

import fitz

try:
    from docx import Document
except ModuleNotFoundError:  # pragma: no cover - optional dependency fallback
    Document = None


def extract_text_from_file(path: str) -> str:
    suffix = Path(path).suffix.lower()
    if suffix == ".pdf":
        return extract_pdf_text(path)
    if suffix == ".docx":
        return extract_docx_text(path)
    raise ValueError("Unsupported file type. Only PDF and DOCX are supported.")


def extract_pdf_text(path: str) -> str:
    doc = fitz.open(path)
    try:
        return "\n".join(page.get_text("text") for page in doc)
    finally:
        doc.close()


def extract_docx_text(path: str) -> str:
    if Document is None:
        raise RuntimeError("python-docx is not installed.")
    document = Document(path)
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
