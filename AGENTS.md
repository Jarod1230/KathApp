# KathApp — Agentenhinweise

## Verbindliche Regeln

**Lies zuerst `CLAUDE.md`.** Dort stehen die Hard Rules (GPL-3.0, Contract-v1 + ADR-Gate, keine erfundenen Domänenfakten, CI vor Merge, Sprache).

Weitere Orientierung:

- Vision & Nicht-Ziele: `docs/vision.md`
- Architektur: `docs/architecture.md`
- Konventionen: `docs/conventions.md`
- Entwicklung: `docs/development.md`
- Roadmap: `docs/roadmap.md`
- Glossar: `docs/glossary.md`
- ADRs: `docs/decisions/`

## Rolle dieses Repos

Dieses Repo gehört zum Projekt **KathApp**. Facharbeit läuft über die KathApp-Bots; Architektur- und Prioritätsentscheidungen über den **Stabschef** / Jarod.

## Stack (accepted — ADR 0001)

- **API:** NestJS + Prisma + PostgreSQL, JWT roles, OpenAPI
- **Web:** React + TypeScript + Vite + TanStack Router/Query + Tailwind + Radix + react-i18next
- **Shared:** `packages/shared` Contract DTOs / types
- **Lizenz:** GPL-3.0

## Domäne (Contract-v1)

Entitäten: **Saint**, **Miracle**, **Source**, **Citation**, **Edge**, **Translation**, **Suggestion**.

Suggestion-Status: `submitted` → `in_review` → `accepted` | `rejected`.

Rollen: `viewer` (public), `contributor`, `reviewer`, `admin`.

## Rollen der Fachbots

| Rolle | Fokus |
| --- | --- |
| **Frontend** | `apps/web` — UI, i18n (UI-Locale in URL ≠ Content-Locale), TanStack Router/Query, Design Tokens, öffentliche vs. Admin-Routen |
| **Backend** | `apps/api` — NestJS Module, Prisma, AuthZ nach Rollen, `/v1/` APIs, Soft-Delete, OpenAPI |
| **Knowledge** | Domänenmodell, Quellen/Zitationen, Suggestions-Workflow, **keine erfundenen Heiligen/Wunder**; Glossar & Contract-Treue |
| **Design** | Tokens, Komponenten-Guidelines, Barrierefreiheit (Focus), konsistente Surfaces — Tokens in CSS-Variablen im Web-Stub |
| **Stabschef** | Priorisierung, ADR-Gate, Cross-Bot-Koordination, Merge-Politik, Scope gegen Vision/Nicht-Ziele |

## Beiträge

- Keine stillen Breaking Changes am Datenmodell ohne ADR + Absprache Backend + Knowledge.
- CI muss grün sein vor Merge.
- Identifiers im Code Englisch; Doku darf Deutsch sein.
