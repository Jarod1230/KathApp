# Roadmap — KathApp

Priorities are set by Stabschef / maintainer. This list is directional, not a commitment calendar.

## MVP Queue (now)

1. Monorepo scaffold + CI baseline
2. Contract-v1 persistence (Prisma) + `/v1/` CRUD read paths for core entities
3. Auth: JWT + roles (`viewer` / `contributor` / `reviewer` / `admin`)
4. Suggestions workflow (submit → review → accept/reject)
5. Web: locale routes, public browse stubs, admin route tree stubs
6. i18n plumbing (UI DE/EN) with content-locale separation
7. OpenAPI published and kept in sync
8. Minimal curation UI for reviewers/admins

## Later

- **Graph canvas** — interactive exploration / editing of Edges
- **Bulk import** — controlled ingest from archival datasets (with provenance)
- **Search cluster** — dedicated full-text / faceted search infra
- **Feasts** — liturgical calendar integration as a product slice
- Redis-backed jobs/cache if load requires it
- Richer Translation workflows and Latin source helpers

## Explicitly deferred

See Nicht-Ziele in `docs/vision.md`. Do not pull deferred items into MVP without ADR + priority call.
