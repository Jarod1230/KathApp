# ADR 0003 — Dev JWT Login

- **Status:** Accepted
- **Date:** 2026-09-06

## Context

KathApp needs authenticated suggestion submit/review before production OAuth/OIDC is ready. Local and CI agents must exercise Bearer JWT + roles without inventing a permanent identity provider.

## Decision

- **Production-shaped JWT:** Bearer access tokens with claims `sub` (userId), `email`, `role`. Strategy loads `User` by `sub` and rejects soft-deleted users (`deletedAt` set).
- **Dev login:** `POST /v1/auth/dev-login` upserts `User` by email and returns `{ accessToken, user }`. Optional body `role` among `viewer` | `contributor` | `reviewer` | `admin` (ADR 0001).
- **Enablement:** Available **only** when `AUTH_DEV_LOGIN` is exactly `true`. Nothing else switches it on, and `NODE_ENV` is not consulted. When disabled the endpoint responds with **404**, so a deployment does not advertise it.
- **Signing key:** `JWT_SECRET` must be set. There is no built-in fallback; the API refuses to start without one. The placeholder shipped in `.env.example` is rejected unless `NODE_ENV=development`.
- **Role hierarchy for guards:** `admin` ≥ `reviewer` ≥ `contributor` (≥ `viewer` for public reads).
- **OAuth/OIDC** for production identity is deferred to a future ADR.

## Amendment (2026-09-06, before this ADR reached `main`)

The enablement rule originally read "available when `AUTH_DEV_LOGIN=true`, **or**
when `NODE_ENV !== 'production'`". That default is open, not closed: `NODE_ENV`
is unset under this repository's own production start script
(`start:prod` is plain `node dist/main.js`, and nothing in the repository sets
the variable), so the endpoint would have been live in a normal deployment,
handing out admin tokens for any email address.

The signing key had the same shape of defect: it fell back to the literal
`dev-change-me`, a value committed to `.env.example`, so a deployment that
forgot `JWT_SECRET` would sign tokens with a publicly readable key.

Both switches now fail closed. Neither consults `NODE_ENV` to turn something
**on**; `NODE_ENV=development` only ever relaxes a check, never enables one.

## Consequences

- Auth and Suggestions vertical slice can ship against Contract-v1 without a real IdP.
- Production needs no special setting to be safe: both switches are off unless turned on deliberately.
- Local development sets `NODE_ENV=development` and `AUTH_DEV_LOGIN=true` in `.env` (see `.env.example`).
- Shared DTOs (`AuthUser`, `DevLoginRequest`, `AuthSession`) live in `packages/shared`.
