# ADR 0003 — Dev JWT Login

- **Status:** Accepted
- **Date:** 2026-09-06

## Context

KathApp needs authenticated suggestion submit/review before production OAuth/OIDC is ready. Local and CI agents must exercise Bearer JWT + roles without inventing a permanent identity provider.

## Decision

- **Production-shaped JWT:** Bearer access tokens with claims `sub` (userId), `email`, `role`. Strategy loads `User` by `sub` and rejects soft-deleted users (`deletedAt` set).
- **Dev login:** `POST /v1/auth/dev-login` upserts `User` by email and returns `{ accessToken, user }`. Optional body `role` among `viewer` | `contributor` | `reviewer` | `admin` (ADR 0001).
- **Enablement:** Available only when `AUTH_DEV_LOGIN=true`, **or** when `NODE_ENV !== 'production'` **and** `AUTH_DEV_LOGIN` is not explicitly `false`. Disabled in production by default; when disabled the endpoint responds with **404** (or **403**).
- **Role hierarchy for guards:** `admin` ≥ `reviewer` ≥ `contributor` (≥ `viewer` for public reads).
- **OAuth/OIDC** for production identity is deferred to a future ADR.

## Consequences

- Auth and Suggestions vertical slice can ship against Contract-v1 without a real IdP.
- Production must keep `AUTH_DEV_LOGIN` unset/false and `NODE_ENV=production`.
- Shared DTOs (`AuthUser`, `DevLoginRequest`, `AuthSession`) live in `packages/shared`.
