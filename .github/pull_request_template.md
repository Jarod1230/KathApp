# Was ändert sich

<!-- Kurz und in ganzen Sätzen. Was tut dieser PR und warum? -->

Behebt #

## Art der Änderung

<!-- Mehrfachnennung ist der Normalfall, nicht die Ausnahme: Angekreuzt wird,
     was im Diff steckt, nicht der Hauptzweck des PRs.

     "Dokumentation" gilt, sobald Dokumentation **inhaltlich** geändert wurde —
     ein neuer Absatz in `architecture.md`, ein Eintrag in `lessons-learned.md`,
     eine neue Glossar-Definition. Also alles, was jemand beim Review lesen
     sollte.

     Nicht angekreuzt bei reiner Pflege: einen Haken in `roadmap.md` setzen,
     eine Zeile ins `CHANGELOG.md` schreiben. Das fällt in fast jedem PR an und
     sagt nichts darüber, worauf zu schauen ist. -->

- [ ] Neues Feature
- [ ] Fehlerbehebung
- [ ] Refactoring ohne Verhaltensänderung
- [ ] Gestaltung bzw. Oberfläche
- [ ] Dokumentation
- [ ] Build, CI oder Werkzeuge

## Wie geprüft

<!-- Welche Tests laufen, und was belegen sie? Bei Integrationstests: gegen
     echtes Postgres oder übersprungen? Bei Oberflächenänderungen: was wurde
     im laufenden System angesehen, in welchem Theme, bei welcher Breite?

     Sichtprüfungen bitte benennen, nicht behaupten. "Sieht gut aus" ist keine
     Prüfung; "bei 1280px stehen zwei Spalten, bei 800px untereinander" ist eine. -->

## Checkliste

- [ ] Konventionen aus `docs/conventions.md` eingehalten
- [ ] Alle vier Tore lokal grün, **mit Rückgabewert 0** geprüft:
      `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] Tests für neue Logik ergänzt; jede neue Zusicherung einmal durch Rücknahme
      der Implementierung geprüft (`docs/lessons-learned.md`, Eintrag vom 06.09.)
- [ ] Bei nutzersichtbarer Änderung: `CHANGELOG.md` unter `[Unreleased]` ergänzt
- [ ] Bei neuen Abhängigkeiten: Lizenz genannt und GPL-3.0-verträglich
- [ ] Keine Zugangsdaten, Tokens oder personenbezogenen Daten im Diff

## Contract-v1 und ADR-Gate

<!-- Nur ausfüllen, wenn Contract, Persistenz, Rollen oder Extension Points
     betroffen sind. Sonst diesen Abschnitt löschen. -->

- [ ] Betrifft **keine** Contract-v1-Form. Falls doch: ADR unter
      `docs/decisions/` ergänzt und angenommen, **bevor** Code entstand
- [ ] `packages/shared`, `apps/api` und `apps/web` gemeinsam aktualisiert —
      keine Regel und kein DTO existiert an zwei Stellen
- [ ] Soft-Delete (`deletedAt`) und `updatedAt` an neuen Domänenentitäten
- [ ] Neue öffentliche Routen liegen unter `/v1/`

## Domänenintegrität

<!-- Immer ausfüllen. Das ist die Stelle, an der dieses Projekt am leisesten
     kaputtgeht: ein falscher Filter liefert keine Exception, sondern eine Seite,
     auf der etwas fehlt oder etwas steht, das dort nicht stehen dürfte. -->

- [ ] **Keine erfundenen Domänenfakten.** Keine Heiligen, Wunder, Quellen,
      Zitate, lateinischen Texte, Festtage oder historischen Angaben, die nicht
      belegt sind. Testdaten sind entweder erkennbar Platzhalter
      (`Stub Entity (dev)`) oder nachweislich gemeinfrei und korrekt
- [ ] Kein Seed, der wie kuratiertes Wissen aussieht
- [ ] **Das Publish-Gate folgt jedem Sprung**, nicht nur der angefragten
      Entität: Citation-Quellen, Edge-Ziele, alles Neue. Ein Test prüft, dass
      Unveröffentlichtes **nicht** erscheint
- [ ] Was der Lesepfad still überspringt, lehnt der Schreibpfad ab

## Bei Änderungen an der Oberfläche

<!-- Nur ausfüllen, wenn `apps/web` betroffen ist. Sonst löschen. -->

- [ ] Übersetzungsschlüssel in **beiden** Sprachen ergänzt
- [ ] Beschriftungen sind Nutzertexte, keine Feldnamen aus dem Datenmodell
- [ ] Farben aus `tokens.css`; kein `text-accent` als reine Textfarbe, keine
      helle Schrift auf Goldfläche (zwei Tests erzwingen das)
- [ ] Hell und dunkel angesehen, schmal und breit
- [ ] Zustände vollständig: Laden, Leerstand, Fehler, 404, fehlende Berechtigung
