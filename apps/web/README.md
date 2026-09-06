# KathApp Web (`apps/web`)

React + TypeScript + Vite stub with:

- TanStack Router locale routes: `/de`, `/en` (UI locale in URL)
- Public vs admin route-tree stubs
- react-i18next stub (DE/EN)
- TanStack Query provider
- Tailwind + design token CSS variables (`bg`, `surface`, `text`, `accent`, `focus`, …)
- Radix slot dependency reserved for primitives

## Run

```bash
pnpm --filter @kathapp/web dev
```

UI locale ≠ content locale — see `docs/conventions.md`.

No invented domain content in the UI stubs.

License: GPL-3.0.
