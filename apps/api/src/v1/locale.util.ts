import type { ContentLocale } from '@kathapp/shared';

export type TranslationRow = {
  locale: string;
  field: string;
  value: string;
};

/** Content-locale fallback: requested → de → en → first available. */
export function pickLocaleValue(
  rows: TranslationRow[],
  field: string,
  requested: ContentLocale,
): { value: string; locale: ContentLocale } | null {
  const forField = rows.filter((r) => r.field === field);
  if (forField.length === 0) return null;

  const chain = [requested, 'de', 'en'];
  for (const locale of chain) {
    const hit = forField.find((r) => r.locale === locale);
    if (hit) return { value: hit.value, locale: hit.locale };
  }
  return { value: forField[0].value, locale: forField[0].locale };
}

export function normalizeContentLocale(raw: string | undefined): ContentLocale {
  const trimmed = (raw ?? '').trim();
  return trimmed.length > 0 ? trimmed : 'de';
}
