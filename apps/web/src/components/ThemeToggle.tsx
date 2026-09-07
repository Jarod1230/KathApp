import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyPreference,
  readStoredPreference,
  storePreference,
  type ThemePreference,
} from '../lib/theme';

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

/**
 * Cycles through system, light and dark. A three-state control rather than a
 * two-state switch, because "follow the operating system" is a real answer and
 * a plain toggle cannot express it.
 */
export function ThemeToggle() {
  const { t } = useTranslation('common');
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const stored = readStoredPreference();
    setPreference(stored);
    applyPreference(stored);
  }, []);

  function advance() {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setPreference(next);
    storePreference(next);
    applyPreference(next);
  }

  return (
    <button
      type="button"
      onClick={advance}
      data-preference={preference}
      aria-label={`${t('theme.label')}: ${t(`theme.${preference}`)}`}
      className="rounded-sm border border-border px-2 py-1 text-xs text-muted transition-colors hover:text-text"
    >
      {t(`theme.${preference}`)}
    </button>
  );
}
