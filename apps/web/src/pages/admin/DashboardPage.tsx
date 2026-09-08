import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Role } from '@kathapp/shared';
import { ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import {
  Banner,
  Button,
  PageHeader,
  SelectField,
  TextField,
} from '../../components';

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
      <PageHeader title={title} />
      <p className="text-muted">{t('login.required')}</p>
      <form
        className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6"
        onSubmit={onSubmit}
      >
        <TextField label={t('login.email')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username" />
        <SelectField label={t('login.role')}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
          >
            {DEV_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
        {error && <Banner tone="error">{error}</Banner>}
        <Button type="submit" busy={busy} className="self-start">{busy ? t('login.busy') : t('login.submit')}</Button>
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
      <PageHeader title={t('dashboard.title')} />
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
          <Button variant="secondary" onClick={() => logout()}>{t('dashboard.logout')}</Button>
        </div>
      </div>
    </section>
  );
}
