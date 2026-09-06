import { Link, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { EntityType } from '@kathapp/shared';
import {
  contentLocaleFromSearch,
  resolveContentLocale,
} from '../lib/contentLocale';

type DetailKind = 'saint' | 'miracle' | 'source';

/** Registry-style detail stub — new entityTypes plug in without layout rewrite. */
export function EntityDetailPage({ kind }: { kind: DetailKind }) {
  const { t, i18n } = useTranslation('entity');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { id } = useParams({ strict: false }) as { id?: string };
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const contentLocale = resolveContentLocale(
    contentLocaleFromSearch(search),
    locale,
  );
  const entityType: EntityType = kind;

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">
          {t('detail.kind')}: {entityType} · id: {id ?? '—'}
        </p>
        <h1 className="text-2xl font-semibold">{t(`detail.title.${kind}`)}</h1>
        <p className="text-muted">{t('detail.stub')}</p>
        <p className="text-sm text-muted">
          {t('detail.contentLocale')}: {contentLocale}
        </p>
      </header>

      <section aria-labelledby="body-slot" className="space-y-2">
        <h2 id="body-slot" className="text-lg font-medium">
          {t('slots.body')}
        </h2>
        <p className="text-sm text-muted">{t('slots.bodyStub')}</p>
      </section>

      <section aria-labelledby="citations-slot" className="space-y-2">
        <h2 id="citations-slot" className="text-lg font-medium">
          {t('slots.citations')}
        </h2>
        <p className="text-sm text-muted">{t('slots.citationsStub')}</p>
        <button
          type="button"
          className="rounded-md border border-border bg-surface px-3 py-2 text-left text-sm shadow-elev-1"
        >
          <span className="font-medium">{t('citation.tappable')}</span>
          <span className="mt-1 block font-serif text-muted">
            {t('citation.latinHint')}
          </span>
        </button>
      </section>

      <section aria-labelledby="relations-slot" className="space-y-2">
        <h2 id="relations-slot" className="text-lg font-medium">
          {t('slots.relations')}
        </h2>
        <p className="text-sm text-muted">{t('slots.relationsStub')}</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-sm">
            {t('chips.slot')}
          </span>
        </div>
      </section>

      <p>
        <Link to="/$locale/search" params={{ locale }} className="text-sm text-accent">
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

