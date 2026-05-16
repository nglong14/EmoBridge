from fastapi import APIRouter, Request

from app.config import get_settings

router = APIRouter()


@router.get("/health")
async def health(request: Request) -> dict[str, str | bool]:
    model = request.app.state.chat_model
    settings = get_settings()
    return {
        "status": "ok",
        "model_loaded": model.is_loaded,
        "model": settings.ollama_model,
        "backend": model.device,
    }
