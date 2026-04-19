# Bhisma

Bhisma is a full-stack LLM security testing platform for running prompt-security assessments, reviewing risk outcomes, trying defense transformations, and comparing model runs.

## What is implemented

- Frontend: React + Vite dashboard with pages for Models, Attacks, Defenses, Test, Results, and Compare.
- Backend: Express API with SQLite persistence for models, tests, comparisons, and custom attacks.
- Security middleware: Helmet, rate limiting, CORS, JSON/body-size guards.
- Report tooling: JSON export, print/PDF view support, clipboard copy helpers.

## Repository structure

- `frontend/` – React app
- `backend/` – Express API

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env` values as needed (see Environment Variables below), then run:

```bash
npm run dev
```

Backend runs on `http://localhost:3001` by default.

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment variables

### Backend (`backend/.env`)

- `PORT` (default: `3001`)
- `CORS_ORIGIN` (recommended single origin, e.g. `http://localhost:5173`)
- `GROQ_API_KEY` (optional, required only if using Groq provider)
- `OPENAI_API_KEY` (optional, required only if using OpenAI provider)
- Optional local settings are documented in `backend/.env.example`.

### Frontend (`frontend/.env`)

- `VITE_API_URL` (default local value: `http://localhost:3001`)

## API summary

Base URL: `http://localhost:3001`

- Health
  - `GET /health`
- Models
  - `GET /models`
  - `POST /models`
  - `POST /models/:id/test`
  - `DELETE /models/:id`
- Attacks
  - `GET /attacks`
  - `GET /attacks/categories`
  - `GET /attacks/:id`
  - `POST /attacks` (custom attack)
  - `DELETE /attacks/:id` (custom attacks only)
- Tests
  - `POST /tests/run`
  - `POST /tests/auto-scan`
  - `GET /tests`
  - `GET /tests/:id`
- Defenses
  - `GET /defenses`
  - `GET /defenses/:id`
  - `POST /defenses/apply`
  - `POST /defenses/scan-output`
- Compare
  - `POST /compare`
  - `GET /compare`
  - `POST /compare/analyze`

## Run instructions

From each package directory:

- Backend: `npm run dev` (or `npm start`)
- Frontend: `npm run dev`

Optional checks:

- Backend tests: `cd backend && npm test`
- Frontend tests: `cd frontend && npm test`
- Frontend lint: `cd frontend && npm run lint`

## Classroom demo evidence (confirmed)

- Backend startup confirmed: `npm run dev` starts API on `http://localhost:3001`.
- Frontend startup confirmed: `npm run dev` starts Vite dev server and UI is reachable locally.
- Backend tests confirmed: `Test Files 5 passed (5)`, `Tests 36 passed (36)`, `Duration 9.89s`.
- Frontend tests confirmed: `Test Files 5 passed (5)`, `Tests 32 passed (32)`, `Duration 70.94s`.

## Local model connection guide (for teacher demo)

Use the Models page and click `Test Connection` after adding each model.

- Groq (cloud)
  - Provider: `groq`
  - Required: API key
  - Model ID example: `llama-3.3-70b-versatile`

- OpenAI (cloud)
  - Provider: `openai`
  - Required: API key
  - Model ID example: `gpt-4o-mini`

- Ollama (local)
  - Start Ollama and ensure the model exists locally.
  - Recommended endpoint: `http://localhost:11434/v1`
  - Model ID example: `llama3`
  - Note: the app normalizes Ollama endpoints to use `/v1` for OpenAI-compatible routing.

- Custom local server (OpenAI-compatible)
  - Provider: `custom`
  - Endpoint should expose `POST /v1/chat/completions`
  - Endpoint example: `http://localhost:5000/v1`
  - Model ID: use the exact model name expected by your local server
  - API key is optional for many local servers

### Quick setup matrix (beginner-friendly)

| Provider | Required fields | Optional fields | Endpoint example | Model ID example |
|---|---|---|---|---|
| Groq | Model Name, Provider, API Key | Model ID | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| OpenAI | Model Name, Provider, API Key | Model ID | `https://api.openai.com/v1` | `gpt-4o-mini` |
| Ollama (local) | Model Name, Provider, Endpoint URL | API Key, Model ID | `http://localhost:11434/v1` | `llama3` |
| Custom OpenAI-compatible local server | Model Name, Provider, Endpoint URL, Model ID | API Key | `http://localhost:5000/v1` | `my-local-model` |

### Connection troubleshooting checklist

1. Confirm your local server is running (for Ollama: `ollama serve`).
2. Confirm endpoint includes `/v1` when using OpenAI-compatible routes.
3. Confirm model ID is valid on that provider/server.
4. Confirm API key is present and valid for cloud providers.
5. Confirm backend is reachable at `http://localhost:3001`.

This project is intentionally classroom-demo focused. It does not claim production-scale reliability, throughput, or multi-tenant isolation.

## 5-10 minute classroom demo checklist

1. Start backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`).
2. Add a model in Models page and run `Test Connection`.
3. Select attacks in Attacks page.
4. Run a manual test from Test page.
5. Open Results page and inspect one result.
6. Run a second test and compare in Compare page.
7. Apply a defense and run output scan in Defenses page.

## Known limitations

- No authentication/authorization layer yet.
- Test execution is request/response based (no streaming progress from backend).
- Auto-scan progress in UI is coarse-grained because backend returns aggregate output at completion.
- Compare endpoint may fail with HTTP 413 if test result arrays are very large; frontend gracefully falls back to client-side analysis.

## Additional docs

- Backend details: `backend/README.md`
- Frontend details: `frontend/README.md`
