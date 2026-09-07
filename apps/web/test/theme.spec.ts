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
