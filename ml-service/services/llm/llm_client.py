"""Minimal LLM client wrapper."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any
from google import genai
from google.genai import types

import httpx

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class LLMClient:
    """Gemini LLM client."""

    provider: str = "gemini"
    model: str = "gemini-2.5-flash"
    api_key: str | None = None

    def generate_json(
        self,
        prompt: str,
        schema_hint: dict[str, Any] | None = None,) -> dict[str, Any]:

        if not self.api_key:
            return {}

        system_prompt = (
            "Return valid JSON only. Do not wrap the response in markdown."
            + (
                f" Expected shape: {json.dumps(schema_hint)}"
                if schema_hint
                else ""
            )
        )

        try:
            client = genai.Client(api_key=self.api_key)

            response = client.models.generate_content(
                model=self.model,
                contents=f"{system_prompt}\n\n{prompt}",
                config=types.GenerateContentConfig(
                    temperature=0
                ),
            )

            content = response.text

            return json.loads(_strip_json_fences(content))

        except Exception as exc:
            logger.warning(
                "Gemini JSON generation failed: %s",
                exc,
            )
            return {}


def generate_text(prompt: str) -> str:
    """Compatibility helper for older call sites."""

    _ = prompt
    return ""


def get_default_llm_client() -> LLMClient:
    """Build an LLM client from environment variables."""

    return LLMClient(
        provider="gemini",
        model=os.getenv(
            "GEMINI_MODEL",
            "gemini-2.5-flash",
        ),
        api_key=os.getenv(
            "GEMINI_API_KEY"
        ),
    )


def _strip_json_fences(content: str) -> str:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    return cleaned.strip()
