"""Knowledge base loading."""

from __future__ import annotations

import json
from pathlib import Path


def load_knowledge_base(base_path: str) -> list[dict[str, object]]:
    root = Path(base_path)
    if not root.exists():
        alt_root = Path(__file__).resolve().parents[2] / base_path
        if alt_root.exists():
            root = alt_root

    documents: list[dict[str, object]] = []
    for name in [
        "internships.json",
        "career_paths.json",
        "courses.json",
        "projects.json",
        "interview_guides.json",
    ]:
        file_path = root / name
        if not file_path.exists():
            continue
        items = json.loads(file_path.read_text(encoding="utf-8"))
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            text_parts = [str(value) for value in item.values() if value not in (None, "")]
            text = " ".join(text_parts).strip()
            documents.append(
                {
                    "text": text,
                    "source": name.replace(".json", ""),
                    "type": name.replace(".json", ""),
                    **item,
                }
            )
    return documents
