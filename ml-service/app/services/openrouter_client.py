"""OpenRouter API integration for ML service."""

from __future__ import annotations

import httpx


OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"


class OpenRouterClient:
    def __init__(
        self,
        api_key: str,
        model: str | None = None,
        timeout_seconds: int = 120,
        site_url: str = "http://localhost:5173",
        site_name: str = "Smart Internship Analyzer",
    ) -> None:
        self.api_key = api_key
        self.model = model or "openai/gpt-4o-mini"
        self.timeout_seconds = timeout_seconds
        self.site_url = site_url
        self.site_name = site_name

    async def generate(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.4,
        }
        timeout = httpx.Timeout(10.0, read=self.timeout_seconds)
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{OPENROUTER_API_BASE}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            j = resp.json()
            choices = j.get("choices", [])
            if not choices:
                return str(j)
            return choices[0].get("message", {}).get("content", "").strip()
