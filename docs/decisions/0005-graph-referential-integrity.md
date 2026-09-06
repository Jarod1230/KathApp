# ADR 0005 — Referential Integrity for Graph Endpoints

- **Status:** Proposed
- **Date:** 2026-09-06
- **Relates to:** `docs/decisions/0002-contract-v1.md`

## Context

`Edge.fromId` / `Edge.toId` and `Citation.entityType` / `Citation.entityId` are
polymorphic: they address a Saint, a Miracle or a Source depending on a sibling
column. Prisma and Postgres cannot express a foreign key to "one of three
tables", so these columns are plain strings with no constraint behind them.

Nothing at the database level prevents:

- an edge whose endpoint id belongs to no row at all,
- a `saint_miracle` edge whose `toId` is a Source,
- an edge or citation pointing at a soft-deleted entity.

Until the Suggestions workflow landed this was theoretical, because nothing
wrote edges. The accept path now does, and it wrote `fromId` and `toId` straight
from the suggestion payload after only a presence check.

The read paths silently skip rows that violate the convention, which is the
worst property of the whole arrangement: bad data does not surface as an error,
it surfaces as content quietly missing from a page.

## Decision (this ADR proposes, it does not yet decide)

Two layers, of which **only the first is implemented**:

### Implemented: validate on write

`SuggestionsService` verifies, inside the accept transaction, that each endpoint
exists, is not soft-deleted, and is of the kind the edge type declares. The
kind mapping lives in `packages/shared` as `EDGE_ENDPOINT_KINDS`, so the write
path, the read path, and the contract itself share one definition.

This needs no schema change and is therefore not gated on this ADR.

### Proposed: enforce in the database

Options for making the invariant unbreakable, to be decided:

**A. Typed endpoint columns.** Replace `fromId`/`toId` with nullable
`saintId`, `miracleId`, `sourceId` plus real foreign keys, and a check
constraint tying the populated pair to `type`. Strongest guarantee. Costs a
migration, a Contract-v1 change, and makes adding an entity kind a schema
change rather than an enum addition — which works against the extensibility
Contract-v1 deliberately bought.

**B. Trigger-based checks.** Keep the shape; add Postgres triggers validating
endpoints on insert and update. No contract change, no loss of extensibility,
but the rule then lives in SQL that the ORM does not see, and it is invisible
to anyone reading the Prisma schema.

**C. Leave it at the application layer.** Accept that the database does not
enforce it, and rely on the write-path check plus tests. Cheapest, and honest
about the trade Contract-v1 already made when it chose polymorphic references.
The risk is any future write path that forgets the check.

## Consequences

- The immediate hole is closed either way; this ADR is about defence in depth.
- Option A is a Contract-v1 change and would need its own ADR to supersede parts
  of 0002.
- Whichever is chosen, `EDGE_ENDPOINT_KINDS` stays the single source for the
  convention, so a fourth entity kind is one edit rather than four.
- Deciding this is not urgent, but it should be settled before bulk import,
  which is where unvalidated ids would arrive in volume.

## Open question for the maintainer

Is the extensibility that polymorphic references buy still worth its cost, now
that there is exactly one writer and three edge types? If the answer is no,
option A is cleaner than it looks.
