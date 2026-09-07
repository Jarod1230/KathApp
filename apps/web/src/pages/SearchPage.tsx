import type { FormEvent, ReactNode } from 'react';
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
import {
  Banner,
  Button,
  EmptyState,
  PageHeader,
  SelectField,
  TextField,
} from '../components';

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

  function onSubmit(e: FormEvent<HTMLFormElement>) {
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
  }

  return (
    <section className="flex flex-col gap-5">
      <PageHeader title={t('search.title')} />

      <form className="flex flex-wrap items-end gap-3" onSubmit={onSubmit}>
        <div className="min-w-[14rem] flex-1">
          <TextField
            label={t('search.q')}
            name="q"
            defaultValue={q}
            placeholder={t('search.placeholder')}
          />
        </div>
        <SelectField label={t('search.type')} name="type" defaultValue={type}>
          <option value="">{t('search.typeAll')}</option>
          <option value="saint">{t('chips.saint')}</option>
          <option value="miracle">{t('chips.miracle')}</option>
          <option value="source">{t('chips.source')}</option>
        </SelectField>
        <Button type="submit">{t('search.submit')}</Button>
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

      {query.isError && <Banner tone="error">{t('search.error')}</Banner>}

      {showEmpty && (
        <EmptyState
          message={
            isEmptyQuery ? t('search.emptyPrompt') : t('search.emptyResults')
          }
        />
      )}

      {!query.isLoading && items.length > 0 && (
        <ul className="flex flex-col">
          {items.map((hit) => (
            <li key={`${hit.entityType}:${hit.id}`}>
              <EntityHitLink
                hit={hit}
                locale={locale}
                contentLocale={contentLocale}
                className="grid grid-cols-[80px_minmax(0,1fr)] items-baseline gap-4 border-b border-border py-5 no-underline"
              >
                <span className="text-[0.65rem] uppercase tracking-label text-muted">
                  {t(`chips.${hit.entityType}`)}
                </span>
                <span>
                  <span className="block font-serif text-xl leading-tight text-text">
                    {hit.label}
                  </span>
                  {hit.snippet ? (
                    <span className="mt-1 block max-w-measure font-serif text-sm leading-prose text-muted">
                      {hit.snippet}
                    </span>
                  ) : null}
                </span>
              </EntityHitLink>
            </li>
          ))}
        </ul>
      )}

      {!query.isLoading && (paging.hasPrevious || paging.hasNext) && (
        <nav aria-label={t('search.pager')} className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={!paging.hasPrevious}
            onClick={() => goToOffset(paging.previousOffset)}
          >
            {t('search.previous')}
          </Button>
          <span className="text-sm tabular-nums text-muted">
            {t('search.page', {
              page: paging.page,
              pageCount: paging.pageCount,
            })}
          </span>
          <Button
            variant="secondary"
            disabled={!paging.hasNext}
            onClick={() => goToOffset(paging.nextOffset)}
          >
            {t('search.next')}
          </Button>
        </nav>
      )}
    </section>
  );
}
