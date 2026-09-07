import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function AdminSaintsListPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('list.title.saints')}</h1>
      <p className="text-muted">{t('list.stub')}</p>
      <Link
        to="/admin/$locale/saints/$id/edit"
        params={{ locale, id: 'stub' }}
        className="text-sm text-accent-text"
      >
        {t('list.editStub')}
      </Link>
    </section>
  );
}

export function AdminMiraclesListPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('list.title.miracles')}</h1>
      <p className="text-muted">{t('list.stub')}</p>
      <Link
        to="/admin/$locale/miracles/$id/edit"
        params={{ locale, id: 'stub' }}
        className="text-sm text-accent-text"
      >
        {t('list.editStub')}
      </Link>
    </section>
  );
}

export function AdminSourcesListPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('list.title.sources')}</h1>
      <p className="text-muted">{t('list.stub')}</p>
      <Link
        to="/admin/$locale/sources/$id/edit"
        params={{ locale, id: 'stub' }}
        className="text-sm text-accent-text"
      >
        {t('list.editStub')}
      </Link>
    </section>
  );
}
