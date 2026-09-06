import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ApiError, getSuggestion } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  AuthErrorBanner,
  GenericErrorBanner,
  classifyApiError,
  suggestionStatusChipClass,
} from '../lib/suggestionUi';

export function SuggestionStatusPage() {
  const { t, i18n } = useTranslation('suggest');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { id } = useParams({ strict: false }) as { id?: string };
  const { user, ready } = useAuth();

  const query = useQuery({
    queryKey: ['suggestion', id, user?.id],
    queryFn: () => getSuggestion(id!),
    enabled: ready && !!user && !!id,
    retry: false,
  });

  if (!ready) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted">{t('status.loading')}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
        <AuthErrorBanner message={t('status.authRequired')} />
        <Link
          to="/$locale/suggest"
          params={{ locale }}
          className="text-sm text-accent"
        >
          {t('status.goLogin')}
        </Link>
      </section>
    );
  }

  if (!id) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
        <p className="text-muted">{t('status.missingId')}</p>
      </section>
    );
  }

  if (query.isLoading) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
        <p className="text-sm text-muted">{t('status.loading')}</p>
      </section>
    );
  }

  if (query.isError) {
    const err = query.error;
    if (err instanceof ApiError) {
      const classified = classifyApiError(err);
      if (classified.kind === 'auth') {
        return (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
            <AuthErrorBanner
              message={
                err.status === 401
                  ? t('errors.unauthorized')
                  : t('errors.forbidden')
              }
            />
          </section>
        );
      }
      if (err.status === 404) {
        return (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
            <GenericErrorBanner message={t('status.notFound')} />
          </section>
        );
      }
      return (
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
          <GenericErrorBanner message={classified.message || t('status.error')} />
        </section>
      );
    }
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
        <GenericErrorBanner message={t('status.error')} />
      </section>
    );
  }

  const suggestion = query.data!;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
      <dl className="max-w-lg space-y-3 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t('status.id')}
          </dt>
          <dd className="font-mono text-sm">{suggestion.id}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t('status.statusLabel')}
          </dt>
          <dd className="mt-1">
            <span className={suggestionStatusChipClass(suggestion.status)}>
              {suggestion.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t('status.entityType')}
          </dt>
          <dd>{suggestion.entityType}</dd>
        </div>
        {suggestion.reviewNote ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">
              {t('status.reviewNote')}
            </dt>
            <dd className="text-sm whitespace-pre-wrap">
              {suggestion.reviewNote}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
