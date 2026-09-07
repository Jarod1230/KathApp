import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Role } from '@kathapp/shared';
import { ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { GenericErrorBanner } from '../../lib/suggestionUi';

const DEV_ROLES: Role[] = ['contributor', 'reviewer', 'admin'];

export function DevLoginPanel({
  title,
  onDone,
}: {
  title: string;
  onDone?: () => void;
}) {
  const { t } = useTranslation('admin');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('reviewer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, role);
      onDone?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('login.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted">{t('login.required')}</p>
      <form
        className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6"
        onSubmit={onSubmit}
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('login.email')}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
            autoComplete="username"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('login.role')}</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          >
            {DEV_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        {error && <GenericErrorBanner message={error} />}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent disabled:opacity-60"
        >
          {busy ? t('login.busy') : t('login.submit')}
        </button>
      </form>
    </section>
  );
}

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { user, ready, logout } = useAuth();

  if (!ready) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted">{t('login.loading')}</p>
      </section>
    );
  }

  if (!user) {
    return <DevLoginPanel title={t('dashboard.title')} />;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
      <div className="max-w-lg space-y-3 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6">
        <p className="text-sm">
          <span className="text-muted">{t('dashboard.email')}: </span>
          {user.email}
        </p>
        <p className="text-sm">
          <span className="text-muted">{t('dashboard.role')}: </span>
          {user.role}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/admin/$locale/review"
            params={{ locale }}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-on-accent"
          >
            {t('dashboard.toReview')}
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            {t('dashboard.logout')}
          </button>
        </div>
      </div>
    </section>
  );
}
