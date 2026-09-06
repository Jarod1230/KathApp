# ADR 0002 — Contract-v1 Freeze

- **Status:** Accepted
- **Date:** 2026-09-06

## Context

Agents and humans need a frozen product/domain contract before implementation drifts. Invented entities or silent renames break Frontend, Backend, and Knowledge coordination.

## Decision

**Contract-v1 is accepted and frozen** with:

### Entities

Saint, Miracle, Source, Citation, Edge, Translation, Suggestion

### Roles

`viewer` (public), `contributor`, `reviewer`, `admin`

### Suggestions

Statuses: `submitted` | `in_review` | `accepted` | `rejected`

### i18n

- UI locales: DE + EN, expressed in the URL
- UI locale ≠ content locale

### Extensibility

- Versioned HTTP API under `/v1/`
- `entityType` for polymorphic suggestion/entity targeting
- Extensible `Edge.type` enums
- `Suggestion.schemaVersion` for payload evolution
- Soft delete + `updatedAt` on persisted entities

### Integrity

- No invented domain facts (saints/miracles/sources) in code or docs presented as knowledge

## Consequences

- Breaking contract changes require a new ADR and coordinated shared/api/web updates.
- Scaffolding and CI must respect these names and states exactly.
- See `CLAUDE.md` for agent enforcement.
