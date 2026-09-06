import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function PublicShell() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-4 py-3 shadow-elev-1 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
          <Link
            to="/$locale"
            params={{ locale }}
            className="text-xl font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
