# EmoBridge

## AI Service (Ollama Backend)

The FastAPI AI service now uses Ollama instead of loading `transformers` models in-process.

- AI service endpoint: `http://localhost:8000`
- Ollama daemon: `http://localhost:11434`
- Default model: `hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M`

### Implementation overview

`ai-service` is a thin streaming adapter between the gateway and Ollama:

1. Gateway sends chat payload to `POST /inference/chat`.
2. FastAPI route forwards messages to `OllamaChatClient`.
3. `OllamaChatClient` calls Ollama `POST /api/chat` with `stream=true`.
4. Ollama returns NDJSON chunks.
5. `ai-service` converts each chunk to SSE `data: {"delta":"..."}` and streams back.

This keeps the API contract stable for `backend/gateway` while moving model runtime concerns to Ollama.

### Key files

- `backend/ai-service/app/api.py`
  - FastAPI app + lifespan.
  - On startup, it pings Ollama and verifies the configured model exists.
  - Stores the initialized client in `app.state.chat_model`.
- `backend/ai-service/app/inference/ollama_client.py`
  - `OllamaChatClient` implementation.
  - `load()` validates model availability via `/api/tags`.
  - `stream()` consumes Ollama NDJSON stream from `/api/chat`.
- `backend/ai-service/app/routes/chat.py`
  - `POST /inference/chat`.
  - Emits SSE stream (`text/event-stream`) with `delta` chunks and final `done`.
- `backend/ai-service/app/routes/health.py`
  - `GET /health`.
  - Reports `model_loaded`, active model ID, and backend type.
- `backend/ai-service/app/config.py`
  - Pydantic settings source (`.env` + environment variables).
  - Uses `extra="ignore"` so legacy env keys (like `HF_TOKEN`) do not break startup.
- `backend/ai-service/.env.example`
  - Runtime config template for host/port and Ollama model.
- `backend/ai-service/Dockerfile`
  - Image for FastAPI service using `uv`.
- `docker-compose.yml`
  - Orchestrates `ollama` + `ai-service`.

### Configuration

Environment variables used by `ai-service`:

- `HOST` (default: `0.0.0.0`)
- `PORT` (default: `8000`)
- `OLLAMA_HOST` (default: `http://localhost:11434`)
- `OLLAMA_MODEL` (default: `hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M`)
- `LOG_LEVEL` (default: `info`)
- `MAX_NEW_TOKENS_DEFAULT` (default: `512`)

### API contract

#### `GET /health`

Returns:

```json
{"status":"ok","model_loaded":true,"model":"hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M","backend":"ollama"}
```

#### `POST /inference/chat`

Request body:

```json
{
  "messages": [
    {"role": "user", "content": "I feel anxious about work"}
  ],
  "max_new_tokens": 512,
  "temperature": 1.0,
  "top_p": 0.95,
  "top_k": 64
}
```

Response type: `text/event-stream` (SSE), example stream:

```text
data: {"delta":"I hear you..."}

data: {"delta":"Let's break this down."}

data: {"done":true}
```

### Run with Docker Compose (recommended)

From repository root:

```bash
docker compose up -d --build
```

Pull the model into Ollama (one-time per machine/volume):

```bash
docker compose exec ollama ollama pull hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M
```

Verify the model:

```bash
docker compose exec ollama ollama list
```

### Verify the API

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected shape:

```json
{"status":"ok","model_loaded":true,"model":"hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M","backend":"ollama"}
```

Streaming chat test:

```bash
curl -N -X POST http://127.0.0.1:8000/inference/chat \
  -H "content-type: application/json" \
  -d '{"messages":[{"role":"user","content":"I feel anxious about work"}]}'
```

### Useful commands

Tail logs:

```bash
docker compose logs -f ai-service
docker compose logs -f ollama
```

Stop services:

```bash
docker compose down
```

Stop and remove Ollama model volume:

```bash
docker compose down -v
```

### Run locally without Docker (optional)

Install and start Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M
```

Start AI service:

```bash
cd backend/ai-service
uv sync
cp .env.example .env
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

### Troubleshooting

- Error: `Model '...' is not available in Ollama`
  - Run: `ollama pull hf.co/nglong14/qwen2.5-3b-distressai-gguf:Q4_K_M`
- Error: `Connection refused` to Ollama
  - Ensure Ollama is running (`ollama serve`) or `docker compose up` includes `ollama`.
- Container restart loop due to settings validation
  - Rebuild after config changes: `docker compose up -d --build ai-service`
