"""Text preprocessing utilities."""

from __future__ import annotations

import re


def normalize_whitespace(text: str) -> str:
    return re.sub(r"[ \t]+", " ", (text or "")).strip()


def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[^\w\s@./&+\-#:(),\n]", " ", text)
    lines = [normalize_whitespace(line) for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def lowercase_safe(text: str) -> str:
    return clean_text(text).lower()


def split_lines(text: str) -> list[str]:
    return [line.strip() for line in (text or "").splitlines() if line.strip()]
