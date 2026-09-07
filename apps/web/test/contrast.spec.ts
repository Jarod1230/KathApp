import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '../src/styles/tokens.css'), 'utf8');

/**
 * Contrast is checkable arithmetic, so check it rather than assert it in a
 * review. The gold accent reached only 2.22:1 on the light ground before this
 * guard existed, on both the wordmark and every primary button.
 */
function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/** Colour tokens from one block of the stylesheet, keyed by token name. */
function palette(blockStart: string): Record<string, string> {
  const from = css.indexOf(blockStart);
  if (from === -1) throw new Error(`block not found: ${blockStart}`);
  const open = css.indexOf('{', from);
  const body = css.slice(open, css.indexOf('}', open));
  return Object.fromEntries(
    [...body.matchAll(/(--color-[a-z-]+)\s*:\s*(#[0-9a-f]{6})/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}

const light = palette(':root {');
const dark = palette("[data-theme='dark']");

// [foreground token, background token, minimum ratio]
const PAIRS: [string, string, number][] = [
  ['--color-text', '--color-bg', 4.5],
  ['--color-text', '--color-surface', 4.5],
  ['--color-text-muted', '--color-bg', 4.5],
  ['--color-text-muted', '--color-surface', 4.5],
  // Gold as text: the wordmark and the type mark above a title.
  ['--color-accent-text', '--color-bg', 4.5],
  // Text sitting on a gold fill, as on a primary button.
  ['--color-on-accent', '--color-accent', 4.5],
];

describe.each([
  ['light', light],
  ['dark', dark],
])('contrast in the %s theme', (_name, tokens) => {
  it.each(PAIRS)('%s on %s reaches AA', (fg, bg, minimum) => {
    expect(tokens[fg], `${fg} is not declared`).toBeDefined();
    expect(tokens[bg], `${bg} is not declared`).toBeDefined();
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(minimum);
  });
});

/** Recursive walk rather than fs.globSync, which needs Node 22; CI runs 20. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

describe('gold is never used as a plain text colour', () => {
  it('finds no `text-accent` outside the accessible variant', () => {
    // `--color-accent` is a fill and rule colour. As text on the light ground
    // it reaches 2.22:1, so every text use must take `--color-accent-text`.
    const offenders = sourceFiles(resolve(here, '../src'))
      .filter((file) => /text-accent(?![-\w])/.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(file.indexOf('/src/')));
    expect(offenders).toEqual([]);
  });

  it('never puts a light text colour on a gold fill', () => {
    // bg-accent with text-bg reaches 2.22:1. The fill is the same colour in
    // both themes, so its label must be the fixed dark `text-on-accent`.
    const offenders = sourceFiles(resolve(here, '../src'))
      .filter((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .some(
            (line) =>
              line.includes('bg-accent') &&
              /\btext-(bg|white)\b/.test(line),
          ),
      )
      .map((file) => file.slice(file.indexOf('/src/')));
    expect(offenders).toEqual([]);
  });
});
