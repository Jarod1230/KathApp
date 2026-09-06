import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';

export function AdminShell() {
  const { t, i18n } = useTranslation('admin');
  const { t: tc } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { user, ready } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-4 py-3 shadow-elev-1 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
          <span className="text-xl font-semibold text-accent">{t('shellTitle')}</span>
          <nav className="flex flex-wrap gap-3 text-sm" aria-label={t('navLabel')}>
            <Link to="/admin/$locale" params={{ locale }}>
              {t('nav.dashboard')}
            </Link>
            <Link to="/admin/$locale/review" params={{ locale }}>
              {t('nav.review')}
            </Link>
            <Link to="/admin/$locale/saints" params={{ locale }}>
              {t('nav.saints')}
            </Link>
            <Link to="/admin/$locale/miracles" params={{ locale }}>
              {t('nav.miracles')}
            </Link>
            <Link to="/admin/$locale/sources" params={{ locale }}>
              {t('nav.sources')}
            </Link>
            <Link to="/$locale" params={{ locale }}>
              {tc('nav.backPublic')}
            </Link>
          </nav>
          <div className="ml-auto text-xs text-muted">
            {ready && user ? (
              <span>
                {user.email} · {user.role}
              </span>
            ) : ready ? (
              <Link to="/admin/$locale" params={{ locale }} className="text-accent">
                {tc('auth.login')}
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
