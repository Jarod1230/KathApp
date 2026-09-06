# CLAUDE.md — Hard Rules for KathApp Agents

These rules are binding for every agent and contributor working in this repository.

## License

- KathApp is licensed under **GPL-3.0**. See `LICENSE`.
- Do not add dependencies or assets incompatible with GPL-3.0 without an explicit ADR and maintainer approval.
- Preserve license headers and attribution where required.

## Contract-v1 + ADR Gate

- **Contract-v1 is accepted and frozen** (see `docs/decisions/0002-contract-v1.md`).
- Do not invent, rename, or silently reshape domain entities, enums, suggestion states, or API shapes outside Contract-v1.
- Any change that affects the public contract, persistence model, auth roles, or extension points **requires a new ADR** under `docs/decisions/` and explicit acceptance before implementation.
- Tech stack decisions follow `docs/decisions/0001-tech-stack.md` unless superseded by a later accepted ADR.

## Domain Integrity

- **No invented domain facts.** Do not fabricate saints, miracles, sources, citations, feast dates, Latin texts, or historical claims.
- Placeholders in code/docs must be clearly marked as stubs/examples and must not look like curated knowledge.
- Knowledge content enters the system only through the Suggestion workflow or authorized curated imports — never via speculative seed data in PRs.

## CI Before Merge

- Every PR must pass CI (lint, typecheck, tests, build) before merge.
- Do not merge with failing checks, skipped required jobs, or “fix later” TODOs that break the pipeline.
- Prefer small, reviewable PRs; keep API and shared DTO changes coordinated across `packages/shared`, `apps/api`, and `apps/web`.

## Language

- **German documentation is OK** (vision, ADRs, agent notes, user-facing copy planning).
- **Code identifiers are English** (file names, types, functions, Prisma models, routes, CSS tokens where applicable).
- UI locale (`/de`, `/en`) is independent of content locale (entity translations).

## Roles & Security Baseline

- Roles: `viewer` (public), `contributor`, `reviewer`, `admin`.
- Do not weaken authz for convenience. Public surfaces stay read-only for curated published data.

## Extensibility Discipline

- Keep versioned API under `/v1/`.
- Prefer extensible enums (`entityType`, `Edge.type`) and `Suggestion.schemaVersion` over ad-hoc one-off fields.
- Soft-delete + `updatedAt` are required on persisted domain entities.

## When Unsure

- Stop. Open/consult an ADR. Ask Stabschef / maintainer. Do not invent domain content or break Contract-v1.
