# KathApp — Agentenhinweise

## Verbindliche Regeln

**Lies zuerst `CLAUDE.md`.** Dort stehen die Hard Rules (GPL-3.0, Contract-v1 + ADR-Gate, keine erfundenen Domänenfakten, Publish-Gate über jeden Sprung, CI vor Merge, Sprache).

**Dann `docs/lessons-learned.md`.** Kurz, konkret, und der Grund steht in der
Datei: ein Agent startet ohne Gedächtnis.

Weitere Orientierung — Einstieg über [`docs/README.md`](docs/README.md), dort
steht auch, wohin man was schreibt:

- Vision & Nicht-Ziele: `docs/vision.md`
- Architektur: `docs/architecture.md`
- Konventionen: `docs/conventions.md`
- Entwicklung: `docs/development.md`
- Gestaltung: `docs/design/`
- Roadmap: `docs/roadmap.md`
- Glossar: `docs/glossary.md`
- ADRs: `docs/decisions/`
- Mitarbeit: `CONTRIBUTING.md`

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
| **Frontend** | `apps/web` — UI, i18n (UI-Locale in URL ≠ Content-Locale), TanStack Router/Query, Komponentenschicht unter `src/components/`, öffentliche vs. Admin-Routen |
| **Backend** | `apps/api` — NestJS Module, Prisma, AuthZ nach Rollen, `/v1/` APIs, Soft-Delete, OpenAPI |
| **Knowledge** | Domänenmodell, Quellen/Zitationen, Suggestions-Workflow, **keine erfundenen Heiligen/Wunder**; Glossar & Contract-Treue |
| **Design** | Tokens in `styles/tokens.css`, Komponentenschicht, Barrierefreiheit und Kontrast (zwei Tests erzwingen WCAG AA), Entwürfe unter `docs/design/` |
| **Stabschef** | Priorisierung, ADR-Gate, Cross-Bot-Koordination, Merge-Politik, Scope gegen Vision/Nicht-Ziele |

## Beiträge

- Keine stillen Breaking Changes am Datenmodell ohne ADR + Absprache Backend + Knowledge.
- CI muss grün sein vor Merge — **Rückgabewert prüfen, nicht die Textausgabe.**
- Jede neue Zusicherung einmal durch Rücknahme der Implementierung prüfen.
- Identifiers im Code Englisch; Doku darf Deutsch sein; Nutzertexte in **beiden**
  Sprachen, sonst schlagen die Tests fehl.
- Was zwei Apps brauchen, gehört nach `packages/shared`. Dieselbe Regel an zwei
  Stellen driftet auseinander; das ist hier bereits zweimal passiert.
