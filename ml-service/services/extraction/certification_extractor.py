"""Certification extraction helpers."""

from __future__ import annotations

import re


CERTIFICATION_RE = re.compile(
    r"(?:certification|certificate|certified)\s*[:\-]?\s*(?P<item>[A-Za-z0-9+.#/()&,'\-\s]{2,100})",
    re.IGNORECASE,
)


def extract_certifications(text: str) -> dict[str, list[str]]:
    """Extract certifications from résumé text."""

    if not text.strip():
        return {"certifications": []}

    results = []
    for match in CERTIFICATION_RE.finditer(text):
        item = match.group("item").strip(" .:-")
        if item:
            results.append(item)

    return {"certifications": list(dict.fromkeys(results))}
