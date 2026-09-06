# Conventions — KathApp

## Naming

- **Code identifiers:** English (`Saint`, `suggestionStatus`, `getMiracles`).
- **Docs:** German or English OK; prefer German for vision/product notes if the audience is the core team.
- **Files:** kebab-case for docs (`vision.md`); Nest/React follow framework norms (`*.module.ts`, `PascalCase` components).
- **DB (Prisma):** `PascalCase` models, `camelCase` fields, matching Contract names where practical.

## i18n Split

- **UI locale** lives in the URL (`/de/...`, `/en/...`) via TanStack Router.
- **Content locale** is a property of Translations / request params — **not** the same as UI locale.
- A user can browse the German UI while inspecting English (or Latin-source) content fields.
- Never conflate `i18n.language` with entity `locale` without an explicit mapping layer.

## API

- All public HTTP under `/v1/`.
- Soft-delete: filter `deletedAt IS NULL` by default on reads.
- **The publish gate follows every hop.** A public read must filter
  `status = published` not only on the requested entity but on everything it
  reaches through: citation sources, edge targets, and any entity added later.
  Filtering the root entity alone leaks unpublished metadata through the
  attached chips.
- Always maintain `updatedAt` (and `createdAt` where applicable).
- OpenAPI stays in sync with controllers.

## Suggestions

Allowed statuses only: `submitted` | `in_review` | `accepted` | `rejected`.

Payload changes require `schemaVersion` bump + ADR if Contract-facing.

## PR Rules

1. CI green (lint, typecheck, test, build) before merge.
2. Contract or persistence changes → ADR + `packages/shared` update in the same PR series.
3. No invented saints/miracles/sources in fixtures that look like production knowledge.
4. Keep LICENSE (GPL-3.0); do not relicense casually.
5. Prefer focused commits; update `CHANGELOG.md` `[Unreleased]` for user-visible work.
6. Cross-app DTO drift is a bug — import from `@kathapp/shared`.

## Roles in Code

Use the shared `Role` union/enum; do not introduce parallel role strings (`guest`, `curator`, …) without ADR.
