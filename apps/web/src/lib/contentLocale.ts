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

/**
 * Content locales are free-form in Contract-v1, so the suggestion form takes
 * one as text rather than a fixed de/en choice. Latin and other source
 * languages are the reason the field exists at all; a select of two options
 * made them unsubmittable.
 */
export function sanitizeContentLocale(
  raw: string,
  fallback: ContentLocale,
): ContentLocale {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
