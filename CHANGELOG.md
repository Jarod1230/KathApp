# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **The dev login was reachable in a normal deployment.** It was enabled whenever `NODE_ENV !== 'production'`, and nothing in the repository sets `NODE_ENV` — including `start:prod`, which is plain `node dist/main.js`. `POST /v1/auth/dev-login` mints a token for any email address at any role, so a deployment that simply never set the variable handed out admin access. It is now off unless `AUTH_DEV_LOGIN` is exactly `true`, and `NODE_ENV` no longer enables anything.
- **The JWT signing key had a built-in fallback.** `JWT_SECRET` fell back to the literal `dev-change-me`, the value committed to `.env.example`, so a deployment that forgot the variable signed tokens with a key anyone could read in the repository. The API now refuses to start without a real secret, and rejects the placeholder unless `NODE_ENV=development`.
- Added `helmet`, a global `ValidationPipe`, and per-IP rate limiting (120/min by default, 5/min on `dev-login`)

### Added

- **Auth + Suggestions vertical slice (ADR 0003):** Dev JWT login (`POST /v1/auth/dev-login`, `GET /v1/auth/me`); Nest `AuthModule` (JwtModule, Passport JWT strategy, guards, roles hierarchy admin≥reviewer≥contributor); `SuggestionsModule` + `PublishGateService` gates (`translation_required`, `citation_required`, `saint_miracle_edge_required`); shared DTOs (`AuthUser`, `AuthSession`, `SuggestionPayloadV1`, …); OpenAPI Bearer + `/v1` endpoint map; `.env.example` `AUTH_DEV_LOGIN`
- ESLint 9 flat config (`eslint.config.mjs`) covering all workspaces, plus root `lint` / `lint:fix` scripts
- Vitest in `apps/api` and `apps/web` with unit tests for the content-locale fallback chain (API `pickLocaleValue`, `normalizeContentLocale`; web `resolveContentLocale`, `contentLocaleFromSearch`)
- `apps/api/tsconfig.build.json` so `nest build` keeps tests out of `dist/`
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

### Added

- ADR 0004 — search result semantics and pagination (`limit` / `offset`, redefined `total`, any-locale matching)
- `GET /v1/search` accepts `limit` (default 20, max 100) and `offset`; both are clamped and echoed back in the response
- `SearchResponse` gains `limit` and `offset`; `SEARCH_DEFAULT_LIMIT` / `SEARCH_MAX_LIMIT` exported from `packages/shared`
- Web search page shows a result range and a previous/next pager
- Integration tests for `SearchService` against a real Postgres in a dedicated schema, plus a Postgres service container in CI
- Regression guard asserting the search issues a constant number of statements regardless of result count

### Fixed

- **Draft sources leaked onto public detail pages.** `GET /v1/{saints|miracles|sources}/:id` filtered a citation's source by `deletedAt` but never by `status`, so the author, year, shelfmark and URL of an unpublished source were served publicly through the citation chip. Citations whose source is not published are now hidden entirely: a citation is provenance, and without a published source it has no verifiable backing.
- **The entity detail path issued three queries per relation.** Source titles, publish checks for edge targets and related labels were fetched one at a time. A detail response now costs seven statements regardless of how many citations and edges the entity carries, guarded by a regression test.
- **Integration test files shared one schema while running in parallel** and truncated each other's fixtures. `fileParallelism` is disabled for the API suite.

- **Search `total` was the page size, not the number of matches.** It was assigned `items.length`, so a client could not distinguish "3 results exist" from "3 of many were returned".
- **Drafts could push published entities out of search results.** Translation rows were fetched with `take: 200` and only filtered by `status = published` afterwards, so a curation backlog silently hid published entities. The publish filter now lives inside the query.
- **Search only matched German and English translations.** The locale list was hardcoded to `['de','en']` although `ContentLocale` is an open string, making Latin source terms unfindable. Matching now covers every locale; the requested locale still governs only what is displayed.
- **Search issued two queries per candidate.** A search now costs three statements in total, whatever the result count.
- **The documented local setup could not work.** Nothing in the repo ever loaded a `.env`: `apps/api` scripts run with `cwd=apps/api`, while the README creates the file at the repository root, so `prisma migrate deploy`, `prisma generate` and `npm run dev:api` all failed with `Environment variable not found: DATABASE_URL`. The `dev` and `prisma:*` scripts now load the root `.env` through `dotenv-cli`.

### Changed

- **CI is now enforcing.** Typecheck no longer runs with `continue-on-error`; lint and test are real blocking steps; install uses `npm ci`. Each gate was verified to fail on broken input.
- `lint` / `test` echo stubs removed from all three workspaces — they reported success without running anything
- `typecheck` now covers `test/` in `apps/api` and `apps/web`
- README updated with structure tree and run instructions
- AGENTS.md updated to point at CLAUDE.md and bot role notes
- **Contract-v1 align:** `packages/shared` + Prisma schema — EdgeType `saint_miracle`|`miracle_source`|`saint_source`; PublishStatus `draft`|`published` on Saint/Miracle/Source; Translation-backed names/titles; Citation `locus`/`excerpt`/`excerptLatin`; Edge `fromId`/`toId` + optional `citationId`/`note`; glossary Publish-Gates
- `.env.example`: `VITE_API_URL` (replaces `VITE_API_BASE_URL`); API CORS for Vite origin
- `docs/development.md` + README run section: copy-paste migrate/deploy + search/detail steps
- CI watch hardened: lockfile + npm cache; Actions notify on new green/red run ids
