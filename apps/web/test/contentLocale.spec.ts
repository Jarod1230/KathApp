import { describe, expect, it } from 'vitest';
import {
  contentLocaleFromSearch,
  resolveContentLocale,
} from '../src/lib/contentLocale';

describe('resolveContentLocale', () => {
  it('honours an explicitly requested locale that is available', () => {
    expect(resolveContentLocale('en', 'de')).toBe('en');
  });

  it('falls back to the UI locale when nothing is requested', () => {
    expect(resolveContentLocale(null, 'en')).toBe('en');
  });

  it('ignores a requested locale that is not available', () => {
    expect(resolveContentLocale('la', 'en')).toBe('en');
  });

  it('falls back to de when the UI locale is not an available content locale', () => {
    expect(resolveContentLocale(null, 'en', ['de', 'la'])).toBe('de');
  });

  it('falls back to the first available locale when the whole chain misses', () => {
    expect(resolveContentLocale('fr', 'en', ['la', 'it'])).toBe('la');
  });

  it('returns de when no content locales are available at all', () => {
    expect(resolveContentLocale('fr', 'en', [])).toBe('de');
  });
});

describe('contentLocaleFromSearch', () => {
  it('reads a string contentLocale out of the search params', () => {
    expect(contentLocaleFromSearch({ contentLocale: 'la' })).toBe('la');
  });

  it('returns null for an empty contentLocale', () => {
    expect(contentLocaleFromSearch({ contentLocale: '' })).toBeNull();
  });

  it('returns null for a non-string contentLocale', () => {
    expect(contentLocaleFromSearch({ contentLocale: 42 })).toBeNull();
  });

  it('returns null when there are no search params', () => {
    expect(contentLocaleFromSearch(undefined)).toBeNull();
  });
});
