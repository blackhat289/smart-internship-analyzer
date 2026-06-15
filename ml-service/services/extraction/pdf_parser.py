"""PDF parsing utilities for resume text extraction."""

from __future__ import annotations

from pathlib import Path
from typing import Final

import fitz  # PyMuPDF
import pdfplumber


WHITESPACE_REPLACEMENT: Final[str] = " "


def _clean_text(text: str) -> str:
    """Normalize whitespace while preserving paragraph boundaries."""

    lines = [line.strip() for line in text.splitlines()]
    compact = [line for line in lines if line]
    return WHITESPACE_REPLACEMENT.join(compact).strip()


def _extract_with_pdfplumber(pdf_path: str) -> str:
    """Extract text using pdfplumber."""

    chunks: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                chunks.append(page_text)
    return "\n".join(chunks)


def _extract_with_pymupdf(pdf_path: str) -> str:
    """Fallback text extraction using PyMuPDF."""

    doc = fitz.open(pdf_path)
    try:
        chunks: list[str] = []
        for page in doc:
            page_text = page.get_text("text") or ""
            if page_text.strip():
                chunks.append(page_text)
        return "\n".join(chunks)
    finally:
        doc.close()


def extract_pdf_text(pdf_path: str) -> str:
    """Extract and clean text from a PDF resume.

    The function first attempts pdfplumber because it tends to produce
    consistent text for résumé layouts. If that fails or yields no text,
    PyMuPDF is used as a fallback.
    """

    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    text = ""
    errors: list[str] = []

    try:
        text = _extract_with_pdfplumber(str(path))
    except Exception as exc:  # pragma: no cover - best-effort fallback
        errors.append(f"pdfplumber: {exc}")

    if not text.strip():
        try:
            text = _extract_with_pymupdf(str(path))
        except Exception as exc:  # pragma: no cover - best-effort fallback
            errors.append(f"PyMuPDF: {exc}")

    if not text.strip():
        error_suffix = f" ({'; '.join(errors)})" if errors else ""
        raise ValueError(f"Unable to extract text from PDF{error_suffix}")

    return _clean_text(text)
