import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { UiLocale } from '@kathapp/shared';
import { useEffect } from 'react';

function Shell() {
  const { t, i18n } = useTranslation();
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <strong className="text-accent">{t('appName')}</strong>
          <nav className="flex gap-3 text-sm text-muted">
            <a className="hover:text-text focus:outline focus:outline-2 focus:outline-focus" href={`/${i18n.language}`}>
              {t('nav.home')}
            </a>
            <a className="hover:text-text focus:outline focus:outline-2 focus:outline-focus" href={`/${i18n.language}/admin`}>
              {t('nav.admin')}
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function LocaleLayout() {
  const { locale } = localeRoute.useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (locale === 'de' || locale === 'en') {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return <Outlet />;
}

function HomePage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-6">
      <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
      <p className="text-muted">{t('home.blurb')}</p>
      <p className="text-sm text-muted">{t('home.localeNote')}</p>
    </section>
  );
}

function AdminPage() {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-6">
      <h1 className="text-2xl font-semibold">{t('admin.title')}</h1>
      <p className="text-muted">{t('admin.blurb')}</p>
    </section>
  );
}

const rootRoute = createRootRoute({
  component: Shell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/$locale', params: { locale: 'de' } });
  },
});

const localeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale',
  component: LocaleLayout,
  beforeLoad: ({ params }) => {
    const locale = params.locale as UiLocale;
    if (locale !== 'de' && locale !== 'en') {
      throw redirect({ to: '/$locale', params: { locale: 'de' } });
    }
  },
});

const localeIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: '/',
  component: HomePage,
});

const adminRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  localeRoute.addChildren([localeIndexRoute, adminRoute]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
