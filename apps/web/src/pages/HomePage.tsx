import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader, Prose } from '../components';

export function HomePage() {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title={t('home.title')} />
      <Prose>
        <p>{t('home.blurb')}</p>
      </Prose>
      <p className="text-sm text-muted">{t('home.localeNote')}</p>
      <Link
        to="/$locale/search"
        params={{ locale }}
        search={{
          q: undefined,
          type: undefined,
          offset: undefined,
          contentLocale: undefined,
        }}
        className="self-start rounded-sm bg-accent px-4 py-2 text-sm font-medium text-on-accent no-underline"
      >
        {t('home.ctaSearch')}
      </Link>
    </section>
  );
}
