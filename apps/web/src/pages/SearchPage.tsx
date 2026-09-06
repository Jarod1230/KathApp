import { Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  contentLocaleFromSearch,
  resolveContentLocale,
} from '../lib/contentLocale';

export function SearchPage() {
  const { t, i18n } = useTranslation('entity');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const q = typeof search.q === 'string' ? search.q : '';
  const type = typeof search.type === 'string' ? search.type : '';
  const contentLocale = resolveContentLocale(
    contentLocaleFromSearch(search),
    locale,
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('search.title')}</h1>
      <p className="text-muted">{t('search.stub')}</p>
      <dl className="grid gap-2 text-sm text-muted">
        <div>
          <dt className="font-medium text-text">{t('search.q')}</dt>
          <dd>{q || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-text">{t('search.type')}</dt>
          <dd>{type || '—'}</dd>
        </div>
        <div>
          <dt className="font-medium text-text">{t('search.contentLocale')}</dt>
          <dd>{contentLocale}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted">{t('search.exampleHint')}</p>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            to="/$locale/saints/$id"
            params={{ locale, id: 'stub' }}
            search={{ contentLocale }}
            className="rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-elev-0"
          >
            {t('chips.saint')}
          </Link>
        </li>
        <li>
          <Link
            to="/$locale/miracles/$id"
            params={{ locale, id: 'stub' }}
            search={{ contentLocale }}
            className="rounded-md border border-border bg-surface px-3 py-1 text-sm"
          >
            {t('chips.miracle')}
          </Link>
        </li>
        <li>
          <Link
            to="/$locale/sources/$id"
            params={{ locale, id: 'stub' }}
            search={{ contentLocale }}
            className="rounded-md border border-border bg-surface px-3 py-1 text-sm"
          >
            {t('chips.source')}
          </Link>
        </li>
      </ul>
    </section>
  );
}
