import type { ReactNode } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { SearchHit } from '@kathapp/shared';
import {
  contentLocaleFromSearch,
  resolveContentLocale,
} from '../lib/contentLocale';
import { pageState } from '../lib/pagination';
import { searchEntities } from '../lib/api';

function EntityHitLink({
  hit,
  locale,
  contentLocale,
  children,
  className,
}: {
  hit: SearchHit;
  locale: string;
  contentLocale: string;
  children: ReactNode;
  className?: string;
}) {
  const params = { locale, id: hit.id };
  const search = { contentLocale };
  if (hit.entityType === 'saint') {
    return (
      <Link
        to="/$locale/saints/$id"
        params={params}
        search={search}
        className={className}
      >
        {children}
      </Link>
    );
  }
  if (hit.entityType === 'miracle') {
    return (
      <Link
        to="/$locale/miracles/$id"
        params={params}
        search={search}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/$locale/sources/$id"
      params={params}
      search={search}
      className={className}
    >
      {children}
    </Link>
  );
}

export function SearchPage() {
  const { t, i18n } = useTranslation('entity');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const q = typeof search.q === 'string' ? search.q : '';
  const type = typeof search.type === 'string' ? search.type : '';
  const offset = typeof search.offset === 'number' ? search.offset : 0;
  const contentLocale = resolveContentLocale(
    contentLocaleFromSearch(search),
    locale,
  );

  const query = useQuery({
    queryKey: ['search', q, contentLocale, type, offset],
    queryFn: () =>
      searchEntities({
        q: q || undefined,
        locale: contentLocale,
        type: type || undefined,
        offset: offset || undefined,
      }),
  });

  const items = query.data?.items ?? [];
  const paging = pageState({
    total: query.data?.total ?? 0,
    limit: query.data?.limit ?? 20,
    offset: query.data?.offset ?? offset,
  });

  const goToOffset = (nextOffset: number) => {
    void navigate({
      to: '/$locale/search',
      params: { locale },
      search: {
        q: q || undefined,
        type: type || undefined,
        offset: nextOffset || undefined,
        contentLocale,
      },
    });
  };
  const isEmptyQuery = q.trim().length === 0;
  const showEmpty =
    !query.isLoading && !query.isError && (isEmptyQuery || items.length === 0);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('search.title')}</h1>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const nextQ = String(fd.get('q') ?? '').trim();
          const nextType = String(fd.get('type') ?? '').trim();
          void navigate({
            to: '/$locale/search',
            params: { locale },
            search: {
              q: nextQ || undefined,
              type: nextType || undefined,
              offset: undefined,
              contentLocale,
            },
          });
        }}
      >
        <label className="sr-only" htmlFor="search-q">
          {t('search.q')}
        </label>
        <input
          id="search-q"
          name="q"
          defaultValue={q}
          placeholder={t('search.placeholder')}
          className="min-w-[12rem] flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
        <label className="sr-only" htmlFor="search-type">
          {t('search.type')}
        </label>
        <select
          id="search-type"
          name="type"
          defaultValue={type}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">{t('search.typeAll')}</option>
          <option value="saint">{t('chips.saint')}</option>
          <option value="miracle">{t('chips.miracle')}</option>
          <option value="source">{t('chips.source')}</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-2 text-sm text-white"
        >
          {t('search.submit')}
        </button>
      </form>

      <p className="text-sm text-muted">
        {t('search.contentLocale')}: {contentLocale}
      </p>

      {!query.isLoading && !query.isError && (query.data?.total ?? 0) > 0 && (
        <p className="text-sm text-muted" role="status">
          {t('search.range', {
            first: paging.firstShown,
            last: paging.lastShown,
            total: query.data?.total ?? 0,
          })}
        </p>
      )}

      {query.isLoading && (
        <p className="text-sm text-muted">{t('search.loading')}</p>
      )}

      {query.isError && (
        <p className="text-sm text-red-700" role="alert">
          {t('search.error')}
        </p>
      )}

      {showEmpty && (
        <p className="text-muted">
          {isEmptyQuery ? t('search.emptyPrompt') : t('search.emptyResults')}
        </p>
      )}

      {!query.isLoading && items.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {items.map((hit) => (
            <li key={`${hit.entityType}:${hit.id}`}>
              <EntityHitLink
                hit={hit}
                locale={locale}
                contentLocale={contentLocale}
                className="block px-3 py-3 hover:bg-muted/20"
              >
                <span className="text-xs uppercase tracking-wide text-muted">
                  {hit.entityType === 'saint'
                    ? t('chips.saint')
                    : hit.entityType === 'miracle'
                      ? t('chips.miracle')
                      : t('chips.source')}
                </span>
                <span className="mt-1 block font-medium">{hit.label}</span>
                {hit.snippet ? (
                  <span className="mt-1 block text-sm text-muted line-clamp-2">
                    {hit.snippet}
                  </span>
                ) : null}
              </EntityHitLink>
            </li>
          ))}
        </ul>
      )}

      {!query.isLoading && (paging.hasPrevious || paging.hasNext) && (
        <nav
          aria-label={t('search.pager')}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            disabled={!paging.hasPrevious}
            onClick={() => goToOffset(paging.previousOffset)}
            className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-40"
          >
            {t('search.previous')}
          </button>
          <span className="text-sm text-muted">
            {t('search.page', {
              page: paging.page,
              pageCount: paging.pageCount,
            })}
          </span>
          <button
            type="button"
            disabled={!paging.hasNext}
            onClick={() => goToOffset(paging.nextOffset)}
            className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-40"
          >
            {t('search.next')}
          </button>
        </nav>
      )}
    </section>
  );
}
