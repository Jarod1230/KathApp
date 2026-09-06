# KathApp API (`apps/api`)

NestJS + Prisma + PostgreSQL service implementing **Contract-v1**.

## Status (Slice A+B)

- `GET /health` — liveness
- `GET /v1` — contract root
- `GET /v1/search?q=&locale=&type=` — published search via Translation contains (DE/EN)
- `GET /v1/saints/:id?locale=` — detail + translations, citations, edge chips
- `GET /v1/miracles/:id?locale=`
- `GET /v1/sources/:id?locale=`
- OpenAPI/Swagger at `/docs`
- Prisma schema + **committed** init migration (`prisma/migrations/`)
- Soft delete (`deletedAt`) + `updatedAt`; public reads filter `status=published`

No invented saints/miracles content. Empty DB is valid.

## Setup

From repo root (after `docker compose up -d` and install):

```bash
npm run build -w @kathapp/shared
npm run prisma:generate -w @kathapp/api
npm run prisma:migrate:deploy -w @kathapp/api
npm run dev:api
```

Env: see root `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `PORT`).

## Rules

- No invented saints/miracles content.
- DTO shapes live in `@kathapp/shared`.
- Breaking contract changes need an ADR.

License: GPL-3.0.
