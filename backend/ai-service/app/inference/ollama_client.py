import json
from collections.abc import AsyncIterator
from typing import Any

import httpx

from app.config import Settings
from app.schemas import ChatMessage


class OllamaChatClient:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = httpx.AsyncClient(base_url=settings.ollama_host, timeout=None)
        self._is_loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    @property
    def device(self) -> str:
        return "ollama"

    async def load(self) -> None:
        response = await self._client.get("/api/tags")
        response.raise_for_status()
        data = response.json()
        models = data.get("models", [])
        model_names = {model.get("model") for model in models if model.get("model")}

        if self._settings.ollama_model not in model_names:
            raise RuntimeError(
                "Model "
                f"{self._settings.ollama_model!r} is not available in Ollama. "
                f"Run `ollama pull {self._settings.ollama_model}` and retry."
            )

        self._is_loaded = True

    async def aclose(self) -> None:
        await self._client.aclose()

    async def stream(
        self,
        messages: list[ChatMessage],
        *,
        max_new_tokens: int,
        temperature: float,
        top_p: float,
        top_k: int,
    ) -> AsyncIterator[str]:
        if not self._is_loaded:
            raise RuntimeError("Ollama client is not initialized. Is Ollama running?")

        payload: dict[str, Any] = {
            "model": self._settings.ollama_model,
            "messages": [
                {"role": message.role, "content": message.content} for message in messages
            ],
            "stream": True,
            "options": {
                "num_predict": max_new_tokens,
                "temperature": temperature,
                "top_p": top_p,
                "top_k": top_k,
            },
        }

        async with self._client.stream("POST", "/api/chat", json=payload) as response:
            response.raise_for_status()

            async for line in response.aiter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                if chunk.get("done") is True:
                    break
                message = chunk.get("message", {})
                content = message.get("content", "")
                if content:
                    yield content
