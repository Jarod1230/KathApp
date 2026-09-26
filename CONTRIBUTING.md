# Mitarbeit an KathApp

Danke für dein Interesse. Dieses Dokument beschreibt, wie hier gearbeitet wird.

## Sprache

- **Dokumentation, Issues, Pull-Request-Beschreibungen: Deutsch.**
- **Code, Bezeichner, Code-Kommentare, Commit-Messages: Englisch.**
- **Nutzertexte in der Oberfläche: beide,** über i18n. Ein Schlüssel ohne
  Gegenstück in der anderen Sprache lässt die Tests fehlschlagen.

Die Trennung steht in [`docs/conventions.md`](docs/conventions.md) und in
[`CLAUDE.md`](CLAUDE.md).

## Bevor du anfängst

1. Lies [`docs/vision.md`](docs/vision.md), vor allem die **Nicht-Ziele**.
   Einiges ist bewusst außerhalb des Zuschnitts, und das steht dort, damit man
   es nicht im Review aushandeln muss.
2. Lies [`CLAUDE.md`](CLAUDE.md). Das sind keine Empfehlungen, sondern die
   Regeln, an denen ein PR scheitert.
3. Wirf einen Blick in [`docs/lessons-learned.md`](docs/lessons-learned.md).
   Die Datei ist kurz und spart mehr Zeit, als sie kostet.
4. Wenn du eine Architekturentscheidung triffst oder änderst, gehört sie als ADR
   nach [`docs/decisions/`](docs/decisions/). Auch wenn sie klein wirkt, und
   **bevor** Code entsteht.

## Ablauf

1. Branch von `main`. Namensschema in
   [`docs/conventions.md`](docs/conventions.md).
2. Änderungen committen. Conventional Commits.
3. Pull Request gegen `main`. Die PR-Vorlage bitte ausfüllen, nicht löschen.
   **Das gilt ausnahmslos**, auch für Doku-Änderungen und Einzeiler: Die PRs
   sind die Übersicht darüber, was im Projekt passiert ist.
4. Was in `main` landet, besteht alle vier Tore. Die CI fährt genau das, was du
   lokal fahren kannst:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

**Den Rückgabewert prüfen, nicht die Textausgabe.** Ein Testlauf kann
„24 passed" ausgeben und trotzdem mit 1 enden. Das ist hier schon einmal
passiert, siehe `lessons-learned.md`.

## Was in einen Pull Request gehört

- Eine abgeschlossene Sache. Kein „und nebenbei noch schnell".
- Tests für neue Logik. **Und die Gegenprobe:** jede neue Zusicherung einmal
  dadurch prüfen, dass man die Implementierung bricht und sieht, dass der Test
  rot wird. Ein Test, der bei kaputter Implementierung grün bleibt, ist kein
  Test — auch das ist hier schon vorgekommen.
- Dokumentation, die zur Änderung passt: Architekturentscheidung → ADR;
  Gestaltung → `docs/design/`; „hat mich eine Stunde gekostet" →
  `docs/lessons-learned.md`.
- Ein Eintrag in [`CHANGELOG.md`](CHANGELOG.md) unter `[Unreleased]`, wenn die
  Änderung für Nutzer sichtbar ist.

## Sonderregel: Domänenintegrität

Das ist die Stelle, an der dieses Projekt am leichtesten kaputtgeht, weil Fehler
dort still sind.

**Es werden keine Domänenfakten erfunden.** Keine Heiligen, Wunder, Quellen,
Zitate, lateinischen Texte, Festtage oder historischen Angaben, die nicht
belegt sind — nicht im Code, nicht in Tests, nicht in Dokumentation, nicht in
Beispieldaten.

Konkret:

- Testdaten sind **entweder** erkennbar Platzhalter (`Stub Entity (dev)`)
  **oder** nachweislich gemeinfrei und korrekt, mit Quelle.
- Es gibt keinen Seed, der wie kuratiertes Wissen aussieht. Eine leere Datenbank
  ist der richtige Zustand.
- Wissen betritt das System ausschließlich über den Suggestion-Workflow oder
  einen ausdrücklich autorisierten Import.

Der zweite stille Bereich ist das **Publish-Gate**. Es muss jedem Sprung folgen,
nicht nur der angefragten Entität: Citation-Quellen, Edge-Ziele und alles, was
später dazukommt. Ein vergessener Filter liefert unveröffentlichte Daten aus,
ohne dass irgendetwas bricht. Der aussagekräftige Test ist deshalb der, der
prüft, dass etwas **nicht** erscheint.

## Contract-v1

Contract-v1 ist angenommen und eingefroren, siehe
[ADR 0002](docs/decisions/0002-contract-v1.md). Entitäten, Enums,
Suggestion-Zustände, Rollen und die API-Form werden nicht nebenbei umbenannt
oder umgeformt.

Wer daran etwas ändern will: ADR zuerst, Code danach. `packages/shared`,
`apps/api` und `apps/web` werden dabei gemeinsam angefasst — eine Regel oder ein
DTO an zwei Stellen driftet auseinander, und das ist hier bereits zweimal
passiert.

## Sicherheit

Keine Sicherheitslücken als öffentliches Issue. Siehe
[`SECURITY.md`](SECURITY.md).

## Lizenz

KathApp steht unter **GPL-3.0**. Beiträge werden unter derselben Lizenz
aufgenommen. Neue Abhängigkeiten müssen damit verträglich sein, und die Lizenz
gehört in die PR-Beschreibung.
