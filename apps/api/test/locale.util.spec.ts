import { describe, expect, it } from 'vitest';
import {
  normalizeContentLocale,
  pickLocaleValue,
  type TranslationRow,
} from '../src/v1/locale.util';

const rows = (
  ...entries: [locale: string, field: string, value: string][]
): TranslationRow[] =>
  entries.map(([locale, field, value]) => ({ locale, field, value }));

describe('pickLocaleValue', () => {
  it('returns the value for the requested locale when it exists', () => {
    const result = pickLocaleValue(
      rows(['de', 'name', 'Deutsch'], ['en', 'name', 'English']),
      'name',
      'en',
    );

    expect(result).toEqual({ value: 'English', locale: 'en' });
  });

  it('prefers the requested locale over de even when de comes first', () => {
    const result = pickLocaleValue(
      rows(['de', 'name', 'Deutsch'], ['la', 'name', 'Latinum']),
      'name',
      'la',
    );

    expect(result).toEqual({ value: 'Latinum', locale: 'la' });
  });

  it('falls back to de when the requested locale is missing', () => {
    // 'it' comes first on purpose: a naive "just take the first row"
    // implementation would return Italiano and fail this test.
    const result = pickLocaleValue(
      rows(['it', 'name', 'Italiano'], ['en', 'name', 'English'], ['de', 'name', 'Deutsch']),
      'name',
      'la',
    );

    expect(result).toEqual({ value: 'Deutsch', locale: 'de' });
  });

  it('falls back to en when neither the requested locale nor de exist', () => {
    const result = pickLocaleValue(
      rows(['it', 'name', 'Italiano'], ['en', 'name', 'English']),
      'name',
      'la',
    );

    expect(result).toEqual({ value: 'English', locale: 'en' });
  });

  it('falls back to the first available row when the whole chain misses', () => {
    const result = pickLocaleValue(
      rows(['it', 'name', 'Italiano'], ['la', 'name', 'Latinum']),
      'name',
      'fr',
    );

    expect(result).toEqual({ value: 'Italiano', locale: 'it' });
  });

  it('reports the locale actually used so callers can see the fallback', () => {
    const result = pickLocaleValue(rows(['la', 'name', 'Latinum']), 'name', 'de');

    expect(result?.locale).toBe('la');
  });

  it('ignores rows belonging to a different field', () => {
    const result = pickLocaleValue(
      rows(['de', 'shortBio', 'Biografie'], ['de', 'name', 'Deutsch']),
      'name',
      'de',
    );

    expect(result).toEqual({ value: 'Deutsch', locale: 'de' });
  });

  it('returns null when the field has no rows at all', () => {
    const result = pickLocaleValue(rows(['de', 'shortBio', 'x']), 'name', 'de');

    expect(result).toBeNull();
  });
});

describe('normalizeContentLocale', () => {
  it('defaults to de when no locale is given', () => {
    expect(normalizeContentLocale(undefined)).toBe('de');
  });

  it('defaults to de for a whitespace-only locale', () => {
    expect(normalizeContentLocale('   ')).toBe('de');
  });

  it('trims surrounding whitespace from a given locale', () => {
    expect(normalizeContentLocale('  la  ')).toBe('la');
  });
});
