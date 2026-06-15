"""Minimal LLM client wrapper."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any

import httpx

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class LLMClient:
    """OpenAI-compatible LLM client with a deterministic fallback."""

    provider: str = "openai"
    model: str = "gpt-4o-mini"
    base_url: str = "https://api.openai.com/v1"
    api_key: str | None = None

    def generate_json(self, prompt: str, schema_hint: dict[str, Any] | None = None) -> dict[str, Any]:
        """Return structured JSON for the provided prompt."""

        if not self.api_key:
            return {}

        system_prompt = (
            "Return valid JSON only. Do not wrap the response in markdown."
            + (f" Expected shape: {json.dumps(schema_hint)}" if schema_hint else "")
        )
        try:
            response = httpx.post(
                f"{self.base_url.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0,
                },
                timeout=45.0,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(_strip_json_fences(content))
        except Exception as exc:  # pragma: no cover - provider/network fallback
            logger.warning("LLM JSON generation failed: %s", exc)
            return {}


def generate_text(prompt: str) -> str:
    """Compatibility helper for older call sites."""

    _ = prompt
    return ""


def get_default_llm_client() -> LLMClient:
    """Build an LLM client from environment variables."""

    return LLMClient(
        provider=os.getenv("LLM_PROVIDER", "openai"),
        model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        api_key=os.getenv("OPENAI_API_KEY") or None,
    )


def _strip_json_fences(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    return cleaned.strip()
