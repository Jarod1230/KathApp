import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

/** Home IS search — shared stub for `/$locale/` and `/$locale/search`. */
export function HomeSearchPage() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-elev-1">
      <h1 className="text-2xl font-semibold">{t('nav.home')}</h1>
      <p className="text-muted">{t('contentLocaleNote')}</p>
      <label className="block space-y-2">
        <span className="text-sm text-muted">{t('nav.search')}</span>
        <input
          type="search"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text placeholder:text-muted focus:outline focus:outline-2 focus:outline-focus"
          placeholder={t('placeholder')}
          disabled
          aria-disabled="true"
        />
      </label>
      <p className="text-sm text-muted">{t('placeholder')} — no API results.</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        <li>
          <Link
            to="/$locale/saints/$id"
            params={{ locale, id: 'placeholder' }}
            className="text-accent hover:underline focus:outline focus:outline-2 focus:outline-focus"
          >
            /$locale/saints/$id
          </Link>
        </li>
        <li>
          <Link
            to="/$locale/miracles/$id"
            params={{ locale, id: 'placeholder' }}
            className="text-accent hover:underline focus:outline focus:outline-2 focus:outline-focus"
          >
            /$locale/miracles/$id
          </Link>
        </li>
        <li>
          <Link
            to="/$locale/sources/$id"
            params={{ locale, id: 'placeholder' }}
            className="text-accent hover:underline focus:outline focus:outline-2 focus:outline-focus"
          >
            /$locale/sources/$id
          </Link>
        </li>
      </ul>
    </section>
  );
}
