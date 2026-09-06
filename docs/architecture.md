# Architecture — KathApp

## Monorepo Layout

```
KathApp/
├── apps/
│   ├── api/          # NestJS + Prisma + Postgres
│   └── web/          # React + Vite + TanStack + Tailwind + Radix + i18n
├── packages/
│   └── shared/       # Contract-v1 DTOs / shared types
├── docs/             # Vision, architecture, conventions, ADRs
├── docker-compose.yml
└── package.json      # workspaces
```

## Graph-First Domain

Domain entities are first-class nodes and typed links:

| Entity | Role |
| --- | --- |
| Saint | Person / saint node |
| Miracle | Event / miracle node |
| Source | Bibliographic or archival source |
| Citation | Concrete reference into a Source |
| Edge | Typed relationship between entities |
| Translation | Localized fields for a target entity |
| Suggestion | Proposed create/update/delete awaiting review |

Edges carry an extensible `type` enum. Suggestions carry `entityType`, payload, and `schemaVersion`.

## Runtime Topology (MVP)

- **Postgres 16** — system of record (Prisma)
- **API (`apps/api`)** — NestJS, JWT role claims, `/v1/*`, OpenAPI
- **Web (`apps/web`)** — SPA; UI locale in path (`/de`, `/en`); talks to API
- **Redis (optional)** — reserved for sessions/cache/queues later; not required for MVP stubs

## AuthZ Snapshot

| Role | Access |
| --- | --- |
| `viewer` | Public read of published curated data |
| `contributor` | Submit suggestions |
| `reviewer` | Review suggestions (accept/reject) |
| `admin` | Full curation + admin routes |

## Extension Points (Contract-v1)

- API version prefix: `/v1/`
- `entityType` on Suggestions (and related polymorphic refs)
- `Edge.type` as extensible enum
- `Suggestion.schemaVersion` for payload evolution
- Soft delete (`deletedAt`) + `updatedAt` on persisted entities

## Packages Boundary

- `packages/shared` is the **source of truth for TS DTO shapes** shared by api and web.
- API owns persistence (Prisma) and maps to shared DTOs.
- Web never invents parallel domain types for Contract entities.

See ADR `docs/decisions/0001-tech-stack.md` and `docs/decisions/0002-contract-v1.md`.
