"""Text cleanup helpers."""

import re


def clean_text(text: str) -> str:
    """Normalize whitespace in free-form text."""

    return re.sub(r"\s+", " ", text).strip()
