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

## API (public read slice)

- `GET /health` — liveness
- `GET /v1` — contract root
- `GET /v1/search?q=&locale=&type=` — published entities via Translation `contains` (DE/EN); empty `q` → empty list
- `GET /v1/saints/:id?locale=` — published saint + translations, citations, edge chips
- `GET /v1/miracles/:id?locale=` — same for miracles
- `GET /v1/sources/:id?locale=` — same for sources
- OpenAPI: `/docs`

Filters: `status=published`, `deletedAt IS NULL`. CORS allows `http://localhost:5173`.

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
