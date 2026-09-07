# Gestaltungsschicht — Umsetzungsplan, Schritt 3 bis 5

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Seiten benutzen die Komponentenschicht. Die Detailseite wird ein Artikel statt eines Datenbanksatzes, die Suche eine lesbare Trefferliste, und `AdminPages.tsx` zerfällt in Dateien, die je eine Aufgabe haben.

**Architecture:** Kein neuer Baustein außer zweien, deren Form erst der Umbau der Detailseite festlegt: `Citation` und `RelationRail`. Der Entwurf nannte Letzteren `RelationChip`; aus dem Umbau ergibt sich, dass die Nebenspalte als Ganzes der Baustein ist und die einzelne Verknüpfung darin aufgeht. Entscheidungslogik, die heute im JSX steckt, wandert in reine Funktionen nach `lib/`, wo sie prüfbar ist. Die Datenbeschaffung jeder Seite bleibt unverändert; ersetzt wird nur, was gerendert wird.

**Tech Stack:** React 18, TypeScript, Tailwind über die Tokens, Vitest mit jsdom, `@testing-library/react`.

**Spec:** [`docs/design/2026-09-07-frontend-design-system.md`](2026-09-07-frontend-design-system.md)
**Vorgänger:** [`docs/design/2026-09-07-frontend-foundation-plan.md`](2026-09-07-frontend-foundation-plan.md)

## Global Constraints

- **Keine neue Palette.** Farben kommen aus `tokens.css`. Gold nie als reine Textfarbe (`text-accent-text`), nie helle Schrift auf Goldfläche (`text-on-accent`). Zwei Tests erzwingen das.
- **Keine nachgeladene Schrift.** Serifen für Inhalt, serifenlos für Bedienung.
- **Gold trägt drei Aufgaben:** Typmarke, Linie an der Belegstelle, aktiver Filter.
- **Keine Animation über Fokus und Hover hinaus.**
- **Keine Änderung an Contract-v1, API, Datenmodell oder Prisma-Schema.** Keine Änderung an der Datenbeschaffung der Seiten: `useQuery`-Aufrufe, Schlüssel und Fehlerbehandlung bleiben, wie sie sind.
- **Übersetzungsschlüssel immer in beiden Sprachen.** `apps/web/test/i18n.spec.ts` erzwingt das.
- **Vor jedem Commit grün:** `npm run lint && npm run typecheck && npm test && npm run build`, Rückgabewert 0.
- **Zustände bleiben vollständig.** Jede Seite behandelt heute Laden, Leerstand, Fehler, 404 und fehlende Berechtigung getrennt. Kein Umbau darf einen dieser Zustände verlieren.

---

## Dateien

**Neu:**

| Datei | Verantwortung |
| --- | --- |
| `apps/web/src/components/Citation.tsx` | Belegstelle: Locus, lateinischer Wortlaut, Übertragung, Herkunft |
| `apps/web/src/components/RelationRail.tsx` | Verknüpfungen als Nebenspalte |
| `apps/web/src/lib/entityFacts.ts` | welche Sachangaben eine Entität in der Byline zeigt |
| `apps/web/src/lib/detailRoute.ts` | Zielroute je Entitätstyp |
| `apps/web/src/pages/admin/DashboardPage.tsx` | Admin-Übersicht samt Anmeldefeld |
| `apps/web/src/pages/admin/ReviewPage.tsx` | Review-Queue und Review-Zeile |
| `apps/web/src/pages/admin/EntityListPages.tsx` | drei Listenseiten |
| `apps/web/src/pages/admin/EntityEditPages.tsx` | drei Bearbeitungsseiten |
| `apps/web/test/components/Citation.spec.tsx` | Tests |
| `apps/web/test/components/RelationRail.spec.tsx` | Tests |
| `apps/web/test/entityFacts.spec.ts` | Tests |

**Geändert:** `EntityDetailPage.tsx`, `SearchPage.tsx`, `HomePage.tsx`, `SuggestPage.tsx`, `SuggestionStatusPage.tsx`, `i18n.ts`, `components/index.ts`, `router.tsx` (nur Importpfade der Admin-Seiten).

**Gelöscht:** `apps/web/src/pages/AdminPages.tsx`, nachdem sein Inhalt aufgeteilt ist.

---

# Schritt 3 — Öffentliche Leseflächen

## Task 1: Abschnittsnamen aus der Lesersicht

**Files:**
- Modify: `apps/web/src/i18n.ts`
- Test: `apps/web/test/i18n.spec.ts`

**Interfaces:**
- Produces: `entity.slots.body` → „Beschreibung", `entity.slots.citations` → „Belegstellen", `entity.slots.relations` → „Verknüpft"

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

Ans Ende von `apps/web/test/i18n.spec.ts`, innerhalb des vorhandenen `describe('translations', …)`:

```ts
  it('names the detail sections for a reader, not after the data model', () => {
    const de = i18n.getFixedT('de', 'entity');
    const en = i18n.getFixedT('en', 'entity');

    expect(de('slots.body')).toBe('Beschreibung');
    expect(de('slots.citations')).toBe('Belegstellen');
    expect(de('slots.relations')).toBe('Verknüpft');

    expect(en('slots.body')).toBe('Description');
    expect(en('slots.citations')).toBe('References');
    expect(en('slots.relations')).toBe('Related');
  });
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL, `expected 'Inhalt' to be 'Beschreibung'`

- [ ] **Step 3: Minimale Umsetzung**

In `apps/web/src/i18n.ts`, deutscher `entity.slots`-Block:

```js
    slots: {
      body: 'Beschreibung',
      bodyEmpty: 'Kein Text für diese Locale.',
      citations: 'Belegstellen',
      citationsEmpty: 'Keine Belegstellen verknüpft.',
      relations: 'Verknüpft',
      relationsEmpty: 'Keine Verknüpfungen vorhanden.',
    },
```

englischer `entity.slots`-Block:

```js
    slots: {
      body: 'Description',
      bodyEmpty: 'No text for this locale.',
      citations: 'References',
      citationsEmpty: 'No references linked.',
      relations: 'Related',
      relationsEmpty: 'No relations yet.',
    },
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS, auch der vorhandene Schlüsselgleichheitstest

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/i18n.ts apps/web/test/i18n.spec.ts
git commit -m "feat(web): name the detail sections for a reader"
```

---

## Task 2: Sachangaben je Entitätstyp als reine Funktion

**Files:**
- Create: `apps/web/src/lib/entityFacts.ts`
- Test: `apps/web/test/entityFacts.spec.ts`

**Interfaces:**
- Consumes: `EntityDetailResponse`, `PublicEntityKind` aus `@kathapp/shared`
- Produces: `type Fact = { labelKey: string; value: string }`, `entityFacts(detail: EntityDetailResponse): Fact[]`

**Warum als Funktion:** Welche Angaben ein Heiliger, ein Wunder und eine Quelle zeigen, steckt heute als verschachtelte Bedingungskette im JSX der Detailseite. Das ist die einzige echte Entscheidung auf dieser Seite und gehört dorthin, wo sie prüfbar ist.

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/entityFacts.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { EntityDetailResponse } from '@kathapp/shared';
import { entityFacts } from '../src/lib/entityFacts';

function detail(over: Partial<EntityDetailResponse>): EntityDetailResponse {
  return {
    entityType: 'saint',
    id: 'x',
    locale: 'de',
    status: 'published',
    label: 'Stub Entity (dev)',
    translations: [],
    citations: [],
    edges: [],
    ...over,
  } as EntityDetailResponse;
}

const stamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('entityFacts', () => {
  it('returns nothing when an entity carries no facts', () => {
    expect(entityFacts(detail({}))).toEqual([]);
  });

  it('reports a saint feast note', () => {
    const facts = entityFacts(
      detail({
        entityType: 'saint',
        saint: { id: 'x', status: 'published', feastNote: '4. April', ...stamps },
      }),
    );
    expect(facts).toEqual([{ labelKey: 'detail.feastNote', value: '4. April' }]);
  });

  it('reports a death year and marks an approximate one', () => {
    const exact = entityFacts(
      detail({
        entityType: 'saint',
        saint: { id: 'x', status: 'published', deathYear: 636, ...stamps },
      }),
    );
    expect(exact).toEqual([{ labelKey: 'detail.deathYear', value: '636' }]);

    const approx = entityFacts(
      detail({
        entityType: 'saint',
        saint: {
          id: 'x',
          status: 'published',
          deathYear: 636,
          deathYearApprox: true,
          ...stamps,
        },
      }),
    );
    expect(approx).toEqual([{ labelKey: 'detail.deathYear', value: 'um 636' }]);
  });

  it('reports a miracle approximate date', () => {
    const facts = entityFacts(
      detail({
        entityType: 'miracle',
        miracle: { id: 'x', status: 'published', approxDate: '7. Jh.', ...stamps },
      }),
    );
    expect(facts).toEqual([{ labelKey: 'detail.approxDate', value: '7. Jh.' }]);
  });

  it('reports language, author and year for a source, in that order', () => {
    const facts = entityFacts(
      detail({
        entityType: 'source',
        source: {
          id: 'x',
          status: 'published',
          language: 'la',
          author: 'Isidor von Sevilla',
          year: 630,
          ...stamps,
        },
      }),
    );
    expect(facts.map((f) => f.labelKey)).toEqual([
      'detail.language',
      'detail.author',
      'detail.year',
    ]);
    expect(facts[2].value).toBe('630');
  });

  it('skips absent optional facts rather than showing an empty row', () => {
    const facts = entityFacts(
      detail({
        entityType: 'source',
        source: { id: 'x', status: 'published', language: 'la', ...stamps },
      }),
    );
    expect(facts).toEqual([{ labelKey: 'detail.language', value: 'la' }]);
  });

  it('ignores a payload that does not match the entity type', () => {
    // The API returns exactly one of saint/miracle/source; a mismatch is a bug
    // elsewhere and must not surface as a stray row.
    const facts = entityFacts(
      detail({
        entityType: 'miracle',
        saint: { id: 'x', status: 'published', feastNote: '4. April', ...stamps },
      }),
    );
    expect(facts).toEqual([]);
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../src/lib/entityFacts`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/lib/entityFacts.ts`:

```ts
import type { EntityDetailResponse } from '@kathapp/shared';

/** A label key plus its already-formatted value, ready for the byline. */
export type Fact = { labelKey: string; value: string };

/**
 * Which facts an entity shows beneath its title. This lived as a nested chain
 * of conditions inside the detail page's JSX, where it could not be checked.
 */
export function entityFacts(detail: EntityDetailResponse): Fact[] {
  const facts: Fact[] = [];

  if (detail.entityType === 'saint' && detail.saint) {
    const { feastNote, deathYear, deathYearApprox } = detail.saint;
    if (feastNote) facts.push({ labelKey: 'detail.feastNote', value: feastNote });
    if (deathYear != null) {
      facts.push({
        labelKey: 'detail.deathYear',
        value: deathYearApprox ? `um ${deathYear}` : String(deathYear),
      });
    }
  }

  if (detail.entityType === 'miracle' && detail.miracle?.approxDate) {
    facts.push({
      labelKey: 'detail.approxDate',
      value: detail.miracle.approxDate,
    });
  }

  if (detail.entityType === 'source' && detail.source) {
    const { language, author, year } = detail.source;
    facts.push({ labelKey: 'detail.language', value: language });
    if (author) facts.push({ labelKey: 'detail.author', value: author });
    if (year != null) facts.push({ labelKey: 'detail.year', value: String(year) });
  }

  return facts;
}
```

- [ ] **Step 4: Übersetzungsschlüssel für das Sterbejahr ergänzen**

`detail.deathYear` gibt es noch nicht. Im deutschen `entity.detail`-Block hinter `feastNote`:

```js
      deathYear: 'Sterbejahr',
```

im englischen:

```js
      deathYear: 'Year of death',
```

- [ ] **Step 5: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 6: Gegenprobe**

Entferne die Bedingung `detail.entityType === 'saint' &&`, sodass nur noch `detail.saint` geprüft wird.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `ignores a payload that does not match the entity type`. Danach zurücknehmen.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/entityFacts.ts apps/web/test/entityFacts.spec.ts apps/web/src/i18n.ts
git commit -m "feat(web): entity facts as a testable function"
```

---

## Task 3: Citation

**Files:**
- Create: `apps/web/src/components/Citation.tsx`
- Create: `apps/web/test/components/Citation.spec.tsx`
- Modify: `apps/web/src/components/index.ts`

**Interfaces:**
- Consumes: `CitationView` aus `@kathapp/shared`
- Produces: `<Citation citation={CitationView}>{sourceLink}</Citation>`

**Warum als Kind statt als `href`:** Ein einfaches `<a href>` würde die Seite neu laden und das Client-Routing verlieren. Die Komponente nimmt deshalb das fertige Link-Element entgegen und legt ihre Gestaltung per `Slot` darauf. `@radix-ui/react-slot` ist seit dem Projektstart als Abhängigkeit installiert und wurde bisher nirgends benutzt; das ist genau der Fall, für den es da ist.

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/Citation.spec.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { CitationView } from '@kathapp/shared';
import { Citation } from '../../src/components/Citation';

const link = (label: string) => <a href="/de/sources/s1">{label}</a>;

function citation(over: Partial<CitationView> = {}): CitationView {
  return {
    id: 'c1',
    sourceId: 's1',
    locus: 'Buch I · 29, 1',
    excerpt: null,
    excerptLatin: null,
    entityType: 'source',
    entityId: 's1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    source: null,
    sourceTitle: null,
    ...over,
  } as CitationView;
}

describe('Citation', () => {
  afterEach(cleanup);

  it('always shows the locus, which is what makes a citation checkable', () => {
    render(<Citation citation={citation()}>{link('s1')}</Citation>);
    expect(screen.getByText('Buch I · 29, 1')).toBeDefined();
  });

  it('shows the Latin wording and the rendering when both exist', () => {
    render(
      <Citation
        citation={citation({
          excerptLatin: 'Etymologia est origo vocabulorum.',
          excerpt: 'Die Etymologie ist der Ursprung der Wörter.',
        })}
      >
        {link('Etymologiae')}
      </Citation>,
    );
    expect(screen.getByText('Etymologia est origo vocabulorum.')).toBeDefined();
    expect(
      screen.getByText('Die Etymologie ist der Ursprung der Wörter.'),
    ).toBeDefined();
  });

  it('marks the Latin wording with its language, for screen readers', () => {
    const { container } = render(
      <Citation citation={citation({ excerptLatin: 'Etymologia est origo.' })}>
        {link('Etymologiae')}
      </Citation>,
    );
    expect(container.querySelector('[lang="la"]')?.textContent).toBe(
      'Etymologia est origo.',
    );
  });

  it('links to the source and names it when a title is known', () => {
    render(
      <Citation citation={citation()}>{link('Etymologiae')}</Citation>,
    );
    const rendered = screen.getByRole('link', { name: 'Etymologiae' });
    expect(rendered.getAttribute('href')).toBe('/de/sources/s1');
  });

  it('leaves the link text to the caller, which knows the title', () => {
    render(<Citation citation={citation()}>{link('s1')}</Citation>);
    expect(screen.getByRole('link').textContent).toBe('s1');
  });

  it('renders nothing for an excerpt that is not there', () => {
    const { container } = render(
      <Citation citation={citation()}>{link('s1')}</Citation>,
    );
    expect(container.querySelector('[lang="la"]')).toBeNull();
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/Citation`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/Citation.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { CitationView } from '@kathapp/shared';

/**
 * A citation is the provenance of everything around it, so it gets the weight
 * on the page rather than sitting in a list of links. The gold rule is one of
 * the three jobs the accent colour is allowed to do.
 */
export function Citation({
  citation,
  children,
}: {
  citation: CitationView;
  /** The source link, already built by the caller so routing survives. */
  children: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 border-l-2 border-border pb-5 pl-5 transition-colors hover:border-accent">
      <span className="text-xs uppercase tracking-label text-muted">
        {citation.locus}
      </span>
      {citation.excerptLatin ? (
        <p lang="la" className="max-w-measure font-serif italic leading-prose">
          {citation.excerptLatin}
        </p>
      ) : null}
      {citation.excerpt ? (
        <p className="max-w-measure font-serif text-sm leading-prose text-muted">
          {citation.excerpt}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        <Slot className="text-text underline-offset-4 hover:underline">
          {children}
        </Slot>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Gegenprobe**

Entferne `lang="la"` vom lateinischen Absatz.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `marks the Latin wording with its language`. Danach zurücknehmen.

- [ ] **Step 6: Sammel-Export ergänzen**

In `apps/web/src/components/index.ts`:

```ts
export { Citation } from './Citation';
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components apps/web/test/components/Citation.spec.tsx
git commit -m "feat(web): Citation component"
```

---

## Task 4: RelationRail

**Files:**
- Create: `apps/web/src/components/RelationRail.tsx`
- Create: `apps/web/test/components/RelationRail.spec.tsx`
- Modify: `apps/web/src/components/index.ts`

**Interfaces:**
- Consumes: `EdgeChip` aus `@kathapp/shared`
- Produces: `<RelationRail title={string} emptyMessage={string} items={{ edge: EdgeChip; link: ReactNode }[]} />`

Dasselbe Muster wie bei `Citation`: das fertige Link-Element kommt von der Seite, die Gestaltung legt die Komponente per `Slot` darauf.

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/RelationRail.spec.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { EdgeChip } from '@kathapp/shared';
import { RelationRail } from '../../src/components/RelationRail';
import '../../src/i18n';

const edge: EdgeChip = {
  id: 'e1',
  type: 'saint_source',
  relatedEntityType: 'saint',
  relatedId: 'sa1',
  label: 'Isidor von Sevilla',
  citationId: null,
  note: null,
};

describe('RelationRail', () => {
  afterEach(cleanup);

  it('names itself with a heading, so the page keeps an outline', () => {
    render(
      <RelationRail title="Verknüpft" emptyMessage="Keine" items={[]} />,
    );
    expect(screen.getByRole('heading').textContent).toBe('Verknüpft');
  });

  it('shows the empty message rather than an empty list', () => {
    const { container } = render(
      <RelationRail title="Verknüpft" emptyMessage="Keine Verknüpfungen" items={[]} />,
    );
    expect(screen.getByText('Keine Verknüpfungen')).toBeDefined();
    expect(container.querySelector('a')).toBeNull();
  });

  it('links each relation, with the label the caller supplied', () => {
    render(
      <RelationRail
        title="Verknüpft"
        emptyMessage="Keine"
        items={[{ edge, link: <a href="/de/saints/sa1">Isidor von Sevilla</a> }]}
      />,
    );
    const rendered = screen.getByRole('link');
    expect(rendered.getAttribute('href')).toBe('/de/saints/sa1');
    expect(rendered.textContent).toContain('Isidor von Sevilla');
  });

  it('keys by edge id, so two relations to the same entity both render', () => {
    render(
      <RelationRail
        title="Verknüpft"
        emptyMessage="Keine"
        items={[
          { edge, link: <a href="/de/saints/sa1">Erster</a> },
          { edge: { ...edge, id: 'e2' }, link: <a href="/de/saints/sa1">Zweiter</a> },
        ]}
      />,
    );
    expect(screen.getAllByRole('link').length).toBe(2);
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/RelationRail`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/RelationRail.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useTranslation } from 'react-i18next';
import type { EdgeChip } from '@kathapp/shared';

export function RelationRail({
  title,
  emptyMessage,
  items,
}: {
  title: string;
  emptyMessage: string;
  /** Each link is built by the caller, so client-side routing survives. */
  items: { edge: EdgeChip; link: ReactNode }[];
}) {
  const { t } = useTranslation('entity');

  return (
    <aside className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-label text-muted">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        items.map(({ edge, link }) => (
          <Slot
            key={edge.id}
            className="flex flex-col gap-0.5 border-l-2 border-accent bg-bg px-3 py-2 no-underline"
          >
            {link}
          </Slot>
        ))
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Gegenprobe**

Ersetze `key={edge.id}` durch `key={edge.relatedId}`.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `keys by edge id`. Danach zurücknehmen.

- [ ] **Step 6: Sammel-Export und Commit**

In `apps/web/src/components/index.ts`:

```ts
export { RelationRail } from './RelationRail';
```

```bash
git add apps/web/src/components apps/web/test/components/RelationRail.spec.tsx
git commit -m "feat(web): RelationRail component"
```

---

## Task 5: Die Detailseite wird ein Artikel

**Files:**
- Modify: `apps/web/src/pages/EntityDetailPage.tsx`
- Create: `apps/web/src/lib/detailRoute.ts`
- Test: `apps/web/test/detailRoute.spec.ts`

**Interfaces:**
- Consumes: `PageHeader`, `Prose`, `SectionRule`, `EmptyState`, `Citation`, `RelationRail`, `entityFacts`
- Produces: `detailSegment(kind: PublicEntityKind): string`

**Zuerst die Routenzuordnung.** Sie wird von dieser Seite und von der Suche gebraucht. Eine zweite Kopie wäre genau die Drift, die dieses Projekt anderswo schon zweimal eingefangen hat, deshalb entsteht sie hier einmal und wird in Task 6 nur noch importiert.

- [ ] **Step 0a: Den fehlschlagenden Test schreiben**

`apps/web/test/detailRoute.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PUBLIC_ENTITY_KINDS } from '@kathapp/shared';
import { detailSegment } from '../src/lib/detailRoute';

describe('detailSegment', () => {
  it('maps every public entity kind, so a new one cannot fall through', () => {
    for (const kind of PUBLIC_ENTITY_KINDS) {
      expect(detailSegment(kind).length).toBeGreaterThan(0);
    }
  });

  it('uses the plural segments the API and router agree on', () => {
    expect(detailSegment('saint')).toBe('saints');
    expect(detailSegment('miracle')).toBe('miracles');
    expect(detailSegment('source')).toBe('sources');
  });
});
```

Run: `npm test -w @kathapp/web` → FAIL mit `Failed to load url ../src/lib/detailRoute`

- [ ] **Step 0b: Umsetzen**

`apps/web/src/lib/detailRoute.ts`:

```ts
import type { PublicEntityKind } from '@kathapp/shared';

/** URL segment per entity kind. The API, the router and the links agree here. */
const SEGMENTS: Record<PublicEntityKind, string> = {
  saint: 'saints',
  miracle: 'miracles',
  source: 'sources',
};

export function detailSegment(kind: PublicEntityKind): string {
  return SEGMENTS[kind];
}
```

Run: `npm test -w @kathapp/web` → PASS

**Unverändert bleibt:** alles oberhalb des `return`. Die `useQuery`-Konfiguration, die 404-Erkennung und die drei Export-Funktionen am Dateiende werden nicht angefasst.

- [ ] **Step 1: Den Rumpf ersetzen**

Ersetze in `EntityDetailPage` alles ab `return (` bis zum schließenden `);` durch:

```tsx
  const facts = query.data ? entityFacts(query.data) : [];

  return (
    <article className="flex flex-col gap-6">
      {query.isLoading && <p className="text-muted">{t('detail.loading')}</p>}

      {notFound && (
        <>
          <PageHeader title={t('detail.notFoundTitle')} />
          <EmptyState message={t('detail.notFound')} />
        </>
      )}

      {query.isError && !notFound && (
        <Banner tone="error">{t('detail.error')}</Banner>
      )}

      {query.data && (
        <>
          <PageHeader
            kicker={t(`chips.${kind}`)}
            title={query.data.label}
            byline={
              <>
                {facts.map((fact) => (
                  <span key={fact.labelKey}>
                    <span className="text-text">{t(fact.labelKey)}:</span>{' '}
                    {fact.value}
                  </span>
                ))}
                <span>
                  {t('detail.contentLocale')}: {query.data.locale}
                </span>
              </>
            }
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_210px] lg:gap-10">
            <div>
              <SectionRule label={t('slots.body')} />
              {query.data.body ? (
                <Prose>
                  <p>{query.data.body}</p>
                </Prose>
              ) : (
                <EmptyState message={t('slots.bodyEmpty')} />
              )}

              <SectionRule label={t('slots.citations')} />
              {query.data.citations.length === 0 ? (
                <EmptyState message={t('slots.citationsEmpty')} />
              ) : (
                query.data.citations.map((c) => (
                  <Citation key={c.id} citation={c}>
                    <Link
                      to="/$locale/sources/$id"
                      params={{ locale, id: c.sourceId }}
                      search={{ contentLocale }}
                    >
                      {c.sourceTitle ?? c.sourceId}
                    </Link>
                  </Citation>
                ))
              )}
            </div>

            <RelationRail
              title={t('slots.relations')}
              emptyMessage={t('slots.relationsEmpty')}
              items={query.data.edges.map((edge) => ({
                edge,
                link: (
                  <Link
                    to={`/$locale/${detailSegment(edge.relatedEntityType)}/$id`}
                    params={{ locale, id: edge.relatedId }}
                    search={{ contentLocale }}
                  >
                    <span className="text-[0.65rem] uppercase tracking-label text-muted">
                      {t(`chips.${edge.relatedEntityType}`)}
                    </span>
                    <span className="font-serif leading-tight text-text">
                      {edge.label}
                    </span>
                  </Link>
                ),
              }))}
            />
          </div>

          <footer className="border-t border-border pt-3 text-xs text-muted">
            <span className="font-mono">{query.data.id}</span>
          </footer>
        </>
      )}
    </article>
  );
```

- [ ] **Step 2: Importe und die Routensegment-Tabelle setzen**

Kopf der Datei:

```tsx
import {
  Banner,
  Citation,
  EmptyState,
  PageHeader,
  Prose,
  RelationRail,
  SectionRule,
} from '../components';
import { entityFacts } from '../lib/entityFacts';
import { detailSegment } from '../lib/detailRoute';
```

und oberhalb der Komponente:

Die bisherige Hilfskomponente `RelatedChipLink` am Dateianfang wird ersatzlos gelöscht.

- [ ] **Step 3: Gates laufen lassen**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: alles grün. Ungenutzte Importe meldet ESLint; entferne sie.

- [ ] **Step 4: Sichtprüfung mit echten Daten**

Die Datenbank ist leer, also erst einen veröffentlichten Eintrag über den Vorschlagsweg anlegen:

```bash
docker compose up -d
npm run dev:api
npm run dev:web
```

Unter `http://localhost:5173/de/suggest` als `contributor` anmelden, eine Quelle mit Beschreibung und Belegstelle einreichen, unter `http://localhost:5173/admin/de/review` als `reviewer` annehmen, dann die Detailseite öffnen.

Prüfen: die technische Kennung steht in der Fußzeile und nicht mehr über dem Titel; der Titel steht in Serifen; die Belegstelle trägt die Seite; die Nebenspalte erscheint ab großer Breite und rutscht darunter, wenn das Fenster schmal wird; alles in hell und dunkel.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/EntityDetailPage.tsx
git commit -m "feat(web): the detail page reads as an article, not a database row"
```

---

## Task 6: Die Trefferliste

**Files:**
- Modify: `apps/web/src/pages/SearchPage.tsx`

**Interfaces:**
- Consumes: `detailSegment` aus Task 5, `TextField`, `SelectField`, `Button`, `EmptyState`, `Banner`

- [ ] **Step 1: Entfällt — `detailSegment` entstand bereits in Task 5**

`apps/web/test/detailRoute.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PUBLIC_ENTITY_KINDS } from '@kathapp/shared';
import { detailSegment } from '../src/lib/detailRoute';

describe('detailSegment', () => {
  it('maps every public entity kind, so a new one cannot fall through', () => {
    for (const kind of PUBLIC_ENTITY_KINDS) {
      expect(detailSegment(kind).length).toBeGreaterThan(0);
    }
  });

  it('uses the plural segments the API and router agree on', () => {
    expect(detailSegment('saint')).toBe('saints');
    expect(detailSegment('miracle')).toBe('miracles');
    expect(detailSegment('source')).toBe('sources');
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../src/lib/detailRoute`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/lib/detailRoute.ts`:

```ts
import type { PublicEntityKind } from '@kathapp/shared';

/** URL segment per entity kind. The API, the router and the links agree here. */
const SEGMENTS: Record<PublicEntityKind, string> = {
  saint: 'saints',
  miracle: 'miracles',
  source: 'sources',
};

export function detailSegment(kind: PublicEntityKind): string {
  return SEGMENTS[kind];
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Die Trefferzeile umbauen**

Ersetze in `SearchPage.tsx` die Liste (heute ein `<ul>` mit `divide-y`) durch:

```tsx
        <ul className="flex flex-col">
          {items.map((hit) => (
            <li key={`${hit.entityType}:${hit.id}`}>
              <EntityHitLink
                hit={hit}
                locale={locale}
                contentLocale={contentLocale}
                className="grid grid-cols-[80px_minmax(0,1fr)] items-baseline gap-4 border-b border-border py-5 no-underline"
              >
                <span className="text-[0.65rem] uppercase tracking-label text-muted">
                  {t(`chips.${hit.entityType}`)}
                </span>
                <span>
                  <span className="block font-serif text-xl leading-tight text-text">
                    {hit.label}
                  </span>
                  {hit.snippet ? (
                    <span className="mt-1 block max-w-measure font-serif text-sm leading-prose text-muted">
                      {hit.snippet}
                    </span>
                  ) : null}
                </span>
              </EntityHitLink>
            </li>
          ))}
        </ul>
```

- [ ] **Step 6: Die Bedienelemente auf die Bausteine umstellen**

Das Formular. Die Namen `q` und `type` müssen bleiben, weil `onSubmit` sie über `FormData` ausliest, und die sichtbar verborgenen Labels von heute werden zu echten Labels:

```tsx
      <form className="flex flex-wrap items-end gap-3" onSubmit={onSubmit}>
        <div className="min-w-[14rem] flex-1">
          <TextField
            label={t('search.q')}
            name="q"
            defaultValue={q}
            placeholder={t('search.placeholder')}
          />
        </div>
        <SelectField label={t('search.type')} name="type" defaultValue={type}>
          <option value="">{t('search.typeAll')}</option>
          <option value="saint">{t('chips.saint')}</option>
          <option value="miracle">{t('chips.miracle')}</option>
          <option value="source">{t('chips.source')}</option>
        </SelectField>
        <Button type="submit">{t('search.submit')}</Button>
      </form>
```

Die Blätterleiste:

```tsx
        <nav aria-label={t('search.pager')} className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={!paging.hasPrevious}
            onClick={() => goToOffset(paging.previousOffset)}
          >
            {t('search.previous')}
          </Button>
          <span className="text-sm tabular-nums text-muted">
            {t('search.page', {
              page: paging.page,
              pageCount: paging.pageCount,
            })}
          </span>
          <Button
            variant="secondary"
            disabled={!paging.hasNext}
            onClick={() => goToOffset(paging.nextOffset)}
          >
            {t('search.next')}
          </Button>
        </nav>
```

Leerzustand und Fehler:

```tsx
      {query.isError && <Banner tone="error">{t('search.error')}</Banner>}

      {showEmpty && (
        <EmptyState
          message={isEmptyQuery ? t('search.emptyPrompt') : t('search.emptyResults')}
        />
      )}
```

Der bisherige `onSubmit`-Rumpf wird in eine benannte Funktion `onSubmit` oberhalb des `return` gezogen, damit das Formular lesbar bleibt. Sein Inhalt ändert sich nicht.

- [ ] **Step 7: Gates und Sichtprüfung**

Run: `npm run lint && npm run typecheck && npm test && npm run build`

Sichtprüfung unter `http://localhost:5173/de/search?q=`: leerer Zustand, Trefferliste mit dem angelegten Eintrag, Blättern, hell und dunkel, schmal und breit.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/pages/SearchPage.tsx apps/web/src/lib/detailRoute.ts apps/web/test/detailRoute.spec.ts
git commit -m "feat(web): search results carry their name, not a uniform small line"
```

---

## Task 7: Die Startseite

**Files:**
- Modify: `apps/web/src/pages/HomePage.tsx`
- Modify: `apps/web/src/i18n.ts`

- [ ] **Step 1: Den Text schärfen**

Die Startseite sagt heute, dass die UI-Locale in der URL steht und die Content-Locale davon getrennt ist. Das ist eine Aussage über die Bauweise, nicht über den Nutzen. Deutscher `common.home`-Block:

```js
    home: {
      title: 'Katholisches Wissen, mit Quelle',
      blurb:
        'Heilige, Wunder und die Quellen, die sie belegen. Jede Angabe führt auf die Stelle zurück, aus der sie stammt.',
      localeNote:
        'Inhalte kommen ausschließlich über geprüfte Vorschläge herein.',
      ctaSearch: 'Zur Suche',
    },
```

englisch:

```js
    home: {
      title: 'Catholic knowledge, with its sources',
      blurb:
        'Saints, miracles and the sources that attest them. Every statement leads back to the passage it came from.',
      localeNote: 'Content enters only through reviewed suggestions.',
      ctaSearch: 'Go to search',
    },
```

- [ ] **Step 2: Die Seite auf die Bausteine umstellen**

```tsx
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader, Prose } from '../components';

export function HomePage() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('home.title')} />
      <Prose>
        <p>{t('home.blurb')}</p>
      </Prose>
      <p className="text-sm text-muted">{t('home.localeNote')}</p>
      <Link
        to="/$locale/search"
        params={{ locale }}
        search={{
          q: undefined,
          type: undefined,
          offset: undefined,
          contentLocale: undefined,
        }}
        className="self-start rounded-sm bg-accent px-4 py-2 text-sm font-medium text-on-accent no-underline"
      >
        {t('home.ctaSearch')}
      </Link>
    </section>
  );
}
```

- [ ] **Step 3: Gates, Sichtprüfung, Commit**

```bash
npm run lint && npm run typecheck && npm test && npm run build
git add apps/web/src/pages/HomePage.tsx apps/web/src/i18n.ts
git commit -m "feat(web): the home page says what the site is for"
```

**Damit ist Schritt 3 fertig.** Der für Besucher sichtbare Teil ist geschlossen. Bricht die Arbeit hier ab, ist der Stand in sich stimmig.

---

# Schritt 4 — Vorschlagsweg

## Task 8: Vorschlagsformular und Statusseite

**Files:**
- Modify: `apps/web/src/pages/SuggestPage.tsx`
- Modify: `apps/web/src/pages/SuggestionStatusPage.tsx`

**Wichtig:** Die Logik dieser Seiten bleibt vollständig unangetastet. Anmeldung, Zusammenbau der Payload, Fehlerklassifizierung und die Publish-Gate-Anzeige funktionieren und werden nur anders dargestellt.

- [ ] **Step 1: Das Anmeldefeld umstellen**

In `SuggestPage.tsx` das Anmeldeformular:

```tsx
        <form
          className="flex max-w-lg flex-col gap-4 border border-border bg-surface p-4 md:p-6"
          onSubmit={onDevLogin}
        >
          <TextField
            label={t('login.email')}
            type="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            autoComplete="username"
          />
          <SelectField
            label={t('login.role')}
            value={loginRole}
            onChange={(e) => setLoginRole(e.target.value as Role)}
          >
            {DEV_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
          {loginError && <Banner tone="error">{loginError}</Banner>}
          <Button type="submit" busy={loginBusy} className="self-start">
            {loginBusy ? t('login.busy') : t('login.submit')}
          </Button>
        </form>
```

- [ ] **Step 2: Das Vorschlagsformular umstellen**

Alle sechs Felder, in dieser Reihenfolge: Entitätstyp als `SelectField`, Content-Locale als `TextField` mit `hint`, Name/Titel als `TextField`, Kurzbio als `TextAreaField`, Publish-Status als `SelectField`, und im Citation-Block `sourceId`, Locus, Excerpt und Excerpt (Latein) als je ein `TextField`. Die Zustandsvariablen und ihre `onChange`-Handler bleiben unverändert.

Das Muster für alle, am aufwendigsten Feld gezeigt:

```tsx
          <TextField
            label={t('form.contentLocale')}
            hint={t('form.contentLocaleHint')}
            value={contentLocale}
            onChange={(e) => setContentLocale(e.target.value)}
            onBlur={(e) => setContentLocale(sanitizeContentLocale(e.target.value, 'de'))}
            list="content-locale-options"
            required
          />
```

Die Einreichen-Schaltfläche auf `<Button type="submit" busy={submitting}>`.

Die Seitenüberschrift auf `PageHeader`.

- [ ] **Step 3: Die Statusseite umstellen**

In `SuggestionStatusPage.tsx` die Statusanzeige auf `SuggestionStatusChip` und die Überschrift auf `PageHeader`. Der Rest bleibt.

- [ ] **Step 4: Gates**

Run: `npm run lint && npm run typecheck && npm test && npm run build`

- [ ] **Step 5: Sichtprüfung des vollständigen Weges**

Anmelden, Vorschlag einreichen, Statusseite, dann als Reviewer annehmen. Prüfen, dass die Fehlerbanner weiterhin erscheinen: einmal ohne Anmeldung einreichen und einmal einen veröffentlichten Eintrag ohne Belegstelle annehmen, damit die Publish-Gate-Meldung mit ihren einzelnen Codes sichtbar wird.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/SuggestPage.tsx apps/web/src/pages/SuggestionStatusPage.tsx
git commit -m "feat(web): the suggestion flow uses the component layer"
```

---

# Schritt 5 — Admin

## Task 9: `AdminPages.tsx` aufteilen, ohne etwas zu ändern

**Files:**
- Create: `apps/web/src/pages/admin/DashboardPage.tsx`, `ReviewPage.tsx`, `EntityListPages.tsx`, `EntityEditPages.tsx`, `index.ts`
- Delete: `apps/web/src/pages/AdminPages.tsx`
- Modify: `apps/web/src/router.tsx`

**Diese Aufgabe verschiebt ausschließlich.** Kein Wort im JSX ändert sich, keine Klasse, kein Verhalten. Wer den Diff liest, soll sehen können, dass nichts passiert ist außer einem Umzug. Der Umbau folgt in Task 10, damit er auf einem lesbaren Diff sitzt.

- [ ] **Step 1: Die Dateien anlegen**

| Neue Datei | Umgezogen aus `AdminPages.tsx` |
| --- | --- |
| `admin/DashboardPage.tsx` | `DevLoginPanel`, `AdminDashboardPage` |
| `admin/ReviewPage.tsx` | `ReviewRow`, `STATUS_FILTERS`, `AdminReviewPage` |
| `admin/EntityListPages.tsx` | `AdminSaintsListPage`, `AdminMiraclesListPage`, `AdminSourcesListPage` |
| `admin/EntityEditPages.tsx` | `AdminSaintEditPage`, `AdminMiracleEditPage`, `AdminSourceEditPage` |

Hilfsfunktionen, die von mehreren gebraucht werden, wandern in die Datei, die sie am stärksten nutzt, und werden von dort exportiert.

`apps/web/src/pages/admin/index.ts`:

```ts
export { AdminDashboardPage } from './DashboardPage';
export { AdminReviewPage } from './ReviewPage';
export {
  AdminMiraclesListPage,
  AdminSaintsListPage,
  AdminSourcesListPage,
} from './EntityListPages';
export {
  AdminMiracleEditPage,
  AdminSaintEditPage,
  AdminSourceEditPage,
} from './EntityEditPages';
```

- [ ] **Step 2: Den Router umhängen**

In `apps/web/src/router.tsx` den Importpfad von `'./pages/AdminPages'` auf `'./pages/admin'` ändern. Die Importliste bleibt identisch.

- [ ] **Step 3: Die alte Datei löschen**

```bash
git rm apps/web/src/pages/AdminPages.tsx
```

- [ ] **Step 4: Nachweisen, dass wirklich nichts verändert wurde**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Zusätzlich zählen, dass keine Zeile verloren ging:

```bash
wc -l apps/web/src/pages/admin/*.tsx
```

Erwartet: die Summe liegt nahe an den ursprünglichen 510 Zeilen, abzüglich der doppelten Importblöcke.

- [ ] **Step 5: Sichtprüfung**

Alle Admin-Seiten aufrufen: Übersicht, Review, die drei Listen, eine Bearbeitungsseite. Sie müssen aussehen und sich verhalten wie vorher.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/admin apps/web/src/router.tsx
git commit -m "refactor(web): split AdminPages into one file per responsibility

Pure move: no JSX, class or behaviour change, so the restyle that follows
sits on a readable diff."
```

---

## Task 10: Die Admin-Seiten auf die Bausteine

**Files:**
- Modify: `apps/web/src/pages/admin/*.tsx`

- [ ] **Step 1: Anmeldefeld und Übersicht**

`DevLoginPanel` in `admin/DashboardPage.tsx` bekommt denselben Aufbau wie das Anmeldefeld aus Task 8:

```tsx
    <section className="flex flex-col gap-4">
      <PageHeader title={title} />
      <p className="text-muted">{t('login.required')}</p>
      <form
        className="flex max-w-lg flex-col gap-4 border border-border bg-surface p-4 md:p-6"
        onSubmit={onSubmit}
      >
        <TextField
          label={t('login.email')}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <SelectField
          label={t('login.role')}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ADMIN_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </SelectField>
        {error && <Banner tone="error">{error}</Banner>}
        <Button type="submit" busy={busy} className="self-start">
          {busy ? t('login.busy') : t('login.submit')}
        </Button>
      </form>
    </section>
```

Die Übersicht bekommt `PageHeader` für die Überschrift und `<Button variant="secondary" onClick={() => logout()}>` für das Abmelden.

- [ ] **Step 2: Review-Queue**

Der Statusfilter wird `SelectField`. Annehmen wird `<Button>`, Ablehnen `<Button variant="secondary">`, beide mit `busy={busy}`. Die Ablehnungsnotiz wird `TextField`. Der Statuschip wird `SuggestionStatusChip`. Die drei Fehlerzweige nutzen weiterhin die Banner aus `suggestionUi.tsx`, die intern bereits an `Banner` abgeben.

Die Zeile bekommt denselben Aufbau wie eine Trefferzeile: Kennung klein und einfarbig, Status als Chip, Bedienelemente darunter.

- [ ] **Step 3: Listen- und Bearbeitungsseiten**

Beide Gruppen sind Platzhalter mit Überschrift und Hinweistext. Sie bekommen genau diesen Rumpf, je Seite mit dem eigenen Titelschlüssel:

```tsx
    <section className="flex flex-col gap-4">
      <PageHeader title={t('list.title.saints')} />
      <EmptyState message={t('list.stub')} />
      <Link
        to="/admin/$locale/saints/$id/edit"
        params={{ locale, id: 'stub' }}
        className="self-start text-sm text-accent-text"
      >
        {t('list.editStub')}
      </Link>
    </section>
```

Mehr nicht. Was diese Seiten tun sollen, ist nicht entschieden, und eine Gestaltung auf Vorrat wäre verworfen, sobald es entschieden ist.

- [ ] **Step 4: Gates**

Run: `npm run lint && npm run typecheck && npm test && npm run build`

- [ ] **Step 5: Sichtprüfung**

Der vollständige Review-Weg: anmelden, Vorschlag in der Queue sehen, annehmen, Filter auf `accepted` stellen. Dazu einmal der Fall ohne Berechtigung, indem man sich als `contributor` anmeldet und die Review-Seite aufruft.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/admin
git commit -m "feat(web): the admin pages use the component layer"
```

---

## Abschluss

- [ ] **Vollständiger Durchlauf**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Erwartet: Rückgabewert 0. Die Testzahl steigt von 168 auf ungefähr 188.

- [ ] **Kein Rückfall bei den Kontrasten**

Die beiden Wächter aus dem Fundament laufen mit. Sollte einer anschlagen, ist irgendwo wieder Gold als Textfarbe oder helle Schrift auf einer Goldfläche gelandet.

- [ ] **Drei PRs**, entlang der drei Schritte: Tasks 1 bis 7 als „Öffentliche Leseflächen", Task 8 als „Vorschlagsweg", Tasks 9 und 10 als „Admin". Die Aufteilung von `AdminPages.tsx` gehört in denselben PR wie ihr Umbau, aber als eigener Commit davor, damit der Diff lesbar bleibt.

## Was danach offen bleibt

- **Der Graph-Canvas** steht zu Recht auf der Später-Liste in `docs/roadmap.md`.
- **Eine lizenzierte Textschrift** ist der nächste sinnvolle Schritt, aber eine eigene Entscheidung mit Lizenzfragen, die bei GPL-3.0 nicht trivial sind.
- **Was die Admin-Listen- und Bearbeitungsseiten tun sollen** ist nicht entschieden. Sie bleiben deshalb bewusst Platzhalter.
