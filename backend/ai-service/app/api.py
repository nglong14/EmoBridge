import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.inference.ollama_client import OllamaChatClient
from app.routes.chat import router as chat_router
from app.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(level=settings.log_level.upper())
    logger = logging.getLogger("ai-service")

    model = OllamaChatClient(settings)
    logger.info(
        "Pinging Ollama %s for model %s",
        settings.ollama_host,
        settings.ollama_model,
    )
    await model.load()
    logger.info("Ollama model is available: %s", settings.ollama_model)
    app.state.chat_model = model
    try:
        yield
    finally:
        await model.aclose()


app = FastAPI(title="EmoBridge AI Service", lifespan=lifespan)
app.include_router(health_router)
app.include_router(chat_router)
