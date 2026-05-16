# EmoBridge — Agent Instructions

## Project Overview
Privacy-conscious emotional AI companion. React frontend → Express gateway → FastAPI/Ollama AI service.

## Multi-Package Structure

| Package | Path | Language | Package Manager | Entrypoint |
|---|---|---|---|---|
| Frontend | `frontend/` | TS (React) | npm | `src/main.tsx` → vite dev server on :5173 |
| Gateway | `backend/gateway/` | TS (Express 5, ESM) | npm | `src/server.ts` → listens on :3000 |
| AI Service | `backend/ai-service/` | Python 3.13+ | uv | `main.py` → uvicorn on :8000 |

## Dev Commands

```bash
# Frontend (from frontend/)
npm run dev          # vite dev server (proxies /auth & /api → :3000)
npm run build        # tsc && vite build

# Gateway (from backend/gateway/)
npm run dev          # tsx watch src/server.ts | pino-pretty --colorize
npm run build        # tsc
npx prisma migrate dev  # apply DB migrations
npx prisma generate     # regenerate Prisma client after schema change

# AI Service (from backend/ai-service/)
uv run uvicorn main:app --reload          # dev server
uv sync                                   # install deps

# Infrastructure (from root)
docker compose up    # starts ollama + ai-service only (NOT gateway or frontend)
```

## Setup Order

1. Install deps in all three packages (`npm install` in frontend & backend/gateway; `uv sync` in backend/ai-service)
2. Copy `.env.example` → `.env` in `backend/gateway/` and `backend/ai-service/`
3. Start PostgreSQL (not managed by docker compose)
4. Run `npx prisma migrate dev` in `backend/gateway/` to create DB tables
5. Start Ollama + AI service: `docker compose up`
6. Start gateway: `npm run dev` in `backend/gateway/`
7. Start frontend: `npm run dev` in `frontend/`

## Architecture Notes

- **Frontend → Gateway proxy**: Vite proxies `/auth` and `/api` to `http://localhost:3000`. All frontend API calls use relative paths.
- **Gateway → AI Service**: Routes not yet wired; AI service URL set via `AI_SERVICE_URL` env (default `http://localhost:8000`). AI service exposes `/inference/chat` (SSE streaming).
- **Auth**: Stateless JWT (HS256), 15m expiry, no refresh tokens. Token stored in `localStorage`. `requireAuth` middleware applied per-route (not globally). Login/register/me under `/auth`, contacts under `/api/contacts` (all require auth).
- **Gateway logging**: Uses `pino` + `pino-http`. Dev command pipes through `pino-pretty`. Production builds output raw JSON — do not pipe through prettifier.
- **Prisma**: PostgreSQL. Schema in `backend/gateway/prisma/schema.prisma`. Client singleton in `backend/gateway/src/db/prisma.ts` (cached on `globalThis` in dev to avoid hot-reload duplicate connections).

## TypeScript Conventions (Gateway)

- **No `any`** — use `unknown` instead. Enforced by `.cursor/skills/typescript-backend/SKILL.md`.
- **No enums** — use string union types. (Exception: Prisma schema generates `Channel` enum from DB schema.)
- **ESM** — all local imports must include `.js` extension (e.g. `import { env } from "./config/index.js"`).
- **`noUncheckedIndexedAccess: true`** — array/element access returns `T | undefined`. Check for `undefined` before use.
- **`exactOptionalPropertyTypes: true`** — `{ key?: undefined }` cannot be assigned to `{ key?: T }`.
- **Error handling**: Throw `AppError(message, statusCode)` (from `src/middleware/error.ts`). Client-visible when `statusCode < 500`. `ZodError` → 400 with `issues` array.

## Zod Validation Pattern (Gateway)

Use the `validate()` middleware factory per-route:

```ts
import { validate } from "../middleware/validate.js";

router.post("/path", validate({ body: schema, params: schema, query: schema }), handler);
```

## Frontend Conventions

- `src/lib/api.ts` wraps `fetch` with automatic Bearer token injection from `localStorage`.
- Custom `ApiError` class carries `status`, `message`, and optional `issues: ZodIssue[]`.
- Auth state via React context in `src/contexts/AuthContext.tsx`.

## AI Service Notes

- Python 3.13+ required. Managed via `uv`.
- Settings loaded via `pydantic-settings` from `.env` file (auto-loaded, no `dotenv.load_dotenv()` call needed).
- The Ollama client validates the model is available at startup via `/api/tags` — fails fast if not pulled.
- Chat responses stream as SSE (`text/event-stream`) with `data: {"delta": "..."}` events and a final `data: {"done": true}`.

## What's Not Yet Implemented

- No test framework yet (no vitest, jest, or pytest configs found).
- No CI/CD pipeline (no `.github/workflows/`).
- Gateway → AI service forwarding not wired.
- No lint/format configs (eslint/prettier in devDeps but no config files).
- `.cursor/DESIGN.md` is a **Notion brand design system reference** — not EmoBridge's own design system. Do not confuse the two.
