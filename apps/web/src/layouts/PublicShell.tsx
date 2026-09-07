import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { ThemeToggle } from '../components/ThemeToggle';

export function PublicShell() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';
  const { user, ready } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-4 py-3 shadow-elev-1 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
          <Link
            to="/$locale"
            params={{ locale }}
            className="font-serif text-xl font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t('appName')}
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm" aria-label={t('nav.main')}>
            <Link to="/$locale" params={{ locale }}>
              {t('nav.home')}
            </Link>
            <Link to="/$locale/search" params={{ locale }} search={{ q: undefined, type: undefined, offset: undefined, contentLocale: undefined }}>
              {t('nav.search')}
            </Link>
            <Link to="/$locale/suggest" params={{ locale }}>
              {t('nav.suggest')}
            </Link>
            <Link to="/admin/$locale" params={{ locale }}>
              {t('nav.admin')}
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted">
            <ThemeToggle />
            {ready && user ? (
              <span>
                {user.email} · {user.role}
              </span>
            ) : ready ? (
              <Link to="/$locale/suggest" params={{ locale }} className="text-accent">
                {t('auth.login')}
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
