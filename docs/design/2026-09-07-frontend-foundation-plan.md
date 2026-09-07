# Gestaltungsschicht — Umsetzungsplan, Schritt 1 und 2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Weboberfläche bekommt ein nutzbares Typografie-Fundament, einen erreichbaren Dunkelschema-Umschalter und eine getestete Komponentenschicht, auf der die Seitenumbauten aufsetzen können.

**Architecture:** Reine Logik (Theme-Vorliebe) liegt in `lib/`, ohne React. Darstellende Bausteine liegen in `components/`, jeweils eine Datei pro Baustein, gebündelt über eine Sammel-Datei. Bestehende Seiten bleiben in diesem Plan unangetastet, mit einer Ausnahme: die drei bereits vorhandenen Meldungsbanner in `suggestionUi.tsx` werden zu einem Baustein zusammengeführt, weil genau diese Dopplung der Anlass ist.

**Tech Stack:** React 18, TypeScript, Tailwind mit CSS-Variablen aus `tokens.css`, Vitest mit jsdom, `@testing-library/react`, Radix.

**Spec:** [`docs/design/2026-09-07-frontend-design-system.md`](2026-09-07-frontend-design-system.md)

## Global Constraints

- **Keine neue Palette.** Jeder Farbwert kommt aus `apps/web/src/styles/tokens.css`. Keine Literale wie `#fff` oder `text-red-700` in Komponenten.
- **Keine nachgeladene Schrift.** Serifen- und Serifenlos-Ketten bleiben die vorhandenen Systemschriften.
- **Gold (`--color-accent`) hat genau drei Aufgaben:** Typmarke über dem Titel, Linie an der Belegstelle, aktiver Filter. Nirgends sonst.
- **Keine Animation über Fokus und Hover hinaus.** `prefers-reduced-motion` wird respektiert.
- **Kontrast nach WCAG AA in beiden Themes.**
- **Code-Bezeichner Englisch, Doku und Nutzertexte Deutsch/Englisch** (`CLAUDE.md`).
- **Keine Änderung an Contract-v1, API, Datenmodell oder Prisma-Schema.**
- **Vor jedem Commit grün:** `npm run lint && npm run typecheck && npm test && npm run build`.
- **Neue Abhängigkeiten müssen GPL-3.0-kompatibel sein** und die Lizenz wird im PR benannt.
- Übersetzungsschlüssel werden **immer in beiden Sprachen** ergänzt; `apps/web/test/i18n.spec.ts` erzwingt das.

---

## Dateien

**Neu:**

| Datei | Verantwortung |
| --- | --- |
| `apps/web/src/lib/theme.ts` | Theme-Vorliebe lesen, schreiben, anwenden. Ohne React. |
| `apps/web/src/components/ThemeToggle.tsx` | Umschalter hell / dunkel / System |
| `apps/web/src/components/Button.tsx` | Schaltfläche, drei Ausprägungen, Zustand beschäftigt |
| `apps/web/src/components/Field.tsx` | `TextField`, `TextAreaField`, `SelectField` |
| `apps/web/src/components/Banner.tsx` | Meldung mit Tonfall `error` \| `denied` \| `gates` |
| `apps/web/src/components/Chip.tsx` | Entitätstyp- und Suggestion-Status-Chip |
| `apps/web/src/components/Typography.tsx` | `Prose`, `SectionRule`, `PageHeader`, `EmptyState` |
| `apps/web/src/components/index.ts` | Sammel-Export |
| `apps/web/test/theme.spec.ts` | Tests zu `lib/theme.ts` |
| `apps/web/test/tokens.spec.ts` | Tokens und Tailwind-Anbindung driften nicht auseinander |
| `apps/web/test/components/*.spec.tsx` | je ein Test pro Baustein |

**Geändert:**

| Datei | Änderung |
| --- | --- |
| `apps/web/src/styles/tokens.css` | vier neue Tokens plus der fehlende `prefers-color-scheme`-Block; vorhandene Werte unverändert |
| `apps/web/tailwind.config.js` | Anbindung der neuen Tokens |
| `apps/web/src/layouts/PublicShell.tsx` | Typografie, `ThemeToggle` |
| `apps/web/src/layouts/AdminShell.tsx` | Typografie, `ThemeToggle` |
| `apps/web/src/lib/suggestionUi.tsx` | die drei Banner geben an `Banner` ab |
| `apps/web/src/i18n.ts` | Schlüssel für Umschalter und Banner |
| `apps/web/package.json` | `@testing-library/react` als Entwicklungsabhängigkeit |

---

## Task 1: Theme-Vorliebe als reine Logik

**Files:**
- Create: `apps/web/src/lib/theme.ts`
- Test: `apps/web/test/theme.spec.ts`

**Interfaces:**
- Consumes: nichts
- Produces:
  - `type ThemePreference = 'light' | 'dark' | 'system'`
  - `readStoredPreference(): ThemePreference`
  - `storePreference(pref: ThemePreference): void`
  - `applyPreference(pref: ThemePreference): void`
  - `THEME_STORAGE_KEY: string`

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/theme.spec.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyPreference,
  readStoredPreference,
  storePreference,
} from '../src/lib/theme';

describe('readStoredPreference', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to system when nothing is stored', () => {
    expect(readStoredPreference()).toBe('system');
  });

  it('returns a stored preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readStoredPreference()).toBe('dark');
  });

  it('ignores a value that is not a known preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readStoredPreference()).toBe('system');
  });

  it('falls back to system when storage throws', () => {
    // Private-mode browsers throw on access rather than returning null.
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStoredPreference()).toBe('system');
    spy.mockRestore();
  });
});

describe('storePreference', () => {
  beforeEach(() => localStorage.clear());

  it('writes an explicit choice', () => {
    storePreference('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('removes the entry when the choice returns to system', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    storePreference('system');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('does not throw when storage refuses to write', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => storePreference('dark')).not.toThrow();
    spy.mockRestore();
  });
});

describe('applyPreference', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('stamps the root element for an explicit dark choice', () => {
    applyPreference('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('stamps the root element for an explicit light choice', () => {
    applyPreference('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('leaves the root unstamped for system, so the OS setting decides', () => {
    applyPreference('dark');
    applyPreference('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../src/lib/theme`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/lib/theme.ts`:

```ts
/**
 * Theme preference, kept out of React so it can be read before first paint
 * and tested without rendering.
 *
 * "system" deliberately leaves the root element unstamped: tokens.css guards
 * its dark block as `:root:not([data-theme='light'])` inside a
 * prefers-color-scheme query, so an absent attribute is what lets the OS
 * setting through.
 */
export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'kathapp.theme';

const PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

function isPreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (PREFERENCES as readonly string[]).includes(value);
}

export function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

export function storePreference(pref: ThemePreference): void {
  try {
    if (pref === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    }
  } catch {
    // A viewer who blocks storage still gets the theme for this session.
  }
}

export function applyPreference(pref: ThemePreference): void {
  const root = document.documentElement;
  if (pref === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', pref);
  }
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS, alle bisherigen Tests weiterhin grün

- [ ] **Step 5: Gegenprobe**

Ersetze in `readStoredPreference` den Rückgabewert `isPreference(raw) ? raw : 'system'` durch `(raw as ThemePreference) ?? 'system'`.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `ignores a value that is not a known preference`. Danach zurücknehmen und erneut grün prüfen.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/theme.ts apps/web/test/theme.spec.ts
git commit -m "feat(web): theme preference logic, fail-safe on blocked storage"
```

---

## Task 2: Typografie-Tokens und ihre Anbindung

**Files:**
- Modify: `apps/web/src/styles/tokens.css`
- Modify: `apps/web/src/styles/global.css`
- Modify: `apps/web/tailwind.config.js`
- Test: `apps/web/test/tokens.spec.ts`

**Interfaces:**
- Consumes: nichts
- Produces: die Tailwind-Klassen `text-display`, `leading-prose`, `leading-tight`, `max-w-measure`, `tracking-label`

**Warum ein Test für CSS:** Ein Token, das in `tokens.css` steht, aber nicht in `tailwind.config.js` angebunden ist, fällt stillschweigend durch — die Klasse existiert dann einfach nicht und die Seite sieht falsch aus, ohne dass irgendetwas bricht. Genau diese Drift prüft der Test.

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/tokens.spec.ts`:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../tailwind.config.js';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '../src/styles/tokens.css'), 'utf8');

function declaredTokens(prefix: string): string[] {
  const pattern = new RegExp(`--${prefix}-([a-z0-9-]+)\\s*:`, 'g');
  return [...new Set([...css.matchAll(pattern)].map((m) => m[1]))];
}

function wiredValues(group: Record<string, unknown> | undefined): string[] {
  return Object.values(group ?? {}).filter(
    (v): v is string => typeof v === 'string',
  );
}

describe('design tokens', () => {
  it('lets the OS setting reach the dark theme', () => {
    // Without a prefers-color-scheme block the "system" preference is a dead
    // option: tokens.css would only ever go dark for an explicit choice.
    expect(css).toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
    expect(css).toContain(":root:not([data-theme='light'])");
  });

  it('keeps both dark blocks carrying the same tokens', () => {
    // The dark values are declared twice, once per selector. If one gains a
    // token the other lacks, one route into dark mode renders half-themed.
    const blocks = [...css.matchAll(/\{([^{}]*--color-bg[^{}]*)\}/g)]
      .map((m) => m[1])
      .filter((body) => body.includes('#0f1419'));
    expect(blocks.length).toBe(2);
    const names = blocks.map(
      (body) => [...body.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]).sort().join(','),
    );
    expect(names[0]).toBe(names[1]);
  });

  it('declares the typography tokens the layout relies on', () => {
    for (const name of ['display']) {
      expect(declaredTokens('text')).toContain(name);
    }
    expect(declaredTokens('leading')).toEqual(
      expect.arrayContaining(['prose', 'tight']),
    );
    expect(css).toContain('--measure:');
    expect(css).toContain('--tracking-label:');
  });

  it('wires every declared text token into tailwind', () => {
    const wired = wiredValues(
      config.theme?.extend?.fontSize as Record<string, unknown>,
    ).join(' ');
    for (const name of declaredTokens('text')) {
      expect(wired).toContain(`--text-${name}`);
    }
  });

  it('wires every declared leading token into tailwind', () => {
    const wired = wiredValues(
      config.theme?.extend?.lineHeight as Record<string, unknown>,
    ).join(' ');
    for (const name of declaredTokens('leading')) {
      expect(wired).toContain(`--leading-${name}`);
    }
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL, weil weder `--text-display` noch `--leading-prose` existieren

- [ ] **Step 3: Minimale Umsetzung**

In `apps/web/src/styles/tokens.css`, im `:root`-Block direkt hinter `--text-3xl`:

```css
  --text-display: 2.5rem;

  --leading-tight: 1.12;
  --leading-prose: 1.68;

  /* Zeilenlänge für Fließtext; alles darüber liest sich schlecht. */
  --measure: 66ch;

  --tracking-label: 0.16em;
```

In `apps/web/src/styles/tokens.css` **vor** dem vorhandenen `[data-theme='dark']`-Block einfügen. Ohne diesen Block bleibt die Systemeinstellung wirkungslos, weil die Datei bisher nur die ausdrückliche Wahl kennt:

```css
/* Betriebssystem-Einstellung. Die :not()-Bedingung sorgt dafür, dass eine
   ausdrückliche Wahl "hell" ein dunkles Betriebssystem schlägt. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-bg: #0f1419;
    --color-surface: #1a2332;
    --color-text: #f2f4f8;
    --color-text-muted: #9aa7b8;
    --color-accent: #c9a227;
    --color-focus: #5b9fd4;
    --color-border: #2c3a4d;
    --color-danger: #d64545;
    --color-success: #51cf66;
    --color-warning: #fcc419;

    --elev-0: none;
    --elev-1: 0 1px 3px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.35);
  }
}
```

In `apps/web/src/styles/global.css`, ans Ende:

```css
/* Die Vorgaben erlauben Bewegung nur bei Fokus und Hover — und auch die
   nicht, wenn der Nutzer sie abbestellt hat. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

In `apps/web/tailwind.config.js`, innerhalb von `theme.extend`:

```js
      lineHeight: {
        tight: 'var(--leading-tight)',
        prose: 'var(--leading-prose)',
      },
      letterSpacing: {
        label: 'var(--tracking-label)',
      },
      maxWidth: {
        measure: 'var(--measure)',
      },
```

und in der vorhandenen `fontSize`-Gruppe ergänzen:

```js
        display: 'var(--text-display)',
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web && npm run build -w @kathapp/web`
Expected: PASS, Build grün

- [ ] **Step 5: Gegenprobe**

Zwei Rücknahmen, einzeln:

1. Entferne `display: 'var(--text-display)'` aus der `fontSize`-Gruppe.
   Expected: FAIL bei `wires every declared text token into tailwind`.
2. Entferne den neuen `@media (prefers-color-scheme: dark)`-Block wieder.
   Expected: FAIL bei `lets the OS setting reach the dark theme`.

Run jeweils: `npm test -w @kathapp/web`. Danach beides zurücknehmen und grün prüfen.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/styles/tokens.css apps/web/src/styles/global.css apps/web/tailwind.config.js apps/web/test/tokens.spec.ts
git commit -m "feat(web): typography tokens, with a guard against tailwind drift"
```

---

## Task 3: ThemeToggle und Einbau in beide Shells

**Files:**
- Create: `apps/web/src/components/ThemeToggle.tsx`
- Create: `apps/web/test/components/ThemeToggle.spec.tsx`
- Modify: `apps/web/package.json` (Abhängigkeit)
- Modify: `apps/web/src/i18n.ts`
- Modify: `apps/web/src/layouts/PublicShell.tsx`
- Modify: `apps/web/src/layouts/AdminShell.tsx`

**Interfaces:**
- Consumes: `ThemePreference`, `readStoredPreference`, `storePreference`, `applyPreference` aus Task 1
- Produces: `<ThemeToggle />`, ohne Props

- [ ] **Step 1: Abhängigkeit installieren**

```bash
npm install -D -w @kathapp/web @testing-library/react@^16.0.0
```

`@testing-library/react` steht unter MIT und ist damit GPL-3.0-kompatibel. jsdom ist bereits eingerichtet.

- [ ] **Step 2: Den fehlschlagenden Test schreiben**

`apps/web/test/components/ThemeToggle.spec.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { THEME_STORAGE_KEY } from '../../src/lib/theme';
import '../../src/i18n';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(cleanup);

  it('starts on the system setting when nothing was chosen', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button').getAttribute('data-preference')).toBe(
      'system',
    );
  });

  it('applies a stored choice on mount', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('cycles system to light to dark and back', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button.getAttribute('data-preference')).toBe('light');
    fireEvent.click(button);
    expect(button.getAttribute('data-preference')).toBe('dark');
    fireEvent.click(button);
    expect(button.getAttribute('data-preference')).toBe('system');
  });

  it('persists an explicit choice', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('carries an accessible name so the control is not a bare icon', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/ThemeToggle`

- [ ] **Step 4: Übersetzungsschlüssel ergänzen**

In `apps/web/src/i18n.ts`, im deutschen `common`-Namensraum:

```js
    theme: {
      label: 'Farbschema',
      system: 'Systemeinstellung',
      light: 'Hell',
      dark: 'Dunkel',
    },
```

und im englischen `common`-Namensraum:

```js
    theme: {
      label: 'Colour scheme',
      system: 'System setting',
      light: 'Light',
      dark: 'Dark',
    },
```

- [ ] **Step 5: Minimale Umsetzung**

`apps/web/src/components/ThemeToggle.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyPreference,
  readStoredPreference,
  storePreference,
  type ThemePreference,
} from '../lib/theme';

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

export function ThemeToggle() {
  const { t } = useTranslation('common');
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const stored = readStoredPreference();
    setPreference(stored);
    applyPreference(stored);
  }, []);

  function advance() {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setPreference(next);
    storePreference(next);
    applyPreference(next);
  }

  return (
    <button
      type="button"
      onClick={advance}
      data-preference={preference}
      aria-label={`${t('theme.label')}: ${t(`theme.${preference}`)}`}
      className="rounded-sm border border-border px-2 py-1 text-xs text-muted hover:text-text"
    >
      {t(`theme.${preference}`)}
    </button>
  );
}
```

- [ ] **Step 6: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 7: In beide Shells einbauen**

In `apps/web/src/layouts/PublicShell.tsx` und `apps/web/src/layouts/AdminShell.tsx` den Umschalter in die rechte Seite der Kopfzeile setzen, neben die vorhandene Anmelde- beziehungsweise Nutzeranzeige:

```tsx
import { ThemeToggle } from '../components/ThemeToggle';
```

```tsx
<ThemeToggle />
```

Im selben Zug die Wortmarke auf die Serifenschrift umstellen: `font-serif text-xl` statt der bisherigen serifenlosen Auszeichnung.

- [ ] **Step 8: Sichtprüfung**

```bash
npm run dev:web
```

Prüfen unter `http://localhost:5173/de` und `http://localhost:5173/admin/de`: der Umschalter durchläuft alle drei Zustände, das Dunkelschema greift sichtbar, die Wahl überlebt einen Neuladen der Seite, und bei Systemeinstellung folgt die Seite dem Betriebssystem — dafür einmal das Farbschema des Betriebssystems umstellen, während die Seite offen ist.

- [ ] **Step 9: Alle Gates und Commit**

```bash
npm run lint && npm run typecheck && npm test && npm run build
git add apps/web/src/components apps/web/test/components apps/web/src/i18n.ts apps/web/src/layouts apps/web/package.json package-lock.json
git commit -m "feat(web): reachable dark theme, defined since day one and never wired up"
```

---

## Task 4: Button

**Files:**
- Create: `apps/web/src/components/Button.tsx`
- Create: `apps/web/test/components/Button.spec.tsx`

**Interfaces:**
- Consumes: nichts
- Produces: `<Button variant?: 'primary' | 'secondary' | 'quiet'; busy?: boolean; ...ButtonHTMLAttributes>`

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/Button.spec.tsx`:

```tsx
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../../src/components/Button';

describe('Button', () => {
  afterEach(cleanup);

  it('renders its label', () => {
    render(<Button>Suchen</Button>);
    expect(screen.getByRole('button').textContent).toBe('Suchen');
  });

  it('defaults to type button so it cannot submit a form by accident', () => {
    render(<Button>Suchen</Button>);
    expect(screen.getByRole('button')).toHaveProperty('type', 'button');
  });

  it('honours an explicit submit type', () => {
    render(<Button type="submit">Einreichen</Button>);
    expect(screen.getByRole('button')).toHaveProperty('type', 'submit');
  });

  it('is disabled while busy, so a slow request cannot be sent twice', () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Einreichen
      </Button>,
    );
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('announces the busy state to assistive technology', () => {
    render(<Button busy>Einreichen</Button>);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('stays clickable when it is not busy', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Suchen</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/Button`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:brightness-95',
  secondary: 'border border-border bg-surface text-text hover:border-muted',
  quiet: 'text-muted hover:text-text',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Disables the control and marks it busy while a request is in flight. */
  busy?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  busy = false,
  disabled,
  type,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type ?? 'button'}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`rounded-sm px-3 py-2 text-sm font-medium transition-[filter,color,border-color] disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Gegenprobe**

Ändere `disabled={disabled || busy}` in `disabled={disabled}`.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `is disabled while busy`. Danach zurücknehmen.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Button.tsx apps/web/test/components/Button.spec.tsx
git commit -m "feat(web): Button component"
```

---

## Task 5: Field

**Files:**
- Create: `apps/web/src/components/Field.tsx`
- Create: `apps/web/test/components/Field.spec.tsx`

**Interfaces:**
- Consumes: nichts
- Produces: `<TextField />`, `<TextAreaField />`, `<SelectField />`, jeweils mit `label: string`, `hint?: string`, `id?: string`

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/Field.spec.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SelectField, TextAreaField, TextField } from '../../src/components/Field';

describe('TextField', () => {
  afterEach(cleanup);

  it('links the label to the control, so clicking the label focuses it', () => {
    render(<TextField label="Name / Titel" />);
    expect(screen.getByLabelText('Name / Titel')).toBeDefined();
  });

  it('gives two fields on one page distinct ids', () => {
    render(
      <>
        <TextField label="Erstes" />
        <TextField label="Zweites" />
      </>,
    );
    const first = screen.getByLabelText('Erstes');
    const second = screen.getByLabelText('Zweites');
    expect(first.id).not.toBe(second.id);
  });

  it('honours an explicit id', () => {
    render(<TextField label="Suche" id="search-q" />);
    expect(screen.getByLabelText('Suche').id).toBe('search-q');
  });

  it('announces a hint through aria-describedby', () => {
    render(<TextField label="Content-Locale" hint="Beliebiges Sprachkürzel" />);
    const control = screen.getByLabelText('Content-Locale');
    const describedBy = control.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      'Beliebiges Sprachkürzel',
    );
  });
});

describe('TextAreaField', () => {
  afterEach(cleanup);

  it('links its label like the text field does', () => {
    render(<TextAreaField label="Kurzbio" />);
    expect(screen.getByLabelText('Kurzbio').tagName).toBe('TEXTAREA');
  });
});

describe('SelectField', () => {
  afterEach(cleanup);

  it('links its label and renders its options', () => {
    render(
      <SelectField label="Entitätstyp" defaultValue="saint">
        <option value="saint">Heiliger</option>
        <option value="miracle">Wunder</option>
      </SelectField>,
    );
    const select = screen.getByLabelText('Entitätstyp') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(select.options.length).toBe(2);
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/Field`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/Field.tsx`:

```tsx
import { useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const CONTROL =
  'w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-text';

function useFieldIds(explicit?: string) {
  const generated = useId();
  const id = explicit ?? `field-${generated}`;
  return { id, hintId: `${id}-hint` };
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-text">
      {children}
    </label>
  );
}

function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} className="text-xs text-muted">
      {children}
    </span>
  );
}

interface Shared {
  label: string;
  hint?: string;
}

export function TextField({
  label,
  hint,
  id,
  ...rest
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={ids.id}>{label}</Label>
      <input
        {...rest}
        id={ids.id}
        aria-describedby={hint ? ids.hintId : undefined}
        className={CONTROL}
      />
      {hint ? <Hint id={ids.hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  id,
  ...rest
}: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={ids.id}>{label}</Label>
      <textarea
        {...rest}
        id={ids.id}
        aria-describedby={hint ? ids.hintId : undefined}
        className={CONTROL}
      />
      {hint ? <Hint id={ids.hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  id,
  children,
  ...rest
}: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={ids.id}>{label}</Label>
      <select
        {...rest}
        id={ids.id}
        aria-describedby={hint ? ids.hintId : undefined}
        className={CONTROL}
      >
        {children}
      </select>
      {hint ? <Hint id={ids.hintId}>{hint}</Hint> : null}
    </div>
  );
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Gegenprobe**

Ersetze in `useFieldIds` den Aufruf `useId()` durch die feste Zeichenkette `'field'`.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `gives two fields on one page distinct ids`. Danach zurücknehmen.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Field.tsx apps/web/test/components/Field.spec.tsx
git commit -m "feat(web): Field components with label and hint wiring"
```

---

## Task 6: Banner und Ablösung der drei Vorgänger

**Files:**
- Create: `apps/web/src/components/Banner.tsx`
- Create: `apps/web/test/components/Banner.spec.tsx`
- Modify: `apps/web/src/lib/suggestionUi.tsx`

**Interfaces:**
- Consumes: nichts
- Produces: `<Banner tone: 'error' | 'denied' | 'gates'; title?: string; items?: string[]; children?: ReactNode>`

**Hintergrund:** `suggestionUi.tsx` enthält heute `AuthErrorBanner`, `GenericErrorBanner` und `GateFailureList` mit fast identischem Aufbau. Sie werden zu einem Baustein zusammengeführt; die drei alten Namen bleiben zunächst als dünne Weiterleitungen bestehen, damit dieser Task keine Seite anfassen muss.

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/Banner.spec.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Banner } from '../../src/components/Banner';

describe('Banner', () => {
  afterEach(cleanup);

  it('announces itself as an alert so a screen reader reports it', () => {
    render(<Banner tone="error">Suche fehlgeschlagen</Banner>);
    expect(screen.getByRole('alert').textContent).toContain(
      'Suche fehlgeschlagen',
    );
  });

  it('marks the tone so styling and tests can rely on it', () => {
    render(<Banner tone="denied">Keine Berechtigung</Banner>);
    expect(screen.getByRole('alert').getAttribute('data-tone')).toBe('denied');
  });

  it('lists every failed gate, so none is silently dropped', () => {
    render(
      <Banner
        tone="gates"
        title="Publish-Gates nicht erfüllt"
        items={['translation_required', 'citation_required']}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('translation_required');
    expect(alert.textContent).toContain('citation_required');
    expect(alert.querySelectorAll('li').length).toBe(2);
  });

  it('renders a title together with its children', () => {
    render(
      <Banner tone="error" title="Fehler">
        Details
      </Banner>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Fehler');
    expect(alert.textContent).toContain('Details');
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/Banner`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/Banner.tsx`:

```tsx
import type { ReactNode } from 'react';

type Tone = 'error' | 'denied' | 'gates';

const TONES: Record<Tone, string> = {
  error: 'border-danger/40 bg-danger/10 text-danger',
  denied: 'border-warning/40 bg-warning/10 text-warning',
  gates: 'border-warning/40 bg-warning/10 text-warning',
};

export interface BannerProps {
  tone: Tone;
  title?: string;
  /** Rendered as a list; used for the publish-gate codes. */
  items?: string[];
  children?: ReactNode;
}

export function Banner({ tone, title, items, children }: BannerProps) {
  return (
    <div
      role="alert"
      data-tone={tone}
      className={`rounded-sm border p-3 text-sm ${TONES[tone]}`}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? <div className={title ? 'mt-1' : undefined}>{children}</div> : null}
      {items?.length ? (
        <ul className="mt-1 list-disc pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Die drei Vorgänger zu Weiterleitungen machen**

In `apps/web/src/lib/suggestionUi.tsx` die Rümpfe von `AuthErrorBanner`, `GenericErrorBanner` und `GateFailureList` ersetzen, ohne ihre Signaturen zu ändern:

```tsx
import { Banner } from '../components/Banner';

export function AuthErrorBanner({ message }: { message: string }) {
  return <Banner tone="denied">{message}</Banner>;
}

export function GenericErrorBanner({ message }: { message: string }) {
  return <Banner tone="error">{message}</Banner>;
}
```

```tsx
export function GateFailureList({
  title,
  gates,
  labelFor,
}: {
  title: string;
  gates: PublishGateCode[];
  labelFor: (code: PublishGateCode) => string;
}) {
  return <Banner tone="gates" title={title} items={gates.map(labelFor)} />;
}
```

- [ ] **Step 6: Alle Gates**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: alles grün; keine Seite wurde angefasst, das Verhalten bleibt identisch

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/Banner.tsx apps/web/test/components/Banner.spec.tsx apps/web/src/lib/suggestionUi.tsx
git commit -m "feat(web): one Banner component behind the three ad-hoc ones"
```

---

## Task 7: Chip

**Files:**
- Create: `apps/web/src/components/Chip.tsx`
- Create: `apps/web/test/components/Chip.spec.tsx`

**Interfaces:**
- Consumes: `PublicEntityKind`, `SuggestionStatus`, `PUBLIC_ENTITY_KINDS`, `SUGGESTION_STATUSES` aus `@kathapp/shared`
- Produces: `<EntityKindChip kind={PublicEntityKind} />`, `<SuggestionStatusChip status={SuggestionStatus} />`

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/Chip.spec.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PUBLIC_ENTITY_KINDS, SUGGESTION_STATUSES } from '@kathapp/shared';
import { EntityKindChip, SuggestionStatusChip } from '../../src/components/Chip';
import '../../src/i18n';

describe('EntityKindChip', () => {
  afterEach(cleanup);

  it('covers every public entity kind, so a new one cannot fall through', () => {
    for (const kind of PUBLIC_ENTITY_KINDS) {
      cleanup();
      render(<EntityKindChip kind={kind} />);
      const chip = screen.getByTestId('chip');
      expect(chip.getAttribute('data-kind')).toBe(kind);
      expect(chip.textContent?.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('SuggestionStatusChip', () => {
  afterEach(cleanup);

  it('covers every suggestion status', () => {
    for (const status of SUGGESTION_STATUSES) {
      cleanup();
      render(<SuggestionStatusChip status={status} />);
      const chip = screen.getByTestId('chip');
      expect(chip.getAttribute('data-status')).toBe(status);
      expect(chip.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('separates resolved statuses from open ones', () => {
    render(<SuggestionStatusChip status="accepted" />);
    expect(screen.getByTestId('chip').getAttribute('data-resolved')).toBe('true');
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/Chip`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/Chip.tsx`:

```tsx
import { useTranslation } from 'react-i18next';
import type { PublicEntityKind, SuggestionStatus } from '@kathapp/shared';

const BASE =
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs uppercase tracking-label';

export function EntityKindChip({ kind }: { kind: PublicEntityKind }) {
  const { t } = useTranslation('entity');
  return (
    <span
      data-testid="chip"
      data-kind={kind}
      className={`${BASE} text-muted`}
    >
      {t(`chips.${kind}`)}
    </span>
  );
}

const RESOLVED: readonly SuggestionStatus[] = ['accepted', 'rejected'];

export function SuggestionStatusChip({ status }: { status: SuggestionStatus }) {
  const resolved = RESOLVED.includes(status);
  return (
    <span
      data-testid="chip"
      data-status={status}
      data-resolved={resolved ? 'true' : 'false'}
      className={`${BASE} ${resolved ? 'text-muted' : 'text-accent'}`}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/Chip.tsx apps/web/test/components/Chip.spec.tsx
git commit -m "feat(web): Chip components for entity kind and suggestion status"
```

---

## Task 8: Typografie-Bausteine und Sammel-Export

**Files:**
- Create: `apps/web/src/components/Typography.tsx`
- Create: `apps/web/src/components/index.ts`
- Create: `apps/web/test/components/Typography.spec.tsx`

**Interfaces:**
- Consumes: nichts
- Produces: `<Prose />`, `<SectionRule label={string} />`, `<PageHeader kicker?, title, byline? />`, `<EmptyState />`; `index.ts` exportiert alle Bausteine aus den Tasks 3 bis 8

- [ ] **Step 1: Den fehlschlagenden Test schreiben**

`apps/web/test/components/Typography.spec.tsx`:

```tsx
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
  EmptyState,
  PageHeader,
  Prose,
  SectionRule,
} from '../../src/components/Typography';

describe('PageHeader', () => {
  afterEach(cleanup);

  it('renders the title as the page heading', () => {
    render(<PageHeader title="Etymologiae" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Etymologiae',
    );
  });

  it('renders kicker and byline when given', () => {
    render(<PageHeader kicker="Quelle" title="Etymologiae" byline="Latein" />);
    expect(screen.getByText('Quelle')).toBeDefined();
    expect(screen.getByText('Latein')).toBeDefined();
  });

  it('omits the kicker element entirely when none is given', () => {
    const { container } = render(<PageHeader title="Etymologiae" />);
    expect(container.querySelector('[data-slot="kicker"]')).toBeNull();
  });
});

describe('SectionRule', () => {
  afterEach(cleanup);

  it('renders its label as a level-two heading, so the page keeps an outline', () => {
    render(<SectionRule label="Belegstellen" />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Belegstellen',
    );
  });
});

describe('Prose', () => {
  afterEach(cleanup);

  it('caps the line length, which is the whole point of the component', () => {
    const { container } = render(<Prose>Text</Prose>);
    expect(container.firstElementChild?.className).toContain('max-w-measure');
  });
});

describe('EmptyState', () => {
  afterEach(cleanup);

  it('shows its message without claiming to be an error', () => {
    render(<EmptyState message="Keine veröffentlichten Treffer." />);
    expect(screen.getByText('Keine veröffentlichten Treffer.')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
```

- [ ] **Step 2: Test laufen lassen und Fehlschlag prüfen**

Run: `npm test -w @kathapp/web`
Expected: FAIL mit `Failed to load url ../../src/components/Typography`

- [ ] **Step 3: Minimale Umsetzung**

`apps/web/src/components/Typography.tsx`:

```tsx
import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  byline,
}: {
  kicker?: string;
  title: string;
  byline?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-5">
      {kicker ? (
        <p
          data-slot="kicker"
          className="text-xs uppercase tracking-label text-accent"
        >
          {kicker}
        </p>
      ) : null}
      <h1 className="text-balance font-serif text-display leading-tight">
        {title}
      </h1>
      {byline ? (
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          {byline}
        </p>
      ) : null}
    </header>
  );
}

/** A labelled hairline. The label is a real heading so the outline survives. */
export function SectionRule({ label }: { label: string }) {
  return (
    <div className="mt-8 mb-4 flex items-center gap-3">
      <h2 className="whitespace-nowrap text-xs uppercase tracking-label text-muted">
        {label}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-measure font-serif text-base leading-prose">
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-muted">{message}</p>;
}
```

`apps/web/src/components/index.ts`:

```ts
export { Banner, type BannerProps } from './Banner';
export { Button, type ButtonProps } from './Button';
export { EntityKindChip, SuggestionStatusChip } from './Chip';
export { SelectField, TextAreaField, TextField } from './Field';
export { ThemeToggle } from './ThemeToggle';
export { EmptyState, PageHeader, Prose, SectionRule } from './Typography';
```

- [ ] **Step 4: Test laufen lassen und Erfolg prüfen**

Run: `npm test -w @kathapp/web`
Expected: PASS

- [ ] **Step 5: Gegenprobe**

Entferne `max-w-measure` aus `Prose`.
Run: `npm test -w @kathapp/web`
Expected: FAIL bei `caps the line length`. Danach zurücknehmen.

- [ ] **Step 6: Alle Gates und Commit**

```bash
npm run lint && npm run typecheck && npm test && npm run build
git add apps/web/src/components apps/web/test/components
git commit -m "feat(web): typography components and the component barrel"
```

---

## Abschluss

- [ ] **Vollständiger Durchlauf auf dem Branch**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Erwartet: alle Gates grün, Rückgabewert 0. Die Testzahl steigt von 104 auf ungefähr 145.

- [ ] **Sichtprüfung beider Shells**

```bash
docker compose up -d && npm run dev:api
npm run dev:web
```

Prüfen: Umschalter in öffentlicher und Admin-Ansicht, hell und dunkel, schmal und breit. Dazu der von den Vorgaben verlangte Kontrastnachweis nach WCAG AA für Text auf Grund und für die Gold-Akzente, in beiden Themes. Die Seiten selbst sehen noch fast unverändert aus — das ist richtig, ihr Umbau ist Schritt 3 bis 5.

- [ ] **PR öffnen**

Zwei PRs, entlang der beiden Schritte des Entwurfs: Tasks 1 bis 3 als „Fundament", Tasks 4 bis 8 als „Komponentenschicht". Im PR-Text die Sichtprüfung benennen, nicht behaupten, und die Lizenz von `@testing-library/react` nennen.

## Was danach kommt

Zwei Bausteine aus dem Entwurf fehlen hier bewusst: `Citation` und `RelationChip`. Beide haben nur einen Verwendungsort, die Detailseite, und ihre Form ergibt sich aus deren Umbau. Sie auf Vorrat zu bauen hieße, sie zweimal zu bauen.

Schritt 3 bis 5 des Entwurfs bekommen einen eigenen Plan, sobald dieser hier steht: öffentliche Leseflächen, Vorschlagsweg, Admin-Aufteilung. Der Grund für den Schnitt ist nicht Bequemlichkeit — die tatsächliche Form der Bausteine kennt man erst, wenn sie einmal gebaut und einmal benutzt wurden. Ein Plan für die Seitenumbauten, der heute geschrieben würde, müsste morgen umgeschrieben werden.
