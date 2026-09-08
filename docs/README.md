# KathApp — Dokumentation

Einstiegspunkt in den Dokumentationsbestand. Jede Datei hat genau einen Zweck;
wenn du nicht weißt, wo etwas hingehört, ist die Antwort meistens hier.

## Verstehen

| Dokument | Inhalt |
| --- | --- |
| [`vision.md`](vision.md) | Zielbild und, mindestens genauso wichtig, die Nicht-Ziele |
| [`architecture.md`](architecture.md) | Monorepo, Domänenmodell, Laufzeit, Extension Points |
| [`glossary.md`](glossary.md) | Domänenbegriffe und Projektvokabular |

## Mitarbeiten

| Dokument | Inhalt |
| --- | --- |
| [`development.md`](development.md) | Umgebung einrichten, Skripte, Qualitätstore |
| [`conventions.md`](conventions.md) | Benennung, i18n-Trennung, API-Form, PR-Regeln |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Ablauf von Branch bis Merge |

## Nachvollziehen

| Dokument | Inhalt |
| --- | --- |
| [`decisions/`](decisions/) | Architecture Decision Records — warum etwas so ist |
| [`lessons-learned.md`](lessons-learned.md) | Was schiefging und was daraus folgt |
| [`design/`](design/) | Gestaltungsentwürfe und ihre Umsetzungspläne |
| [`roadmap.md`](roadmap.md) | Was als Nächstes ansteht |

## Wohin schreibe ich was?

- **„Wir haben uns für X statt Y entschieden."** → neuer ADR in `decisions/`.
  Auch bei kleinen Entscheidungen. ADRs werden nicht nachträglich umgeschrieben,
  sondern durch neuere abgelöst oder mit einem Änderungsvermerk versehen.
- **„Das hat mich zwei Stunden gekostet, weil …"** → `lessons-learned.md`.
  Auch und gerade, wenn es beim Schreiben trivial wirkt.
- **„So soll die Oberfläche aussehen."** → `design/`, mit Begründung und den
  verworfenen Alternativen.
- **„So heißt das bei uns."** → `glossary.md`.
- **„Das machen wir bewusst nicht."** → Nicht-Ziele in `vision.md`.

## Wo dieses Projekt am leisesten kaputtgeht

Zwei Stellen, an denen ein Fehler keine Exception erzeugt, sondern eine Seite,
auf der etwas fehlt oder etwas steht, das dort nicht stehen dürfte:

1. **Das Publish-Gate.** Es muss jedem Sprung folgen, nicht nur der angefragten
   Entität. Ein vergessener Filter an einer Citation-Quelle liefert
   unveröffentlichte Daten aus, ohne dass etwas bricht.
2. **Erfundene Domänenfakten.** Ein Platzhalter, der wie kuratiertes Wissen
   aussieht, ist von echtem Wissen später nicht mehr zu unterscheiden.

Beides steht als harte Regel in [`../CLAUDE.md`](../CLAUDE.md) und wird in der
PR-Vorlage abgefragt.
