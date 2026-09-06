import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function PublicShell() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/$locale"
            params={{ locale }}
            className="font-semibold text-accent focus:outline focus:outline-2 focus:outline-focus"
          >
            {t('appName')}
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-muted">
            <Link
              to="/$locale"
              params={{ locale }}
              className="hover:text-text focus:outline focus:outline-2 focus:outline-focus"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/$locale/search"
              params={{ locale }}
              className="hover:text-text focus:outline focus:outline-2 focus:outline-focus"
            >
              {t('nav.search')}
            </Link>
            <Link
              to="/$locale/suggest"
              params={{ locale }}
              className="hover:text-text focus:outline focus:outline-2 focus:outline-focus"
            >
              {t('nav.suggest')}
            </Link>
            <Link
              to="/admin/$locale"
              params={{ locale }}
              className="hover:text-text focus:outline focus:outline-2 focus:outline-focus"
            >
              {t('nav.admin')}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
