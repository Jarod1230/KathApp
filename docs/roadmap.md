# Roadmap — KathApp

Priorities are set by Stabschef / maintainer. This list is directional, not a commitment calendar.

## MVP Queue (now)

1. ~~Monorepo scaffold + CI baseline~~ **done** (npm workspaces, package-lock, Actions green)
2. ~~Contract-v1 persistence (Prisma) + `/v1/` read paths for core entities~~ **done** (Slice A+B: search + saint/miracle/source detail)
3. ~~Auth: JWT + roles~~ **done** (Dev-JWT nach ADR 0003; produktiver Identitätsanbieter offen)
4. ~~Suggestions workflow (submit → review → accept/reject)~~ **done** (inklusive Publish-Gates und Endpunktprüfung für Kanten)
5. ~~Web: locale routes, public browse stubs, admin route tree stubs~~ **done** (Priority-3 + Slice A+B wiring)
6. ~~i18n plumbing (UI DE/EN) with content-locale separation~~ **done** (namespaces + URL locale)
7. OpenAPI published and kept in sync — keep current with Auth/Suggestions PRs
8. Minimal curation UI for reviewers/admins — **teilweise**: Review-Queue mit Annehmen/Ablehnen steht; Listen- und Bearbeitungsseiten sind bewusst Platzhalter, solange nicht entschieden ist, was sie tun sollen
9. ~~Gestaltungsschicht für `apps/web`~~ **done** (Typografie, Dunkelschema, Komponentenschicht, Leseflächen — siehe `docs/design/`)

## Later

- **Graph canvas** — interactive exploration / editing of Edges
- **Bulk import** — controlled ingest from archival datasets (with provenance)
- **Search cluster** — dedicated full-text / faceted search infra
- **Feasts** — liturgical calendar integration as a product slice
- Redis-backed jobs/cache if load requires it
- Richer Translation workflows and Latin source helpers
- **Produktiver Identitätsanbieter** (OAuth/OIDC) — ersetzt den Dev-Login aus ADR 0003
- **Referenzielle Integrität im Graphen auf Datenbankebene** — Entscheidung offen, siehe ADR 0005
- **Lizenzierte Textschrift** — Lizenzfragen bei GPL-3.0 nicht trivial

## Explicitly deferred

See Nicht-Ziele in `docs/vision.md`. Do not pull deferred items into MVP without ADR + priority call.
