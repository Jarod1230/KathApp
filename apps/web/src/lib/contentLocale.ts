import type { ContentLocale, UiLocale } from '@kathapp/shared';

/** Content-Locale fallback: requested → de → en → first available (stub). */
export function resolveContentLocale(
  requested: string | null | undefined,
  uiLocale: UiLocale,
  available: readonly ContentLocale[] = ['de', 'en'],
): ContentLocale {
  const chain = [
    requested,
    uiLocale,
    'de',
    'en',
    ...available,
  ].filter((v): v is string => Boolean(v));

  for (const locale of chain) {
    if (available.includes(locale)) return locale;
  }
  return available[0] ?? 'de';
}

export function contentLocaleFromSearch(
  search: Record<string, unknown> | undefined,
): string | null {
  const raw = search?.contentLocale;
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}
