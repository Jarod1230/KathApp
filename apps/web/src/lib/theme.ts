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
  return (
    typeof value === 'string' &&
    (PREFERENCES as readonly string[]).includes(value)
  );
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
