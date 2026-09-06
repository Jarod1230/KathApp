# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Root `package-lock.json` so CI `actions/setup-node` `cache: npm` and reproducible installs work
- Initial monorepo scaffold: `apps/api`, `apps/web`, `packages/shared`
- Project docs (`docs/`), CLAUDE.md hard rules, ADRs 0001–0002 (tech stack + Contract-v1)
- Docker Compose (Postgres 16, optional Redis), root workspaces, `.env.example`
- NestJS-style API stub with Prisma schema v1, health endpoint, OpenAPI stub
- Vite React TS web stub with locale routes (`/de`, `/en`), i18n stub, design tokens
- Shared Contract-v1 TypeScript types (entities, roles, edge types, suggestion states)
- Frontend Priority-3 route stubs (public search/detail/suggest; separate `/admin/:locale` tree; i18n namespaces `common`|`entity`|`admin`|`suggest`) — merged from PR #1.
- **Slice A+B (local run + vertical read):** committed Prisma init migration under `apps/api/prisma/migrations/`; `PrismaModule`; public `GET /v1/search` and `GET /v1/{saints\|miracles\|sources}/:id` (locale, translations, citations, edge chips; published-only; soft-delete excluded; empty DB → empty list / 404; no domain seed)
- Web: TanStack Query client (`VITE_API_URL`), SearchPage + EntityDetailPage wired with empty/404 states; suggest/admin remain stubs
- Minimal GitHub Actions CI (install, shared build, prisma generate, typecheck best-effort, build api+web)
- Shared DTOs: `SearchResponse`, `EntityDetailResponse`, `EdgeChip`, `CitationView`

### Changed

- README updated with structure tree and run instructions
- AGENTS.md updated to point at CLAUDE.md and bot role notes
- **Contract-v1 align:** `packages/shared` + Prisma schema — EdgeType `saint_miracle`|`miracle_source`|`saint_source`; PublishStatus `draft`|`published` on Saint/Miracle/Source; Translation-backed names/titles; Citation `locus`/`excerpt`/`excerptLatin`; Edge `fromId`/`toId` + optional `citationId`/`note`; glossary Publish-Gates
- `.env.example`: `VITE_API_URL` (replaces `VITE_API_BASE_URL`); API CORS for Vite origin
- `docs/development.md` + README run section: copy-paste migrate/deploy + search/detail steps
- CI watch hardened: lockfile + npm cache; Actions notify on new green/red run ids
