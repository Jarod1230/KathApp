# KathApp API (`apps/api`)

NestJS + Prisma + PostgreSQL service implementing **Contract-v1**.

## Status

Minimal runnable stub:

- `GET /health` — liveness
- `GET /v1` — contract root stub
- OpenAPI/Swagger at `/docs`
- Prisma schema v1 for Saint, Miracle, Source, Citation, Edge, Translation, Suggestion (+ User/roles)
- Soft delete (`deletedAt`) + `updatedAt` on domain models

## Setup

From repo root (after `docker compose up -d` and install):

```bash
pnpm --filter @kathapp/api prisma:generate
pnpm --filter @kathapp/api prisma:migrate
pnpm --filter @kathapp/api dev
```

Env: see root `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `PORT`).

## Rules

- No invented saints/miracles content.
- DTO shapes live in `@kathapp/shared`.
- Breaking contract changes need an ADR.

License: GPL-3.0.
