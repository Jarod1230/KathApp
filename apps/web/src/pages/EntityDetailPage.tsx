import { Link, useParams, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { PublicEntityKind } from '@kathapp/shared';
import {
  Banner,
  Citation,
  EmptyState,
  PageHeader,
  Prose,
  RelationRail,
  SectionRule,
} from '../components';
import {
  contentLocaleFromSearch,
  resolveContentLocale,
} from '../lib/contentLocale';
import { detailRoute } from '../lib/detailRoute';
import { entityFacts } from '../lib/entityFacts';
import { ApiError, getEntityDetail } from '../lib/api';

type DetailKind = PublicEntityKind;

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

  const facts = query.data ? entityFacts(query.data) : [];

  return (
    <article className="flex flex-col gap-6">
      {query.isLoading && <p className="text-muted">{t('detail.loading')}</p>}

      {notFound && (
        <>
          <PageHeader title={t('detail.notFoundTitle')} />
          <EmptyState message={t('detail.notFound')} />
        </>
      )}

      {query.isError && !notFound && (
        <Banner tone="error">{t('detail.error')}</Banner>
      )}

      {query.data && (
        <>
          <PageHeader
            kicker={t(`chips.${kind}`)}
            title={query.data.label}
            byline={
              <>
                {facts.map((fact) => (
                  <span key={fact.labelKey}>
                    <span className="text-text">{t(fact.labelKey)}:</span>{' '}
                    {fact.value}
                  </span>
                ))}
                <span>
                  {t('detail.contentLocale')}: {query.data.locale}
                </span>
              </>
            }
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_210px] lg:gap-10">
            <div>
              <SectionRule label={t('slots.body')} />
              {query.data.body ? (
                <Prose>
                  <p>{query.data.body}</p>
                </Prose>
              ) : (
                <EmptyState message={t('slots.bodyEmpty')} />
              )}

              <SectionRule label={t('slots.citations')} />
              {query.data.citations.length === 0 ? (
                <EmptyState message={t('slots.citationsEmpty')} />
              ) : (
                query.data.citations.map((c) => (
                  <Citation key={c.id} citation={c}>
                    <Link
                      to="/$locale/sources/$id"
                      params={{ locale, id: c.sourceId }}
                      search={{ contentLocale }}
                    >
                      {c.sourceTitle ?? c.sourceId}
                    </Link>
                  </Citation>
                ))
              )}
            </div>

            <RelationRail
              title={t('slots.relations')}
              emptyMessage={t('slots.relationsEmpty')}
              items={query.data.edges.map((edge) => ({
                edge,
                link: (
                  <Link
                    to={detailRoute(edge.relatedEntityType)}
                    params={{ locale, id: edge.relatedId }}
                    search={{ contentLocale }}
                  >
                    <span className="text-[0.65rem] uppercase tracking-label text-muted">
                      {t(`chips.${edge.relatedEntityType}`)}
                    </span>
                    <span className="font-serif leading-tight text-text">
                      {edge.label}
                    </span>
                  </Link>
                ),
              }))}
            />
          </div>

          <footer className="border-t border-border pt-3 text-xs text-muted">
            <span className="font-mono">{query.data.id}</span>
          </footer>
        </>
      )}
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
