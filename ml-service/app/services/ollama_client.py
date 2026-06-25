"""Ollama integration with configurable timeouts and simple retries."""

from __future__ import annotations

import asyncio
import httpx
from typing import Optional


class OllamaClient:
    def __init__(
        self,
        base_url: str,
        model: str,
        timeout_seconds: int = 120,
        max_retries: int = 2,
        backoff_seconds: float = 1.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.backoff_seconds = backoff_seconds

    async def generate(self, prompt: str) -> str:
        """Call Ollama generate endpoint with retries and timeouts.

        Raises httpx.HTTPError on final failure so callers can log/handle it.
        """
        payload = {"model": self.model, "prompt": prompt, "stream": False}
        timeout = httpx.Timeout(10.0, read=self.timeout_seconds)

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.post(f"{self.base_url}/api/generate", json=payload)
                    response.raise_for_status()
                    data = response.json()
                    return data.get("response", "")
            except (httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
                if attempt >= self.max_retries:
                    raise
                await asyncio.sleep(self.backoff_seconds * attempt)
            except httpx.HTTPError:
                # No retry for non-timeout HTTP errors; bubble up to caller
                raise

