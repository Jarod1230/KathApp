import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8');

const css = read('../src/styles/tokens.css');
// Read as text rather than imported: the config is plain JS with no type
// declaration, and comparing two files for drift is symmetrical this way.
const tailwind = read('../tailwind.config.js');

function declaredTokens(prefix: string): string[] {
  const pattern = new RegExp(`--${prefix}-([a-z0-9-]+)\\s*:`, 'g');
  return [...new Set([...css.matchAll(pattern)].map((m) => m[1]))];
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
    const names = blocks.map((body) =>
      [...body.matchAll(/(--[a-z0-9-]+)\s*:/g)]
        .map((m) => m[1])
        .sort()
        .join(','),
    );
    expect(names[0]).toBe(names[1]);
  });

  it('declares the typography tokens the layout relies on', () => {
    expect(declaredTokens('text')).toContain('display');
    expect(declaredTokens('leading')).toEqual(
      expect.arrayContaining(['prose', 'tight']),
    );
    expect(css).toContain('--measure:');
    expect(css).toContain('--tracking-label:');
  });

  it('wires every declared text token into tailwind', () => {
    for (const name of declaredTokens('text')) {
      expect(tailwind).toContain(`var(--text-${name})`);
    }
  });

  it('wires every declared leading token into tailwind', () => {
    for (const name of declaredTokens('leading')) {
      expect(tailwind).toContain(`var(--leading-${name})`);
    }
  });

  it('wires the measure and label tokens into tailwind', () => {
    expect(tailwind).toContain('var(--measure)');
    expect(tailwind).toContain('var(--tracking-label)');
  });
});
