# Lessons Learned

Was uns Zeit gekostet hat, damit es das nicht noch einmal tut.

**Wann hier etwas hingehört:** Wenn dich etwa eine Stunde etwas gekostet hat,
das eine Notiz verhindert hätte. Nicht erst, wenn es „wichtig genug" wirkt —
die Einträge, die am meisten sparen, wirken beim Schreiben meist trivial.

**Gilt ausdrücklich auch für KI-Agenten.** Ein Agent startet ohne Gedächtnis;
diese Datei ist das Gedächtnis.

## Format

```markdown
## JJJJ-MM-TT — Kurze Überschrift

**Kontext:** Was wurde versucht.
**Problem:** Was passierte, und woran es lag.
**Konsequenz:** Was daraus folgt — konkret genug, um danach zu handeln.
**Belege:** Links, Commits, Dateien.
```

Neue Einträge kommen nach unten. Einträge werden nicht gelöscht; wenn etwas
überholt ist, wird es als überholt markiert und der Grund dazugeschrieben.

---

## 2026-09-06 — Eine grüne CI, die nichts prüfte

**Kontext:** `CLAUDE.md` erklärt „Every PR must pass CI (lint, typecheck, tests,
build)" für bindend. Die Actions-Läufe waren grün.

**Problem:** Von den vier genannten Toren war keines wirksam. `lint` und `test`
waren in allen drei Workspaces `echo`-Befehle, die einen Text ausgaben und mit
0 endeten. Es existierte weder eine ESLint-Konfiguration noch eine einzige
Testdatei. Der Typecheck lief mit `continue-on-error: true`. Der Job konnte
praktisch nur am Build scheitern.

**Konsequenz:**

- Ein Platzhalter-Skript, das mit 0 endet, ist schlimmer als ein fehlendes: es
  erzeugt ein Signal, dem man glaubt. Wenn ein Schritt noch nicht existiert,
  darf er nicht so tun, als liefe er.
- Jedes Tor muss einmal gegen kaputten Input geprüft werden, bevor man ihm
  glaubt. Für die vier Tore hier: Lint 1, Typecheck 2, Test 1.
- `continue-on-error` gehört in keinen Schritt, der laut Projektregeln blockiert.

**Belege:** PR [#4](https://github.com/Jarod1230/KathApp/pull/4).

---

## 2026-09-06 — Der dokumentierte Aufbau war nie durchführbar

**Kontext:** Die README-Schritte auf einem sauberen Checkout nachvollziehen.

**Problem:** Schritt 3 bricht ab mit `P1012: Environment variable not found:
DATABASE_URL`. Ursache: **nichts im Repository lud jemals eine `.env`.** npm
führt Workspace-Skripte mit dem Arbeitsverzeichnis des Workspace aus, die README
legt die Datei aber im Repo-Root an. Betroffen war nicht nur die Migration,
sondern auch `npm run dev:api`.

**Konsequenz:**

- Eine Einrichtungsanleitung, die nie von einem sauberen Checkout aus gefahren
  wurde, ist eine Vermutung. Vor dem Einchecken einmal wirklich durchlaufen.
- In einem npm-Workspace ist das Arbeitsverzeichnis eines Skripts der Workspace,
  nicht das Repo-Root. Wer eine Datei im Root erwartet, muss sie ausdrücklich
  laden.

**Belege:** PR [#5](https://github.com/Jarod1230/KathApp/pull/5),
`apps/api/package.json` (die `dotenv -e ../../.env`-Präfixe).

---

## 2026-09-06 — `import type` zerstört NestJS' Dependency Injection

**Kontext:** Einführung von ESLint. Die Regel
`@typescript-eslint/consistent-type-imports` meldete sieben Verstöße, alle als
automatisch behebbar markiert.

**Problem:** NestJS löst Konstruktor-Abhängigkeiten über die
`design:paramtypes`-Metadaten auf, die TypeScript für dekorierte Klassen
emittiert. Ein `import type` wird gelöscht, **bevor** diese Metadaten
geschrieben werden. Im kompilierten Output wurde aus
`[entities_service_1.EntitiesService]` ein nacktes `[Function]`. Der Autofix
hätte die API zur Laufzeit gebrochen, ohne dass Typecheck oder Build etwas
gemeldet hätten.

**Konsequenz:**

- Die Regel ist für `apps/api` abgeschaltet und der Grund steht als Kommentar in
  `eslint.config.mjs`. Nicht wieder einschalten.
- Bei jeder Lint-Regel, die Importe umschreibt, im **emittierten** `dist/`
  nachsehen, nicht nur im Quelltext. Dekoratoren und Metadaten sind der Bereich,
  in dem Quelltext und Ausgabe auseinanderfallen.

**Belege:** `eslint.config.mjs`, PR [#4](https://github.com/Jarod1230/KathApp/pull/4).

---

## 2026-09-06 — Der Lesepfad verschweigt kaputte Daten

**Kontext:** Durchsicht der öffentlichen Leseendpunkte.

**Problem:** Zwei getrennte Fälle mit derselben Eigenschaft. Erstens filterte
die Detailseite die Quelle einer Citation nach `deletedAt`, aber nie nach
`status` — Autor, Jahr, Signatur und URL unveröffentlichter Quellen wurden
öffentlich ausgeliefert. Zweitens schrieb der Accept-Pfad Kanten mit
ungeprüften Endpunkten, und die Lesepfade überspringen solche Zeilen
stillschweigend.

Der gemeinsame Nenner: **der Fehler äußert sich nicht als Fehler, sondern als
Inhalt, der auf einer Seite fehlt.** Niemand bemerkt ihn.

**Konsequenz:**

- Das Publish-Gate folgt **jedem Sprung**, nicht nur der angefragten Entität.
  Citation-Quellen, Edge-Ziele und alles, was später dazukommt. Die Regel steht
  in `docs/conventions.md`.
- Was der Lesepfad still überspringt, muss der Schreibpfad ablehnen. Wo die
  Datenbank die Bedingung nicht erzwingen kann — polymorphe Referenzen —, prüft
  die Anwendung sie beim Schreiben.
- Ein Test, der nur den Gutfall abdeckt, findet diese Klasse nie. Der
  aussagekräftige Test ist der, der prüft, dass etwas **nicht** erscheint.

**Belege:** PRs [#7](https://github.com/Jarod1230/KathApp/pull/7) und
[#12](https://github.com/Jarod1230/KathApp/pull/12), ADR
[0005](decisions/0005-graph-referential-integrity.md).

---

## 2026-09-06 — Testdaten in der Reihenfolge der Erwartung prüfen nichts

**Kontext:** Erste Tests für die Content-Locale-Fallback-Kette
(angefragt → de → en → erste verfügbare).

**Problem:** Die Testzeilen standen zufällig in derselben Reihenfolge wie die
Fallback-Kette. Eine Implementierung, die die Kette komplett ignoriert und
einfach die erste Zeile nimmt, bestand alle Tests. Aufgefallen ist es erst, als
die Implementierung absichtlich kaputtgemacht wurde und die Tests grün blieben.

**Konsequenz:**

- Nach dem Grün einmal die Implementierung brechen und prüfen, dass der
  passende Test rot wird. Ein Test, der bei kaputter Implementierung grün
  bleibt, ist kein Test.
- Testdaten so anordnen, dass die naive Falschimplementierung ein **anderes**
  Ergebnis liefert als die richtige. Bei einer Reihenfolge-Regel heißt das:
  die Daten in der falschen Reihenfolge hinschreiben.

**Belege:** `apps/api/test/locale.util.spec.ts`, Kommentar an der Stelle.

---

## 2026-09-06 — Textausgabe ist kein Rückgabewert

**Kontext:** Prüfung eines fremden PRs. Gemeldet wurde „besteht alle Gates".

**Problem:** Der Testbefehl gab `Tests 24 passed | 20 skipped` aus und endete
mit Fehlercode 1. Die Integrationstests scheiterten, weil kein Postgres lief.
Gelesen wurde nur die Textzeile, nicht der Rückgabewert.

**Konsequenz:**

- Bei jeder Aussage über den Zustand eines Befehls den Rückgabewert prüfen, nicht
  die Textausgabe. `npm test >/dev/null 2>&1; echo $?`.
- Eine gefilterte Ausgabe (`grep`) kann einen Fehlschlag komplett verdecken.
  Wer filtert, verliert das Signal.

**Belege:** dieselbe Sitzung, korrigiert vor dem Merge.

---

## 2026-09-06 — `NODE_ENV` darf nichts einschalten

**Kontext:** Durchsicht des Auth-Slice vor dem Merge.

**Problem:** Zwei Schalter leiteten „sicher" aus `NODE_ENV` ab. Der Dev-Login
war frei, sobald `NODE_ENV !== 'production'` galt — also auch bei **nicht
gesetzter** Variable. `start:prod` lautet schlicht `node dist/main.js` und setzt
nichts. Der Endpunkt vergibt Tokens für beliebige Adressen in beliebiger Rolle.
Dasselbe Muster beim Signaturschlüssel: ohne `JWT_SECRET` wurde mit einem im
Repository veröffentlichten Wert signiert.

Live nachgestellt: unter genau der Produktionsumgebung ergab die alte Bedingung
`true`, die neue `false`.

**Konsequenz:**

- **`NODE_ENV` schaltet nie etwas ein, sondern höchstens eine Prüfung lockern.**
  Ein fehlender Wert muss zur sicheren Seite führen.
- Kein Geheimnis bekommt einen eingebauten Rückfallwert. Fehlt es, startet die
  Anwendung nicht.
- Ein ADR, der ein Verhalten beschreibt, ersetzt nicht die Prüfung, ob der Code
  es tut. ADR 0003 behauptete „disabled in production by default"; die
  Implementierung tat das Gegenteil.

**Belege:** `apps/api/src/auth/auth.config.ts`, PR
[#8](https://github.com/Jarod1230/KathApp/pull/8), ADR
[0003](decisions/0003-dev-jwt-login.md) mit Änderungsvermerk.

---

## 2026-09-07 — Ein Test ohne die Produktionskonfiguration besteht gegen den Fehler

**Kontext:** `GET /v1/search` antwortete mit 400, sobald nicht beide
Paging-Parameter mitgeschickt wurden. Die Weboberfläche schickt keinen davon.

**Problem:** Zwei Lücken übereinander.

Es gab **keine Tests auf HTTP-Ebene**, nur auf Service-Ebene. Der Service war
fehlerfrei, während der Controller davor die Anfrage abwies.

Und der erste HTTP-Test, der dagegen geschrieben wurde, **bestand trotz des
Fehlers.** Er baute das Modul über `NestFactory.create(AppModule)`, aber die
globale Konfiguration steht in `main.ts` und wurde nie angewandt — der Test
installierte genau die Pipes nicht, in denen der Defekt saß.

**Konsequenz:**

- Was `main.ts` an der App konfiguriert, gehört in eine wiederverwendbare
  Funktion (`src/bootstrap.ts`), die Test und Produktion teilen. Ein Test gegen
  ein anders konfiguriertes System prüft ein anderes System.
- Für jede HTTP-Oberfläche gibt es mindestens einen Test auf HTTP-Ebene. Pipes,
  Guards und Filter sind Verhalten und liegen außerhalb des Services.

**Belege:** `apps/api/src/bootstrap.ts`,
`apps/api/test/integration/search.http.spec.ts`, PR
[#14](https://github.com/Jarod1230/KathApp/pull/14).

---

## 2026-09-07 — Vitest erzeugt keine Decorator-Metadaten

**Kontext:** Erster Versuch, die NestJS-App in einem Test zu booten.

**Problem:** Jede Anfrage endete mit einem 500 und
`Cannot read properties of undefined (reading 'search')`. Der Controller hatte
keinen Service. Ursache: Vitest transformiert mit esbuild, und esbuild
unterstützt `emitDecoratorMetadata` nicht. Ohne diese Metadaten kann NestJS
keine Konstruktor-Abhängigkeit auflösen.

Der Fehler sieht aus wie ein Fehler im Anwendungscode und ist eine Eigenschaft
der Testumgebung.

**Konsequenz:**

- Die API-Tests werden mit SWC statt esbuild transformiert
  (`unplugin-swc` in `apps/api/vitest.config.mts`). Nicht entfernen.
- Ein `undefined`-Service in einem Nest-Test ist fast immer ein
  Transformer-Problem, kein Verdrahtungsproblem.

**Belege:** `apps/api/vitest.config.mts`, PR
[#14](https://github.com/Jarod1230/KathApp/pull/14).

---

## 2026-09-07 — Die Node-Version lokal ist nicht die der CI

**Kontext:** Ein Wächter-Test durchsuchte den Quelltext und nutzte dafür
`fs.globSync`.

**Problem:** Lokal lief Node 22, in der CI Node 20. `fs.globSync` gibt es erst
ab Node 22. Der Test wäre in der CI abgestürzt — an einer Stelle, die mit dem
geprüften Gegenstand nichts zu tun hat.

**Konsequenz:**

- Vor der Nutzung einer Node-API prüfen, ab welcher Version es sie gibt, und
  gegen `node-version` in `.github/workflows/ci.yml` abgleichen (aktuell 20).
- Im Zweifel die ältere, breiter verfügbare Variante nehmen. Ein rekursives
  `readdirSync` ist zehn Zeilen und läuft überall.

**Belege:** `apps/web/test/contrast.spec.ts`, Kommentar an der Stelle.

---

## 2026-09-07 — Ein definiertes Dunkelschema, das nie erreichbar war

**Kontext:** Der Dunkelschema-Umschalter sollte drei Zustände bekommen: System,
hell, dunkel.

**Problem:** `tokens.css` definierte die dunkle Palette vollständig, aber
ausschließlich hinter `[data-theme='dark']`. Es gab **gar keinen
`prefers-color-scheme`-Block.** Die Systemeinstellung wäre eine tote Option
gewesen, die immer hell bleibt — sichtbar angeboten, ohne Wirkung.

**Konsequenz:**

- Ein Theme braucht drei Zustände in der CSS-Struktur, nicht zwei: die
  ausdrückliche Wahl in beide Richtungen **und** den ungestempelten Fall, in dem
  nur `prefers-color-scheme` entscheidet.
- Die dunklen Werte stehen dadurch in zwei Selektoren. Ein Test prüft, dass
  beide dieselben Tokens tragen, sonst rendert ein Weg ins Dunkelschema halb.

**Belege:** `apps/web/src/styles/tokens.css`, `apps/web/test/tokens.spec.ts`,
PR [#16](https://github.com/Jarod1230/KathApp/pull/16).

---

## 2026-09-07 — Kontrast ist rechenbar, also wurde er gerechnet

**Kontext:** Die Gestaltungsvorgaben verlangen WCAG AA in beiden Themes.

**Problem:** Der Gold-Akzent `#c9a227` erreicht auf dem hellen Grund `#f7f5f0`
**2,22:1**. Nötig sind 4,5 für normalen und 3,0 für großen Text. Betroffen waren
die Wortmarke und **jede primäre Schaltfläche**, denn `bg-accent` mit `text-bg`
ist helle Schrift auf Gold — dieselben 2,22:1. Im Dunkelschema erreicht dasselbe
Gold 7,65:1, weshalb es niemandem auffiel.

**Konsequenz:**

- Kontrast wird nicht im Review beurteilt, sondern ausgerechnet. Zwei Tests tun
  das: einer rechnet alle Paare direkt aus `tokens.css`, einer durchsucht den
  Quelltext nach den beiden Ausprägungen des Fehlers.
- Ein Akzentton ist selten gleichzeitig Flächen- und Textfarbe. Getrennte
  Tokens: `--color-accent` für Flächen und Linien, `--color-accent-text` für
  Text, `--color-on-accent` für Schrift auf der Fläche.
- Ein Wert, der in einem Theme funktioniert, ist damit nicht geprüft.

**Belege:** `apps/web/test/contrast.spec.ts`, PR
[#16](https://github.com/Jarod1230/KathApp/pull/16).

---

## 2026-09-07 — Dieselbe Regel an drei Stellen driftet auseinander

**Kontext:** Zweimal unabhängig aufgetreten.

**Problem:** Die **Rollenhierarchie** stand wortgleich in `apps/api` und in
`apps/web`, in keinem der beiden Fälle in `packages/shared`. Das ist das
Berechtigungsmodell: eine zwischen `contributor` und `reviewer` eingeschobene
Rolle hätte Oberfläche und Guards uneins gemacht.

Die **Endpunkt-Typen einer Kante** standen als Kommentar im Contract, als
Fallunterscheidung im Lesepfad und im Schreibpfad gar nicht — weshalb der
Schreibpfad sie nicht prüfte.

**Konsequenz:**

- Was zwei Apps brauchen, gehört nach `packages/shared`. `docs/conventions.md`
  sagt das für DTOs; es gilt genauso für Regeln.
- Ein Kommentar ist keine Definition. Was im Code gelten soll, muss im Code
  stehen, damit es geprüft werden kann.
- Der Nachweis, dass eine Definition trägt: sie kaputtmachen und prüfen, dass
  Tests an **allen** Verwendungsorten rot werden.

**Belege:** `roleAtLeast` und `EDGE_ENDPOINT_KINDS` in
`packages/shared/src/index.ts`, PRs
[#10](https://github.com/Jarod1230/KathApp/pull/10) und
[#12](https://github.com/Jarod1230/KathApp/pull/12).

---

## 2026-09-07 — Das Shared-Paket war für Werte nie importierbar

**Kontext:** Erster Import eines **Wertes** aus `@kathapp/shared` in die
Weboberfläche. Bis dahin waren es ausschließlich Typen.

**Problem:** Der Build brach mit
`"roleAtLeast" is not exported by "packages/shared/dist/index.js"`. Das Paket
baute nur CommonJS, und seine `exports`-Angabe hatte keine `import`-Bedingung.
Vite fand darin keine benannten Exporte. Unbemerkt blieb das jahrelang möglich,
weil Typen beim Kompilieren verschwinden.

**Konsequenz:**

- `packages/shared` baut doppelt: CommonJS für die NestJS-API, ESM für Vite, mit
  passenden `exports`-Bedingungen.
- Ein Paket, aus dem bisher nur Typen importiert wurden, ist nicht erprobt. Der
  erste Wertimport ist der erste echte Test.

**Belege:** `packages/shared/package.json`, `packages/shared/tsconfig.esm.json`.

---

## 2026-09-08 — React rendert doppelte Schlüssel, also prüfte der Test nichts

**Kontext:** Eine Liste sollte nach Kanten-ID schlüsseln, damit zwei
Verknüpfungen auf dieselbe Entität unterscheidbar bleiben.

**Problem:** Der Test „beide werden gerendert" blieb grün, als der Schlüssel
absichtlich auf die Ziel-ID umgestellt wurde. React rendert doppelt geschlüsselte
Geschwister trotzdem und gibt nur eine Warnung aus; falsch verhält es sich erst
beim Umsortieren.

**Konsequenz:**

- Ein Schlüsselfehler ist über die gerenderte Ausgabe nicht nachweisbar. Der
  Test muss die React-Warnung messen (`vi.spyOn(console, 'error')`).
- Allgemeiner: Wenn eine Gegenprobe nicht rot wird, ist nicht die
  Implementierung in Ordnung, sondern der Test kaputt.

**Belege:** `apps/web/test/components/RelationRail.spec.tsx`.

---

## 2026-09-08 — Unsichtbare Beschriftungen werden beim Umbau sichtbar

**Kontext:** Umbau der Suche auf die Komponentenschicht. Die Felder hatten
`sr-only`-Labels, die neuen Komponenten zeigen sie an.

**Problem:** Die Beschriftungen lauteten `q` und `type` — die rohen
Query-Parameternamen. Als reine Screenreader-Angabe war das vertretbar, sichtbar
nicht. Dasselbe im Vorschlagsformular mit `sourceId` und `Excerpt`, dort schon
vorher sichtbar.

**Konsequenz:**

- Beschriftungen, die nur für Screenreader gedacht sind, trotzdem so schreiben,
  als wären sie sichtbar. Sie werden es irgendwann.
- Feldnamen aus dem Datenmodell sind keine Nutzertexte. `Locus` darf stehen
  bleiben, weil es ein echter Fachbegriff ist; `sourceId` nicht.

**Belege:** `apps/web/src/i18n.ts`, PRs
[#18](https://github.com/Jarod1230/KathApp/pull/18) und
[#19](https://github.com/Jarod1230/KathApp/pull/19).
