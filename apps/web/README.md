# @kathapp/web

React + Vite + TypeScript shell for KathApp (GPL-3.0).

## Routes (Contract / Frontend Spec)

**Public** (`UI-Locale` in URL):

- `/:locale` — home
- `/:locale/search` — search stubs (`?q`, `?type`, `?contentLocale`)
- `/:locale/saints/:id`, `/miracles/:id`, `/sources/:id` — entity detail registry slots
- `/:locale/suggest`, `/:locale/suggestions/:id` — suggestion form + status

**Admin** (separate tree):

- `/admin` → `/admin/:locale`
- `/admin/:locale` — dashboard
- `/admin/:locale/review`
- `/admin/:locale/{saints|miracles|sources}` (+ `/:id/edit`)

## i18n

Namespaces: `common` | `entity` | `admin` | `suggest` (`react-i18next`).
URL locale = UI locale; content locale via `?contentLocale=` (fallback chain in `src/lib/contentLocale.ts`).

## Tokens

CSS variables in `src/styles/tokens.css` (Light `:root`, `.dark` / `[data-theme=dark]`), wired through Tailwind.

No invented domain content — stubs only until API wiring.
