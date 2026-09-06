import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
      <p className="text-muted">{t('home.blurb')}</p>
      <p className="text-sm text-muted">{t('home.localeNote')}</p>
      <Link
        to="/$locale/search"
        params={{ locale }}
        search={{ q: undefined, type: undefined, contentLocale: undefined }}
        className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg"
      >
        {t('home.ctaSearch')}
      </Link>
    </section>
  );
}
