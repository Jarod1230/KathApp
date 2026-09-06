# Development — KathApp

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm (workspaces in root `package.json`; pnpm also works)
- Docker + Docker Compose

## Environment

```bash
cp .env.example .env
```

Key vars:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma → Postgres |
| `PORT` | API listen port (default `3000`) |
| `JWT_SECRET` | Bearer JWT signing secret |
| `JWT_EXPIRES_IN` | Access token TTL (default `7d`) |
| `AUTH_DEV_LOGIN` | `true` enables `POST /v1/auth/dev-login` (default on when `NODE_ENV!==production` unless explicitly `false`) |
| `VITE_API_URL` | Web → API base URL (default `http://localhost:3000`) |

## Copy-paste run (Slice A+B)

```bash
# 1) Infra
cp .env.example .env
docker compose up -d

# 2) Install + shared build
npm install
npm run build -w @kathapp/shared

# 3) Prisma client + apply committed migration
npm run prisma:generate -w @kathapp/api
npm run prisma:migrate:deploy -w @kathapp/api
# (dev alternative creating new migrations: npm run prisma:migrate -w @kathapp/api)

# 4) API (terminal A)
npm run dev:api
# health:  http://localhost:3000/health
# search:  http://localhost:3000/v1/search?q=test&locale=de
# docs:    http://localhost:3000/docs

# 5) Web (terminal B)
npm run dev:web
# http://localhost:5173/de/search
```

Empty database: search returns `{ items: [] }`; detail routes return **404** for unknown/draft/soft-deleted ids. **No invented saints/miracles seed** — prefer empty; optional stub rows only if clearly labeled `Stub Entity (dev)` + `draft`.

## Scripts

| Script | Intent |
| --- | --- |
| `npm run dev:api` | Nest API watch mode |
| `npm run dev:web` | Vite web app |
| `npm run build` | Build shared → api → web |
| `npm run typecheck` | Typecheck all workspaces (includes `test/`) |
| `npm run lint` | ESLint across the whole monorepo (root flat config) |
| `npm run lint:fix` | ESLint with `--fix` |
| `npm test` | Vitest unit tests (api + web) |
| `npm run test:watch -w @kathapp/api` | Vitest watch mode for one workspace |
| `npm run prisma:generate -w @kathapp/api` | Generate Prisma client |
| `npm run prisma:migrate:deploy -w @kathapp/api` | Apply committed migrations |
| `npm run prisma:migrate -w @kathapp/api` | Dev migrate (may prompt) |
| `npm run prisma:studio -w @kathapp/api` | Prisma Studio |

## API (public read + auth/suggestions)

- `GET /health` — liveness
- `GET /v1` — contract root
- `GET /v1/search?q=&locale=&type=&limit=&offset=` — published entities matching a translation in **any** content locale; empty `q` → empty list. `total` counts every match, `limit` (default 20, max 100) and `offset` are clamped and echoed back (ADR 0004)
- `GET /v1/saints/:id?locale=` — published saint + translations, citations, edge chips
- `GET /v1/miracles/:id?locale=` — same for miracles
- `GET /v1/sources/:id?locale=` — same for sources
- `POST /v1/auth/dev-login` — upsert user + JWT (dev only; see Auth section)
- `GET /v1/auth/me` — Bearer → current user
- `POST /v1/suggestions` — Bearer contributor+ submit
- `GET /v1/suggestions` — Bearer reviewer+ list (`?status=`)
- `GET /v1/suggestions/:id` — Bearer owner or reviewer+
- `POST /v1/suggestions/:id/accept` — Bearer reviewer+ (publish-gates)
- `POST /v1/suggestions/:id/reject` — Bearer reviewer+
- OpenAPI: `/docs`

Filters on public reads: `status=published`, `deletedAt IS NULL`. CORS allows `http://localhost:5173`.


## Auth + Suggestions (dev)

Dev login is enabled when `AUTH_DEV_LOGIN=true`, or when `NODE_ENV!==production` and the flag is not explicitly `false`. Disabled in production by default (endpoint → 404).

```bash
# Dev login → JWT
curl -s -X POST http://localhost:3000/v1/auth/dev-login \
  -H 'content-type: application/json' \
  -d '{"email":"reviewer@example.com","role":"reviewer"}'
# → { "accessToken":"...", "user":{ "id","email","role" } }

TOKEN='<accessToken from above>'

# Current user
curl -s http://localhost:3000/v1/auth/me -H "authorization: Bearer $TOKEN"

# Submit suggestion (contributor+)
curl -s -X POST http://localhost:3000/v1/suggestions \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{
    "schemaVersion": 1,
    "payload": {
      "kind": "entity",
      "op": "create",
      "entityType": "source",
      "fields": { "language": "la", "status": "draft" },
      "translations": [{ "locale": "de", "field": "title", "value": "Stub Entity (dev)" }]
    }
  }'

# List (reviewer+)
curl -s "http://localhost:3000/v1/suggestions?status=submitted" \
  -H "authorization: Bearer $TOKEN"

# Accept / reject (reviewer+) — accept runs publish-gates when resulting status is published
# curl -s -X POST http://localhost:3000/v1/suggestions/<id>/accept -H "authorization: Bearer $TOKEN"
# curl -s -X POST http://localhost:3000/v1/suggestions/<id>/reject \
#   -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
#   -d '{"reviewNote":"needs citation"}'
```

Publish-gate failures on accept return **400** with `{ "gates": ["MISSING_TRANSLATION_DE_EN"|"MISSING_CITATION"|"MISSING_SAINT_MIRACLE_EDGE"], "message": "Publish gates failed" }`.

Public `GET` search/detail stay open (no Bearer required).

## Web

- Dev: `http://localhost:5173` — locale entry `/de`, `/en`
- Search + entity detail call the API via TanStack Query (`VITE_API_URL`)
- Suggest + admin routes remain stubs

## Database

Prisma schema: `apps/api/prisma/schema.prisma`  
Committed migration: `apps/api/prisma/migrations/20260906120000_init/`

## Quality Gates

CI runs lint, typecheck, test and build, and **every one of them blocks the merge**.
Run the same sequence locally before pushing:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### Integration tests

Tests that touch the database need a running Postgres and `TEST_DATABASE_URL`
in the root `.env`. They use a **separate schema** (`?schema=test`), so they
truncate their own tables and never touch your working data.

```bash
docker compose up -d
npm test
```

Without `TEST_DATABASE_URL` the integration suite is skipped locally. Under CI
it is a hard error, so the suite cannot quietly disappear into a false green.

Linting is owned by the root `eslint.config.mjs`; workspaces do not carry their own
lint scripts. `@typescript-eslint/consistent-type-imports` is disabled for
`apps/api` on purpose: NestJS resolves constructor dependencies from the
`design:paramtypes` metadata TypeScript emits, and an `import type` is erased
before that metadata is written, which breaks DI at runtime.

## Environment

There is exactly **one** `.env`, at the repository root. npm runs workspace
scripts with the working directory set to the workspace, so neither Prisma nor
Nest would find it on their own. The `dev` and `prisma:*` scripts in
`apps/api` therefore load it explicitly via `dotenv-cli`. A missing file is
tolerated, and variables already present in the environment win, so CI and
production keep using real environment variables.

`start` / `start:prod` deliberately do **not** read `.env` — deployments supply
their own environment.

## Notes

- Do not commit secrets; keep `.env` local.
- Build `@kathapp/shared` before api/web so workspace imports resolve to `dist/`.
- GPL-3.0 — do not break LICENSE.
