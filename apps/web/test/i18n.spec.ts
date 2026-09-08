import { describe, expect, it } from 'vitest';
import i18n from '../src/i18n';

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    keys(v, prefix ? `${prefix}.${k}` : k),
  );
}

const store = () => i18n.store.data as Record<string, Record<string, unknown>>;

describe('translations', () => {
  it('carry the same keys in de and en', () => {
    const de = new Set(keys(store().de));
    const en = new Set(keys(store().en));

    expect({
      missingInEn: [...de].filter((k) => !en.has(k)),
      missingInDe: [...en].filter((k) => !de.has(k)),
    }).toEqual({ missingInEn: [], missingInDe: [] });
  });

  it('resolve the suggestion form hint in both languages', () => {
    // A key placed in the wrong namespace renders as the raw key string.
    for (const lng of ['de', 'en']) {
      const value = i18n.getFixedT(lng, 'suggest')('form.contentLocaleHint');
      expect(value).not.toBe('form.contentLocaleHint');
      expect(value.length).toBeGreaterThan(10);
    }
  });

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
});
