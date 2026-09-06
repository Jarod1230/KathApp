import { Link, useParams, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { EdgeChip, PublicEntityKind } from '@kathapp/shared';
import {
  contentLocaleFromSearch,
  resolveContentLocale,
} from '../lib/contentLocale';
import { ApiError, getEntityDetail } from '../lib/api';

type DetailKind = PublicEntityKind;

function RelatedChipLink({
  edge,
  locale,
  contentLocale,
}: {
  edge: EdgeChip;
  locale: string;
  contentLocale: string;
}) {
  const params = { locale, id: edge.relatedId };
  const search = { contentLocale };
  const className =
    'rounded-full border border-border px-3 py-1 text-sm hover:bg-muted/20';
  if (edge.relatedEntityType === 'saint') {
    return (
      <Link
        to="/$locale/saints/$id"
        params={params}
        search={search}
        className={className}
        title={edge.type}
      >
        {edge.label}
      </Link>
    );
  }
  if (edge.relatedEntityType === 'miracle') {
    return (
      <Link
        to="/$locale/miracles/$id"
        params={params}
        search={search}
        className={className}
        title={edge.type}
      >
        {edge.label}
      </Link>
    );
  }
  return (
    <Link
      to="/$locale/sources/$id"
      params={params}
      search={search}
      className={className}
      title={edge.type}
    >
      {edge.label}
    </Link>
  );
}

/** Registry-style detail — wired to GET /v1/{saints|miracles|sources}/:id. */
export function EntityDetailPage({ kind }: { kind: DetailKind }) {
  const { t, i18n } = useTranslation('entity');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { id } = useParams({ strict: false }) as { id?: string };
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const contentLocale = resolveContentLocale(
    contentLocaleFromSearch(search),
    locale,
  );

  const query = useQuery({
    queryKey: ['entity', kind, id, contentLocale],
    enabled: Boolean(id),
    queryFn: () => getEntityDetail(kind, id!, contentLocale),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });

  const notFound =
    query.error instanceof ApiError && query.error.status === 404;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">
          {t('detail.kind')}: {kind} · id: {id ?? '—'}
        </p>
        {query.isLoading && (
          <p className="text-muted">{t('detail.loading')}</p>
        )}
        {notFound && (
          <>
            <h1 className="text-2xl font-semibold">{t('detail.notFoundTitle')}</h1>
            <p className="text-muted">{t('detail.notFound')}</p>
          </>
        )}
        {query.isError && !notFound && (
          <p className="text-sm text-red-700" role="alert">
            {t('detail.error')}
          </p>
        )}
        {query.data && (
          <>
            <h1 className="text-2xl font-semibold">{query.data.label}</h1>
            <p className="text-sm text-muted">
              {t('detail.contentLocale')}: {query.data.locale}
            </p>
          </>
        )}
      </header>

      {query.data && (
        <>
          <section aria-labelledby="body-slot" className="space-y-2">
            <h2 id="body-slot" className="text-lg font-medium">
              {t('slots.body')}
            </h2>
            {query.data.body ? (
              <p className="text-sm leading-relaxed">{query.data.body}</p>
            ) : (
              <p className="text-sm text-muted">{t('slots.bodyEmpty')}</p>
            )}
            {kind === 'saint' && query.data.saint?.feastNote ? (
              <p className="text-sm text-muted">
                {t('detail.feastNote')}: {query.data.saint.feastNote}
              </p>
            ) : null}
            {kind === 'miracle' && query.data.miracle?.approxDate ? (
              <p className="text-sm text-muted">
                {t('detail.approxDate')}: {query.data.miracle.approxDate}
              </p>
            ) : null}
            {kind === 'source' && query.data.source ? (
              <dl className="grid gap-1 text-sm text-muted">
                <div>
                  <dt className="inline font-medium text-text">
                    {t('detail.language')}:{' '}
                  </dt>
                  <dd className="inline">{query.data.source.language}</dd>
                </div>
                {query.data.source.author ? (
                  <div>
                    <dt className="inline font-medium text-text">
                      {t('detail.author')}:{' '}
                    </dt>
                    <dd className="inline">{query.data.source.author}</dd>
                  </div>
                ) : null}
                {query.data.source.year != null ? (
                  <div>
                    <dt className="inline font-medium text-text">
                      {t('detail.year')}:{' '}
                    </dt>
                    <dd className="inline">{query.data.source.year}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </section>

          <section aria-labelledby="citations-slot" className="space-y-2">
            <h2 id="citations-slot" className="text-lg font-medium">
              {t('slots.citations')}
            </h2>
            {query.data.citations.length === 0 ? (
              <p className="text-sm text-muted">{t('slots.citationsEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {query.data.citations.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/$locale/sources/$id"
                      params={{ locale, id: c.sourceId }}
                      search={{ contentLocale }}
                      className="block rounded-md border border-border bg-surface px-3 py-2 text-left text-sm shadow-elev-1"
                    >
                      <span className="font-medium">
                        {c.sourceTitle ?? c.sourceId} — {c.locus}
                      </span>
                      {c.excerpt ? (
                        <span className="mt-1 block text-muted">{c.excerpt}</span>
                      ) : null}
                      {c.excerptLatin ? (
                        <span className="mt-1 block font-serif text-muted">
                          {c.excerptLatin}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="relations-slot" className="space-y-2">
            <h2 id="relations-slot" className="text-lg font-medium">
              {t('slots.relations')}
            </h2>
            {query.data.edges.length === 0 ? (
              <p className="text-sm text-muted">{t('slots.relationsEmpty')}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {query.data.edges.map((edge) => (
                  <RelatedChipLink
                    key={edge.id}
                    edge={edge}
                    locale={locale}
                    contentLocale={contentLocale}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <p>
        <Link
          to="/$locale/search"
          params={{ locale }}
          search={{ q: undefined, type: undefined, offset: undefined, contentLocale: undefined }}
          className="text-sm text-accent"
        >
          {t('detail.backSearch')}
        </Link>
      </p>
    </article>
  );
}

export function SaintDetailPage() {
  return <EntityDetailPage kind="saint" />;
}

export function MiracleDetailPage() {
  return <EntityDetailPage kind="miracle" />;
}

export function SourceDetailPage() {
  return <EntityDetailPage kind="source" />;
}
