import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { UiLocale } from '@kathapp/shared';
import { useEffect, type ReactNode } from 'react';
import { PublicShell } from './layouts/PublicShell';
import { AdminShell } from './layouts/AdminShell';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import {
  MiracleDetailPage,
  SaintDetailPage,
  SourceDetailPage,
} from './pages/EntityDetailPage';
import { SuggestPage } from './pages/SuggestPage';
import { SuggestionStatusPage } from './pages/SuggestionStatusPage';
import {
  AdminDashboardPage,
  AdminMiracleEditPage,
  AdminMiraclesListPage,
  AdminReviewPage,
  AdminSaintEditPage,
  AdminSaintsListPage,
  AdminSourceEditPage,
  AdminSourcesListPage,
} from './pages/AdminPages';

function LocaleSync({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (locale === 'de' || locale === 'en') {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return <>{children}</>;
}

function PublicLocaleLayout() {
  const { locale } = publicLocaleRoute.useParams();
  return (
    <LocaleSync locale={locale}>
      <PublicShell />
    </LocaleSync>
  );
}

function AdminLocaleLayout() {
  const { locale } = adminLocaleRoute.useParams();
  return (
    <LocaleSync locale={locale}>
      <AdminShell />
    </LocaleSync>
  );
}

function assertUiLocale(locale: string): UiLocale {
  if (locale === 'de' || locale === 'en') return locale;
  throw redirect({ to: '/$locale', params: { locale: 'de' } });
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/$locale', params: { locale: 'de' } });
  },
});

const publicLocaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$locale',
  component: PublicLocaleLayout,
  beforeLoad: ({ params }) => {
    assertUiLocale(params.locale);
  },
});

const publicIndexRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/',
  component: HomePage,
});

const searchRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/search',
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
    contentLocale:
      typeof search.contentLocale === 'string'
        ? search.contentLocale
        : undefined,
  }),
});

const saintDetailRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/saints/$id',
  component: SaintDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    contentLocale:
      typeof search.contentLocale === 'string'
        ? search.contentLocale
        : undefined,
  }),
});

const miracleDetailRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/miracles/$id',
  component: MiracleDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    contentLocale:
      typeof search.contentLocale === 'string'
        ? search.contentLocale
        : undefined,
  }),
});

const sourceDetailRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/sources/$id',
  component: SourceDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    contentLocale:
      typeof search.contentLocale === 'string'
        ? search.contentLocale
        : undefined,
  }),
});

const suggestRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/suggest',
  component: SuggestPage,
});

const suggestionStatusRoute = createRoute({
  getParentRoute: () => publicLocaleRoute,
  path: '/suggestions/$id',
  component: SuggestionStatusPage,
});

const adminIndexRedirect = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/admin/$locale', params: { locale: 'de' } });
  },
});

const adminLocaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/$locale',
  component: AdminLocaleLayout,
  beforeLoad: ({ params }) => {
    if (params.locale !== 'de' && params.locale !== 'en') {
      throw redirect({ to: '/admin/$locale', params: { locale: 'de' } });
    }
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/',
  component: AdminDashboardPage,
});

const adminReviewRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/review',
  component: AdminReviewPage,
});

const adminSaintsListRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/saints',
  component: AdminSaintsListPage,
});

const adminMiraclesListRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/miracles',
  component: AdminMiraclesListPage,
});

const adminSourcesListRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/sources',
  component: AdminSourcesListPage,
});

const adminSaintEditRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/saints/$id/edit',
  component: AdminSaintEditPage,
});

const adminMiracleEditRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/miracles/$id/edit',
  component: AdminMiracleEditPage,
});

const adminSourceEditRoute = createRoute({
  getParentRoute: () => adminLocaleRoute,
  path: '/sources/$id/edit',
  component: AdminSourceEditPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicLocaleRoute.addChildren([
    publicIndexRoute,
    searchRoute,
    saintDetailRoute,
    miracleDetailRoute,
    sourceDetailRoute,
    suggestRoute,
    suggestionStatusRoute,
  ]),
  adminIndexRedirect,
  adminLocaleRoute.addChildren([
    adminDashboardRoute,
    adminReviewRoute,
    adminSaintsListRoute,
    adminMiraclesListRoute,
    adminSourcesListRoute,
    adminSaintEditRoute,
    adminMiracleEditRoute,
    adminSourceEditRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
