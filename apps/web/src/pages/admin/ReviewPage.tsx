import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { SuggestionStatus, SuggestionView } from '@kathapp/shared';
import {
  ApiError,
  acceptSuggestion,
  listSuggestions,
  rejectSuggestion,
} from '../../lib/api';
import { roleAtLeast, useAuth } from '../../lib/auth';
import {
  AuthErrorBanner,
  GateFailureList,
  GenericErrorBanner,
  classifyApiError,
  suggestionStatusChipClass,
} from '../../lib/suggestionUi';
import { DevLoginPanel } from './DashboardPage';

const STATUS_FILTERS: Array<SuggestionStatus | ''> = [
  '',
  'submitted',
  'in_review',
  'accepted',
  'rejected',
];

function ReviewRow({
  item,
  locale,
}: {
  item: SuggestionView;
  locale: string;
}) {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionErrorKind, setActionErrorKind] = useState<
    'auth' | 'gates' | 'other' | null
  >(null);
  const [gates, setGates] = useState<string[]>([]);

  const acceptMut = useMutation({
    mutationFn: () => acceptSuggestion(item.id),
    onSuccess: () => {
      setActionError(null);
      setActionErrorKind(null);
      setGates([]);
      void queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        const classified = classifyApiError(err);
        if (classified.kind === 'auth') {
          setActionErrorKind('auth');
          setActionError(
            err.status === 401
              ? t('errors.unauthorized')
              : t('errors.forbidden'),
          );
          setGates([]);
        } else if (classified.kind === 'gates') {
          setActionErrorKind('gates');
          setActionError(t('errors.gatesFailed'));
          setGates(classified.gates);
        } else {
          setActionErrorKind('other');
          setActionError(classified.message || t('review.actionError'));
          setGates([]);
        }
      } else {
        setActionErrorKind('other');
        setActionError(t('review.actionError'));
        setGates([]);
      }
    },
  });

  const rejectMut = useMutation({
    mutationFn: () =>
      rejectSuggestion(item.id, {
        reviewNote: note.trim() || undefined,
      }),
    onSuccess: () => {
      setActionError(null);
      setActionErrorKind(null);
      setGates([]);
      setNote('');
      void queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        const classified = classifyApiError(err);
        if (classified.kind === 'auth') {
          setActionErrorKind('auth');
          setActionError(
            err.status === 401
              ? t('errors.unauthorized')
              : t('errors.forbidden'),
          );
        } else {
          setActionErrorKind('other');
          setActionError(classified.message || t('review.actionError'));
        }
      } else {
        setActionErrorKind('other');
        setActionError(t('review.actionError'));
      }
      setGates([]);
    },
  });

  const resolved =
    item.status === 'accepted' || item.status === 'rejected';
  const busy = acceptMut.isPending || rejectMut.isPending;

  return (
    <li className="space-y-3 px-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            to="/$locale/suggestions/$id"
            params={{ locale, id: item.id }}
            className="font-mono text-sm text-accent-text"
          >
            {item.id}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">{item.entityType}</span>
            <span className={suggestionStatusChipClass(item.status)}>
              {item.status}
            </span>
          </p>
          {item.reviewNote ? (
            <p className="mt-1 text-sm text-muted whitespace-pre-wrap">
              {item.reviewNote}
            </p>
          ) : null}
        </div>
      </div>

      {!resolved && (
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => acceptMut.mutate()}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-on-accent disabled:opacity-60"
          >
            {t('review.accept')}
          </button>
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs">
            <span className="text-muted">{t('review.rejectNote')}</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-md border border-border bg-bg px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => rejectMut.mutate()}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {t('review.reject')}
          </button>
        </div>
      )}

      {actionErrorKind === 'auth' && actionError && (
        <AuthErrorBanner message={actionError} />
      )}
      {actionErrorKind === 'gates' && gates.length > 0 && (
        <GateFailureList
          title={actionError ?? t('errors.gatesFailed')}
          gates={gates}
          labelFor={(code) => t(`gates.${code}`, { defaultValue: code })}
        />
      )}
      {actionErrorKind === 'other' && actionError && (
        <GenericErrorBanner message={actionError} />
      )}
    </li>
  );
}

export function AdminReviewPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { user, ready } = useAuth();
  const [status, setStatus] = useState<SuggestionStatus | ''>('submitted');

  const query = useQuery({
    queryKey: ['suggestions', status, user?.id],
    queryFn: () => listSuggestions(status || undefined),
    enabled: ready && !!user && roleAtLeast(user.role, 'reviewer'),
    retry: false,
  });

  if (!ready) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted">{t('login.loading')}</p>
      </section>
    );
  }

  if (!user) {
    return <DevLoginPanel title={t('review.title')} />;
  }

  if (!roleAtLeast(user.role, 'reviewer')) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('review.title')}</h1>
        <AuthErrorBanner message={t('review.forbidden')} />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('review.title')}</h1>

      <label className="inline-flex items-center gap-2 text-sm">
        <span className="font-medium">{t('review.statusFilter')}</span>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as SuggestionStatus | '')
          }
          className="rounded-md border border-border bg-surface px-3 py-2"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s ? s : t('review.statusAll')}
            </option>
          ))}
        </select>
      </label>

      {query.isLoading && (
        <p className="text-sm text-muted">{t('review.loading')}</p>
      )}

      {query.isError && (
        query.error instanceof ApiError &&
        (query.error.status === 401 || query.error.status === 403) ? (
          <AuthErrorBanner
            message={
              query.error.status === 401
                ? t('errors.unauthorized')
                : t('errors.forbidden')
            }
          />
        ) : (
          <GenericErrorBanner
            message={
              query.error instanceof ApiError
                ? query.error.message
                : t('review.error')
            }
          />
        )
      )}

      {!query.isLoading && !query.isError && (query.data?.length ?? 0) === 0 && (
        <p className="text-muted">{t('review.empty')}</p>
      )}

      {!query.isLoading && (query.data?.length ?? 0) > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {query.data!.map((item) => (
            <ReviewRow key={item.id} item={item} locale={locale} />
          ))}
        </ul>
      )}
    </section>
  );
}
