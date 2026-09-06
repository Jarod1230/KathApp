# ADR 0001 — Tech Stack

- **Status:** Accepted
- **Date:** 2026-09-06

## Context

KathApp needs a maintainable monorepo for a graph-oriented Catholic knowledge hub with multilingual UI, suggestion review, and a versioned API — under GPL-3.0.

## Decision

- **License:** GPL-3.0
- **API:** NestJS + Prisma + PostgreSQL
- **Web:** React + TypeScript + Vite + TanStack Router + TanStack Query + Tailwind CSS + Radix UI + react-i18next
- **Auth:** JWT with roles `viewer` | `contributor` | `reviewer` | `admin`
- **Shared types:** `packages/shared` for Contract DTOs
- **API versioning:** `/v1/`

## Consequences

- Team standardizes on one TypeScript graph across api/web/shared.
- Prisma schema is the persistence source of truth; DTO shapes stay aligned with Contract-v1.
- Alternative stacks require a superseding ADR.
