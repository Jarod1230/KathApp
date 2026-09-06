import { Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function AdminShell() {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <strong className="text-accent">{t('common:appName')} — Admin</strong>
          <nav className="flex flex-wrap gap-3 text-sm text-muted">
            <Link
              to="/admin/$locale"
              params={{ locale }}
              className="hover:text-text focus:outline focus:outline-2 focus:outline-focus"
            >
              {t('listTitle')}
            </Link>
            <Link
              to="/$locale"
              params={{ locale }}
              className="hover:text-text focus:outline focus:outline-2 focus:outline-focus"
            >
              {t('common:nav.home')}
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
