import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.schemas import ChatRequest

router = APIRouter(prefix="/inference")


def _sse_event(payload: dict[str, str | bool]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@router.post("/chat")
async def chat(request: Request, body: ChatRequest) -> StreamingResponse:
    model = request.app.state.chat_model
    settings = get_settings()

    async def event_generator() -> AsyncIterator[str]:
        async for token in model.stream(
            body.messages,
            max_new_tokens=body.max_new_tokens or settings.max_new_tokens_default,
            temperature=body.temperature,
            top_p=body.top_p,
            top_k=body.top_k,
        ):
            if token:
                yield _sse_event({"delta": token})
        yield _sse_event({"done": True})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
