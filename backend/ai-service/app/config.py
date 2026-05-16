from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M"

    max_new_tokens_default: int = 512
    temperature_default: float = 1.0
    top_p_default: float = 0.95
    top_k_default: int = 64


@lru_cache
def get_settings() -> Settings:
    return Settings()
