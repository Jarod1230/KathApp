# KathApp

Mehrsprachiger, skalierbarer Wissenshub für katholisches Wissen weltweit.

## Vision

Katholiken weltweit sollen einfach an Wissen und Informationen gelangen, die sonst schwer erreichbar sind — z. B. lateinische Texte oder Quellen in Universitätsarchiven. Inhalte sind interaktiv und intelligent nutzbar (Heilige, Wunder, Quellen und ihre Verknüpfungen).

Siehe ausführlich: [`docs/vision.md`](docs/vision.md).

## Structure

```
KathApp/
├── apps/
│   ├── api/                 # NestJS + Prisma + Postgres (Contract-v1)
│   └── web/                 # React + Vite + TanStack + Tailwind + i18n
├── packages/
│   └── shared/              # Shared Contract-v1 TypeScript DTOs
├── docs/
│   ├── vision.md
│   ├── architecture.md
│   ├── conventions.md
│   ├── development.md
│   ├── roadmap.md
│   ├── glossary.md
│   └── decisions/           # ADRs (0001 tech stack, 0002 Contract-v1)
├── CLAUDE.md                # Hard rules for agents
├── AGENTS.md                # Bot role notes
├── CHANGELOG.md
├── docker-compose.yml       # Postgres 16 (+ optional Redis profile)
├── .env.example
└── package.json             # npm/pnpm workspaces
```

## How to run

### 1. Infrastructure

```bash
cp .env.example .env
docker compose up -d
# optional Redis:
# docker compose --profile redis up -d
```

### 2. Install

```bash
npm install
# or: pnpm install
```

### 3. API

```bash
npm run dev:api
# health: http://localhost:3000/health
# openapi stub: http://localhost:3000/docs
# contract root: http://localhost:3000/v1
```

Prisma (when ready):

```bash
npm run prisma:generate -w @kathapp/api
npm run prisma:migrate -w @kathapp/api
```

### 4. Web

```bash
npm run dev:web
# http://localhost:5173/de  |  http://localhost:5173/en
```

UI locale lives in the URL; content locale is separate (`docs/conventions.md`).

## Docs

- [Vision & Nicht-Ziele](docs/vision.md)
- [Architecture](docs/architecture.md)
- [Conventions](docs/conventions.md)
- [Development](docs/development.md)
- [Roadmap](docs/roadmap.md)
- [Glossary](docs/glossary.md)
- [ADR 0001 — Tech stack](docs/decisions/0001-tech-stack.md)
- [ADR 0002 — Contract-v1](docs/decisions/0002-contract-v1.md)
- [CLAUDE.md](CLAUDE.md) · [AGENTS.md](AGENTS.md)

## License

GNU General Public License v3.0 (**GPL-3.0**) — siehe [`LICENSE`](LICENSE).

## Team

Koordination über den KathApp-Stabschef und Fachbots (Frontend, Backend, Knowledge, Design).
