# .claude/

Konfiguration für [Claude Code](https://claude.com/claude-code) in diesem
Repository.

- **`settings.json`** — im Repository versioniert, gilt für alle. Erlaubt Bau-,
  Test- und Lesebefehle ohne Rückfrage und sperrt den Lesezugriff auf `.env`.
  Dort stehen der Datenbankzugang und `JWT_SECRET`; beides hat im Kontext eines
  Agenten nichts verloren.
- **`launch.json`** — Startkonfiguration für API und Weboberfläche, damit die
  Anwendung ohne Rateversuche gestartet werden kann. Beide brauchen ein
  laufendes Postgres, siehe [`../docs/development.md`](../docs/development.md).
- **`settings.local.json`** — persönliche Ergänzungen, über `.gitignore`
  ausgenommen. Gehört nicht ins Repository.

Die inhaltliche Arbeitsanweisung steht nicht hier, sondern in
[`../CLAUDE.md`](../CLAUDE.md) und [`../AGENTS.md`](../AGENTS.md).

Warum das eingecheckt ist: ein Agent startet ohne Gedächtnis. Was er über dieses
Projekt wissen muss, muss im Projekt stehen — dieselbe Begründung wie bei
[`../docs/lessons-learned.md`](../docs/lessons-learned.md).
