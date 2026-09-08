# CLAUDE.md — Hard Rules for KathApp Agents

These rules are binding for every agent and contributor working in this repository.

## Before You Start

- Read `docs/lessons-learned.md`. It is short, specific to this repository, and
  it exists because an agent starts without memory.
- When something costs you an hour that a note would have prevented, add an
  entry. Also when it feels too small to be worth writing down — those are the
  entries that save the most.

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
- **The publish gate follows every hop.** A public read filters `status = published` not only on the requested entity but on everything it reaches through: citation sources, edge targets, and whatever is added later. A missed filter here raises no error — it serves unpublished data, or quietly drops a row from a page. **What the read path skips silently, the write path must reject.**

## CI Before Merge

- Every PR must pass all five gates before merge: `npm run lint && npm run check:docs && npm run typecheck && npm test && npm run build`.
- **Read the exit code, not the output.** A test run can print `24 passed` and still exit 1. Use `npm test >/dev/null 2>&1; echo $?`. Filtering output with `grep` can hide a failure entirely.
- **A new assertion is not trusted until it has failed.** Once it passes, break the implementation and confirm the test goes red. A test that stays green against a broken implementation is not a test.
- A placeholder script that exits 0 is worse than a missing one: it produces a signal people believe. If a step does not exist yet, it must not pretend to run.
- Do not merge with failing checks, skipped required jobs, or “fix later” TODOs that break the pipeline.
- Prefer small, reviewable PRs; keep API and shared DTO changes coordinated across `packages/shared`, `apps/api`, and `apps/web`.

## Language

- **German documentation is OK** (vision, ADRs, agent notes, user-facing copy planning).
- **Code identifiers are English** (file names, types, functions, Prisma models, routes, CSS tokens where applicable).
- UI locale (`/de`, `/en`) is independent of content locale (entity translations).

## Roles & Security Baseline

- Roles: `viewer` (public), `contributor`, `reviewer`, `admin`.
- Do not weaken authz for convenience. Public surfaces stay read-only for curated published data.
- **`NODE_ENV` never enables anything.** It may only relax a check. A missing value must fall to the safe side: nothing in this repository sets it, and `start:prod` is plain `node dist/main.js`.
- **No secret has a built-in fallback.** Without `JWT_SECRET` the API refuses to start rather than signing with a value anyone can read in the repository.

## Extensibility Discipline

- Keep versioned API under `/v1/`.
- Prefer extensible enums (`entityType`, `Edge.type`) and `Suggestion.schemaVersion` over ad-hoc one-off fields.
- Soft-delete + `updatedAt` are required on persisted domain entities.

## When Unsure

- Stop. Open/consult an ADR. Ask Stabschef / maintainer. Do not invent domain content or break Contract-v1.
- Say what you could not verify. An unverified claim reported as done costs more than an open question.
