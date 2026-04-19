# Bhisma Backend

Express + SQLite backend for model management, attack retrieval/customization, test execution, defense transformations, and comparison analysis.

## Tech stack

- Node.js (ESM)
- Express 5
- better-sqlite3
- helmet
- express-rate-limit
- cors
- openai SDK + groq SDK

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Run in development:

```bash
npm run dev
```

Run in production mode:

```bash
npm start
```

Run tests:

```bash
npm test
```

Latest local test evidence:

- `Test Files 5 passed (5)`
- `Tests 36 passed (36)`
- `Duration 9.89s`

## Environment variables

See `.env.example`. Main variables:

- `PORT=3001`
- `CORS_ORIGIN=http://localhost:5173`
- `GROQ_API_KEY=...` (only needed if using Groq models)
- `OPENAI_API_KEY=...` (only needed if using OpenAI models)

Optional variables in `.env.example` are documented for local setups.

## Security middleware

- Helmet headers
- Route-level rate limiting:
  - General: 100 requests per 15 minutes on `/tests` and `/models`
  - Strict: 5 requests per minute on `/tests/run` and `/tests/auto-scan`
- JSON/urlencoded body size limits (`10kb`)
- Malformed JSON handling (`400`)
- Oversized payload handling (`413`)

## API endpoints

Base URL: `http://localhost:3001`

### Health

- `GET /health`

### Models

- `GET /models`
- `POST /models`
- `POST /models/:id/test`
- `DELETE /models/:id`

### Attacks

- `GET /attacks`
  - Optional query: `category`
- `GET /attacks/categories`
- `GET /attacks/:id`
- `POST /attacks` (create custom attack)
- `DELETE /attacks/:id` (custom IDs only)

### Tests

- `POST /tests/run`
- `POST /tests/auto-scan`
- `GET /tests`
- `GET /tests/:id`

### Defenses

- `GET /defenses`
- `GET /defenses/:id`
- `POST /defenses/apply`
- `POST /defenses/scan-output`

### Compare

- `POST /compare`
- `GET /compare`
- `POST /compare/analyze`

## Local model connection guidance

Use `POST /models` to add a model, then call `POST /models/:id/test` to verify connectivity.

- `groq`
  - Requires `apiKey`
  - Uses provided `modelId` or default `llama-3.3-70b-versatile`

- `openai`
  - Requires `apiKey`
  - Uses provided `modelId` or default `gpt-3.5-turbo`

- `ollama` (local)
  - No real API key required
  - Uses endpoint from model config, or default `http://localhost:11434/v1`
  - Uses provided `modelId` or default `llama2`

- `custom` (OpenAI-compatible local server)
  - Requires `endpoint`
  - Expects OpenAI-compatible chat completions route
  - Uses provided `modelId` or default `default`

## Response behavior notes

- Error responses are normalized to include `error` and `message` (with `details` when available).
- Success payload shape is route-specific to preserve frontend compatibility.

## Data persistence

SQLite tables are initialized in backend startup via `src/db.js` and used through prepared statements imported as `stmts`.

## Known limitations

- No auth/user isolation (single-tenant local workflow).
- Provider connectivity and latency depend on external model services.
- Auto-scan returns aggregated result after completion (no server push/streaming updates).
