# Development — KathApp

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm or npm (workspaces configured in root `package.json`)
- Docker + Docker Compose

## Environment

Copy `.env.example` to `.env` and adjust as needed.

## Infrastructure

```bash
docker compose up -d
```

Starts:

- **Postgres 16** on `localhost:5432` (default db/user/pass from `.env.example`)
- **Redis** (optional profile / service) — safe to leave unused in early MVP

## Install

```bash
# from repo root
pnpm install
# or: npm install
```

## Scripts (placeholders)

Root `package.json` workspaces expose convenience scripts (implement/adjust as packages mature):

| Script | Intent |
| --- | --- |
| `pnpm dev:api` | Start API in watch mode |
| `pnpm dev:web` | Start Vite web app |
| `pnpm build` | Build all workspaces |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | TypeScript project references / per-package check |
| `pnpm test` | Run tests |

Per-app:

```bash
pnpm --filter @kathapp/api dev
pnpm --filter @kathapp/web dev
pnpm --filter @kathapp/api prisma:generate
pnpm --filter @kathapp/api prisma:migrate
```

## API

- Health: `GET /health`
- Versioned API: `/v1/...`
- OpenAPI/Swagger stub: `/docs` (when Nest swagger module is wired)

See `apps/api/README.md`.

## Web

- Dev server: Vite default (often `http://localhost:5173`)
- Locale entry: `/de`, `/en`

See `apps/web/README.md`.

## Database

Prisma schema lives at `apps/api/prisma/schema.prisma` (Contract-v1 entities + soft delete + `updatedAt`).

```bash
pnpm --filter @kathapp/api prisma:migrate
pnpm --filter @kathapp/api prisma:studio
```

## Notes

- Do not commit secrets; keep `.env` local.
- Scaffold packages may be stubs — prefer filling Nest/Vite structure over inventing domain seed data.
