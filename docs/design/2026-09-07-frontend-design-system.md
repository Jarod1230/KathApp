# Entwurf — Gestaltungsschicht für `apps/web`

- **Status:** Zur Abstimmung
- **Datum:** 2026-09-07
- **Betrifft:** nur `apps/web` und `docs/`
- **Kein ADR nötig:** Contract-v1, Persistenz, Rollen und Extension Points bleiben unberührt. Es ändert sich, wie Daten dargestellt werden, nicht welche.

## Ausgangslage

Die Weboberfläche ist funktional korrekt und in ihren Zuständen sorgfältig gebaut: Laden, Leerstand, Fehler und fehlende Berechtigung werden überall getrennt behandelt, 401 und 403 unterschieden, fehlgeschlagene Publish-Gates einzeln benannt. Was fehlt, ist keine Logik, sondern eine Schicht.

Konkret:

- `apps/web/src/styles/tokens.css` definiert eine vollständige Palette, eine Abstandsskala, Radien, Schattenstufen, eine Serifenkette und ein komplettes Dunkelschema. Benutzt werden davon Farben und Abstände. **Die Serifenschrift kommt in genau einer Zeile vor** (lateinischer Auszug), **das Dunkelschema hat keinen Schalter.**
- Es gibt **kein `components/`-Verzeichnis**. Schaltflächen, Felder, Karten und Meldungsbanner werden in jeder Seite neu geschrieben.
- `@radix-ui/react-slot` ist als Abhängigkeit installiert und wird **nirgends verwendet**.
- `AdminPages.tsx` ist auf **510 Zeilen** gewachsen und enthält Dashboard, Review-Queue, Review-Zeile, drei Listenseiten und drei Bearbeitungsseiten.
- Auf der inhaltlich wichtigsten Fläche, der Detailseite, steht als erste Zeile `entityType: source · id: cmtq3f0lw…`. Die Abschnitte heißen `Inhalt`, `Quellen`, `Verknüpfungen`, also nach dem Datenmodell. Alles steht in derselben kleinen Schriftgröße.

## Gestaltungsrichtung

**Gelehrtes Archiv.** Die Oberfläche ordnet und tritt zurück; Belege stehen im Vordergrund.

Die Begründung ist inhaltlich, nicht geschmacklich. `CLAUDE.md` macht Provenienz zur obersten Regel: keine erfundenen Fakten, Wissen betritt das System nur über den Vorschlagsweg, Zitate hängen an Quellen. Damit ist die Aufgabe der Oberfläche, **Herkunft lesbar zu machen** — ein typografisches und editorisches Problem.

Zwei Alternativen wurden verworfen:

- **Sakral und ornamental** würde eine religiöse Autorität behaupten, die eine Software nicht hat, und altert schlecht.
- **Generisches Wissensprodukt** wäre am zugänglichsten, verkauft den Inhalt aber unter Wert und hat kein eigenes Gesicht.

Abgestimmt anhand des gerenderten Entwurfs (Vorher-Nachher, hell und dunkel).

## Grundsätze

1. **Serifen für Inhalt, serifenlos für Bedienung.** Diese Trennung existiert heute nicht und ist der größte einzelne Hebel.
2. **Gold trägt genau drei Aufgaben:** Typmarke über dem Titel, Linie an der Belegstelle, aktiver Filter. Sonst nichts.
3. **Keine neue Palette.** Jeder Farbwert bleibt der aus `tokens.css`.
4. **Keine nachgeladene Schrift.** Die Serifenkette nutzt Systemschriften; die Seite bleibt netzunabhängig. Eine lizenzierte Textschrift ist eine spätere, eigene Entscheidung mit Lizenzfragen, die bei GPL-3.0 nicht trivial sind.
5. **Nicht alles ist eine Karte.** Rahmen, Fläche, Radius und Schatten werden nach Rolle vergeben, nicht flächendeckend.

## Umfang

### Token-Ebene

`tokens.css` wird **ergänzt, nicht ersetzt**. Neu hinzu kommen nur, was heute fehlt:

| Token | Zweck |
| --- | --- |
| `--leading-prose`, `--leading-tight` | Zeilenhöhen; heute implizit |
| `--measure` | Zeilenlänge für Fließtext (ca. 66 Zeichen) |
| `--text-display` | Titelgröße oberhalb von `--text-3xl` |
| `--tracking-label` | Sperrung für Versalien-Marken |

Vorhandene Tokens bleiben unverändert. Die Tailwind-Anbindung wird entsprechend erweitert.

### Komponentenschicht

Neu: `apps/web/src/components/`. Aufgenommen wird nur, was heute mehrfach vorkommt.

| Komponente | Ersetzt |
| --- | --- |
| `Button` | inline gestylte `<button>` in Suche, Vorschlag, Review |
| `Field` (Text, Textarea, Select) | Label-plus-Control-Paare in Vorschlag und Anmeldung |
| `Banner` mit `tone` | `AuthErrorBanner`, `GenericErrorBanner`, `GateFailureList` aus `suggestionUi.tsx` |
| `Chip` | Entitätstyp- und Suggestion-Status-Chips |
| `EmptyState` | Leerzustandstexte in Suche, Review, Detail |
| `PageHeader` | Kopfbereiche aller Seiten |
| `Prose` | Fließtext mit Zeilenmaß und Serifen |
| `SectionRule` | beschriftete Haarlinie als Abschnittstrenner |
| `Citation` | Belegstelle mit Locus, Latein, Übertragung, Herkunft |
| `RelationChip` | Edge-Chips, künftig in der Nebenspalte |
| `ThemeToggle` | neu |

Radix wird dort eingesetzt, wo Barrierefreiheit sonst Handarbeit wäre, zunächst beim Select. Keine Komponente wird auf Vorrat gebaut.

### Seiten

| Datei | Änderung |
| --- | --- |
| `EntityDetailPage.tsx` | Kennung wandert in die Fußzeile; Titel in Serifen; Byline mit Sachangaben; Belegstellen werden der Anker; Verknüpfungen ab `lg` in die Nebenspalte |
| `SearchPage.tsx` | Trefferzeilen mit tragendem Namen, Typ als ruhige Spalte, Trefferbereich und Pager in der neuen Typografie |
| `HomePage.tsx` | Einstieg statt Platzhaltertext |
| `SuggestPage.tsx` | Formular über `Field` und `Button`; keine Änderung an der Logik |
| `SuggestionStatusPage.tsx` | Status über `Chip` |
| `PublicShell.tsx`, `AdminShell.tsx` | Typografie, `ThemeToggle` |
| `AdminPages.tsx` | **wird aufgeteilt** in `admin/DashboardPage`, `admin/ReviewPage` (mit `ReviewRow`), `admin/EntityListPages`, `admin/EntityEditPages` |

Die Aufteilung von `AdminPages.tsx` ist kein Beiwerk: 510 Zeilen mit acht Seiten darin sind der Grund, warum dort am meisten dupliziert wird.

### Dunkelschema

Umschalter in beiden Shells. Reihenfolge: ausdrückliche Wahl des Nutzers, sonst `prefers-color-scheme`. Die Wahl wird pro Browser gespeichert; ein fehlender oder unlesbarer Speicher fällt auf die Systemeinstellung zurück und wirft nicht.

### Barrierefreiheit

Der vorhandene Stand ist gut und bleibt: `role="alert"` auf Meldungen, sichtbarer Fokus, beschriftete Bedienelemente. Ergänzt wird: Kontrastprüfung beider Themes gegen WCAG AA, `prefers-reduced-motion` respektiert, Fokusreihenfolge in der neuen Nebenspalte geprüft.

## Was ausdrücklich nicht dazugehört

Keine Bilder oder Illustrationen. Keine Animation über Fokus und Hover hinaus. Keine nachgeladene Schrift. Kein Graph-Canvas, der steht zu Recht auf der Später-Liste in `docs/roadmap.md`. Keine Änderung an API, Contract, Datenmodell oder Übersetzungsschlüsseln, außer wo ein Abschnittsname bewusst umbenannt wird.

## Prüfung

Wie eine Oberfläche aussieht, lässt sich nicht sinnvoll per Unit-Test festhalten. Prüfbar ist ihr **Verhalten**, und darauf zielen die Tests:

- **Bestandsschutz:** die 104 vorhandenen Tests bleiben grün. `SearchPage` und die Detailseite behalten ihr Verhalten bei Laden, Leerstand, 404 und Fehler.
- **Neue Komponententests** mit `@testing-library/react` (MIT, GPL-3.0-kompatibel; jsdom ist seit dem 401-PR bereits eingerichtet): `Button` im Zustand deaktiviert und beschäftigt; `Field` verbindet Label und Control korrekt; `Banner` bildet `tone` auf die richtige Rolle ab; `Chip` bildet Status und Entitätstyp vollständig ab, sodass ein neuer Wert nicht stillschweigend durchfällt.
- **`ThemeToggle`:** ausdrückliche Wahl schlägt Systemeinstellung, Wahl überlebt einen Neuaufbau, fehlender Speicher fällt sauber zurück.
- **Sichtprüfung** jeder umgebauten Fläche im Browser, hell und dunkel, schmal und breit. Diese Prüfung wird im jeweiligen PR benannt, nicht behauptet.

Jede Verhaltensänderung folgt dem in diesem Projekt etablierten Weg: erst der fehlschlagende Test, dann die Umsetzung, danach die Gegenprobe durch Rücknahme.

## Reihenfolge

Fünf aufeinander aufbauende, einzeln überprüfbare PRs:

1. **Fundament** — Token-Ergänzungen, Typografie in den Shells, `ThemeToggle`. Sofort sichtbar, kleiner Diff.
2. **Komponentenschicht** — Primitive samt Tests, noch ohne Seitenumbau.
3. **Öffentliche Leseflächen** — Start, Suche, Detailseite. Das inhaltliche Herzstück.
4. **Vorschlagsweg** — Formular und Statusseite.
5. **Admin** — Aufteilung von `AdminPages.tsx`, danach Umbau.

Nach Schritt 3 ist der für Besucher sichtbare Teil fertig. Bricht die Arbeit dort ab, ist der Stand trotzdem geschlossen.

## Entschieden

- **Abschnittsnamen** (2026-09-07, bestätigt). `Inhalt`, `Quellen` und `Verknüpfungen` stammen aus dem Datenmodell und werden zu `Beschreibung`, `Belegstellen` und `Verknüpft`. Betrifft die Schlüssel unter `entity.slots` in beiden Sprachen; die englische Seite wandert entsprechend auf `Description`, `References` und `Related`.

## Offene Punkte

- **Lizenzierte Textschrift.** Bewusst zurückgestellt. Sinnvollste spätere Steigerung, aber eine eigene Entscheidung mit Lizenzfragen, die bei GPL-3.0 nicht trivial sind.
