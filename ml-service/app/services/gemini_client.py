"""Gemini (Google) integration for ML service."""

from __future__ import annotations

import httpx
from typing import Optional


class GeminiClient:
    def __init__(self, api_key: str, model: str | None = None, timeout_seconds: int = 120) -> None:
        self.api_key = api_key
        self.model = model or "gemini-2.5-flash"
        self.timeout_seconds = timeout_seconds

    async def generate(self, prompt: str, response_mime: str = "text/plain") -> str:
        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
            f"?key={httpx.utils.quote(self.api_key)}"
        )
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4, "responseMimeType": response_mime},
        }
        timeout = httpx.Timeout(10.0, read=self.timeout_seconds)
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(endpoint, json=payload)
            resp.raise_for_status()
            j = resp.json()
            # Extract text from candidates -> content -> parts
            parts = (
                j.get("candidates", []) and j["candidates"][0].get("content", {}).get("parts", [])
            )
            if not parts:
                # fallback: try to return raw as string
                return str(j)
            text = "\n".join([p.get("text", "") for p in parts]).strip()
            return text
