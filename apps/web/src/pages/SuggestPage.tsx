import { useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type {
  PublicEntityKind,
  PublishStatus,
  Role,
  SuggestionCreateRequest,
  SuggestionEntityPayloadV1,
} from '@kathapp/shared';
import { ApiError, createSuggestion } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  AuthErrorBanner,
  GateFailureList,
  GenericErrorBanner,
  classifyApiError,
} from '../lib/suggestionUi';

const ENTITY_TYPES: PublicEntityKind[] = ['saint', 'miracle', 'source'];
const CONTENT_LOCALES = ['de', 'en'] as const;
const DEV_ROLES: Role[] = ['contributor', 'reviewer', 'admin'];

function labelFieldFor(kind: PublicEntityKind): string {
  return kind === 'saint' ? 'name' : 'title';
}

function bodyFieldFor(kind: PublicEntityKind): string {
  if (kind === 'saint') return 'shortBio';
  if (kind === 'miracle') return 'summary';
  return 'notes';
}

export function SuggestPage() {
  const { t, i18n } = useTranslation('suggest');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const navigate = useNavigate();
  const { user, ready, login } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<Role>('contributor');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [entityType, setEntityType] = useState<PublicEntityKind>('saint');
  const [contentLocale, setContentLocale] = useState<'de' | 'en'>('de');
  const [label, setLabel] = useState('');
  const [body, setBody] = useState('');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft');
  const [sourceId, setSourceId] = useState('');
  const [locus, setLocus] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [excerptLatin, setExcerptLatin] = useState('');
  const [relatedSaintId, setRelatedSaintId] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('la');
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrorKind, setFormErrorKind] = useState<'auth' | 'gates' | 'other' | null>(null);
  const [gateCodes, setGateCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function onDevLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginBusy(true);
    try {
      await login(loginEmail, loginRole);
    } catch (err) {
      setLoginError(
        err instanceof ApiError ? err.message : t('login.error'),
      );
    } finally {
      setLoginBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormErrorKind(null);
    setGateCodes([]);

    const trimmedLabel = label.trim();
    const trimmedBody = body.trim();
    if (!trimmedLabel) {
      setFormError(t('form.validation.labelRequired'));
      return;
    }
    if (entityType === 'source' && !sourceLanguage.trim()) {
      setFormError(t('form.validation.languageRequired'));
      return;
    }

    const payload: SuggestionEntityPayloadV1 = {
      kind: 'entity',
      op: 'create',
      entityType,
      fields: {
        status: publishStatus,
        ...(entityType === 'source'
          ? { language: sourceLanguage.trim() }
          : {}),
      },
      translations: [
        {
          locale: contentLocale,
          field: labelFieldFor(entityType),
          value: trimmedLabel,
        },
        ...(trimmedBody
          ? [
              {
                locale: contentLocale,
                field: bodyFieldFor(entityType),
                value: trimmedBody,
              },
            ]
          : []),
      ],
    };

    if (sourceId.trim() || locus.trim()) {
      if (!sourceId.trim() || !locus.trim()) {
        setFormError(t('form.validation.citationIncomplete'));
        return;
      }
      payload.citations = [
        {
          sourceId: sourceId.trim(),
          locus: locus.trim(),
          excerpt: excerpt.trim() || null,
          excerptLatin: excerptLatin.trim() || null,
        },
      ];
    }

    if (entityType === 'miracle' && relatedSaintId.trim()) {
      payload.edges = [
        {
          type: 'saint_miracle',
          relatedId: relatedSaintId.trim(),
          direction: 'to',
        },
      ];
    }

    const request: SuggestionCreateRequest = {
      schemaVersion: 1,
      payload,
    };

    setSubmitting(true);
    try {
      const created = await createSuggestion(request);
      void navigate({
        to: '/$locale/suggestions/$id',
        params: { locale, id: created.id },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const classified = classifyApiError(err);
        if (classified.kind === 'auth') {
          setFormErrorKind('auth');
          setFormError(
            err.status === 401
              ? t('errors.unauthorized')
              : t('errors.forbidden'),
          );
        } else if (classified.kind === 'gates') {
          setFormErrorKind('gates');
          setFormError(t('errors.gatesFailed'));
          setGateCodes(classified.gates);
        } else {
          setFormErrorKind('other');
          setFormError(classified.message || t('form.error'));
        }
      } else {
        setFormErrorKind('other');
        setFormError(t('form.error'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted">{t('login.loading')}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">{t('form.title')}</h1>
        <p className="text-muted">{t('login.required')}</p>
        <form
          className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6"
          onSubmit={onDevLogin}
        >
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('login.email')}</span>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
              autoComplete="username"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('login.role')}</span>
            <select
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value as Role)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
            >
              {DEV_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {loginError && <GenericErrorBanner message={loginError} />}
          <button
            type="submit"
            disabled={loginBusy}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
          >
            {loginBusy ? t('login.busy') : t('login.submit')}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('form.title')}</h1>
      <p className="text-sm text-muted">
        {t('form.signedInAs', { email: user.email, role: user.role })}
      </p>
      <form
        className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6"
        onSubmit={onSubmit}
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('form.entityType')}</span>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as PublicEntityKind)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          >
            {ENTITY_TYPES.map((k) => (
              <option key={k} value={k}>
                {t(`form.entityTypes.${k}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('form.contentLocale')}</span>
          <select
            value={contentLocale}
            onChange={(e) =>
              setContentLocale(e.target.value as 'de' | 'en')
            }
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          >
            {CONTENT_LOCALES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('form.label')}</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('form.body')}</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('form.publishStatus')}</span>
          <select
            value={publishStatus}
            onChange={(e) =>
              setPublishStatus(e.target.value as PublishStatus)
            }
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          >
            <option value="draft">{t('form.statusDraft')}</option>
            <option value="published">{t('form.statusPublished')}</option>
          </select>
        </label>

        {entityType === 'source' && (
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('form.sourceLanguage')}</span>
            <input
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
              placeholder="la"
            />
            <span className="text-xs text-muted">
              {t('form.sourceLanguageHint')}
            </span>
          </label>
        )}

        {entityType === 'miracle' && (
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('form.relatedSaintId')}</span>
            <input
              value={relatedSaintId}
              onChange={(e) => setRelatedSaintId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
              placeholder="uuid"
            />
            <span className="text-xs text-muted">
              {t('form.relatedSaintHint')}
            </span>
          </label>
        )}

        <fieldset className="space-y-3 rounded-md border border-border p-3">
          <legend className="px-1 text-sm font-medium">
            {t('form.citationOptional')}
          </legend>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('form.sourceId')}</span>
            <input
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('form.locus')}</span>
            <input
              value={locus}
              onChange={(e) => setLocus(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('form.excerpt')}</span>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t('form.excerptLatin')}</span>
            <textarea
              value={excerptLatin}
              onChange={(e) => setExcerptLatin(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-bg px-3 py-2"
            />
          </label>
        </fieldset>

        {formErrorKind === 'auth' && formError && (
          <AuthErrorBanner message={formError} />
        )}
        {formErrorKind === 'gates' && gateCodes.length > 0 && (
          <GateFailureList
            title={formError ?? t('errors.gatesFailed')}
            gates={gateCodes}
            labelFor={(code) => t(`gates.${code}`, { defaultValue: code })}
          />
        )}
        {formErrorKind === 'other' && formError && (
          <GenericErrorBanner message={formError} />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
        >
          {submitting ? t('form.submitting') : t('form.submit')}
        </button>
      </form>
    </section>
  );
}
