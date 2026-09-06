# ADR 0004 — Search Result Semantics and Pagination

- **Status:** Proposed
- **Date:** 2026-09-06
- **Supersedes:** nothing. Extends Contract-v1 (`docs/decisions/0002-contract-v1.md`) additively.

## Context

`GET /v1/search` shipped in Slice A+B with three defects that are visible through the public contract:

1. **`total` is not a total.** It is assigned `items.length`, i.e. the size of the returned page after an internal cap. A client cannot tell "3 results exist" from "3 results were returned out of many".
2. **There is no way to reach result 51.** The service caps the response at 50 items with no parameter to move past them. For a knowledge hub whose stated goal is discovery, results beyond the cap are unreachable.
3. **The cap is applied in the wrong order.** Translation rows are fetched with `take: 200`, and only afterwards is each candidate checked for `status = published`. A corpus with many drafts silently pushes published entities out of the result set. The bug grows with the size of the curation backlog.

Defects 1 and 3 are bugs against the existing contract and need no decision. Defect 2 cannot be fixed without adding fields to `SearchResponse`, which `CLAUDE.md` gates behind an ADR.

## Decision

### Request

`GET /v1/search` accepts two additional optional query parameters:

| Parameter | Type | Default | Bounds |
| --- | --- | --- | --- |
| `limit` | integer | 20 | 1 to 100, clamped |
| `offset` | integer | 0 | >= 0, clamped |

Out-of-range and non-numeric values are clamped to the nearest valid value rather than rejected. A public read surface should not return 400 for a malformed page cursor.

### Response

`SearchResponse` gains two required fields:

```ts
export interface SearchResponse {
  q: string;
  locale: ContentLocale;
  type?: PublicEntityKind | null;
  items: SearchHit[];
  total: number;   // redefined: all matching published entities, not the page size
  limit: number;   // new: the effective limit after clamping
  offset: number;  // new: the effective offset after clamping
}
```

`total` is redefined to mean the number of published, non-deleted entities matching the query, independent of `limit` and `offset`. This is a behaviour correction, not a shape change.

Both new fields are echoed back after clamping, so a client can always tell what the server actually applied.

### Ordering

Results are ordered by `(entityType, id)`. This is **stable and deterministic**, which is what pagination requires, and it is explicitly **not** relevance ranking. Ranking needs a scoring model and belongs with the "search cluster" item already deferred in `docs/roadmap.md`.

### Content locale

Matching runs against translations in **every** locale, not a hardcoded German and English pair. A user searching for a Latin term must be able to find the entity that carries it. The requested `locale` continues to govern only which translation is *displayed*, via the existing fallback chain.

This aligns the implementation with `ContentLocale`, which Contract-v1 already defines as an open string precisely so that Latin and other source languages fit.

## Consequences

- Additive for clients. Existing callers that ignore `limit` and `offset` receive the first 20 results instead of the first 50. Nothing in the repository depends on the old cap.
- `total` becomes trustworthy, so the web client can render a result count and a pager.
- The published filter moves into the database query, so drafts can no longer displace published results.
- Ranking stays an open question. When it lands it will change ordering, and ordering is part of pagination behaviour, so it will need its own ADR.
- `packages/shared`, `apps/api` and `apps/web` are updated together, as required by `docs/conventions.md`.

## Alternatives considered

**Cursor-based pagination.** More robust against concurrent inserts, and the better long-term answer for a large corpus. Rejected for now: the corpus is empty, `limit`/`offset` is what a first curation UI needs, and a cursor scheme would be designed against zero real usage. Revisit with the search cluster.

**Rejecting out-of-range `limit` with 400.** Rejected as unfriendly for a public read surface and inconsistent with the existing tolerant handling of `locale` and `type`, both of which fall back rather than fail.
