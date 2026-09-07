import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, PageHeader } from '../../components';

export function AdminSaintsListPage() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language === 'en' ? 'en' : 'de';

  return (
    <section className="flex flex-col gap-4">
      <PageHeader title={t('list.title.saints')} />
      <EmptyState message={t('list.stub')} />
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
    <section className="flex flex-col gap-4">
      <PageHeader title={t('list.title.miracles')} />
      <EmptyState message={t('list.stub')} />
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
    <section className="flex flex-col gap-4">
      <PageHeader title={t('list.title.sources')} />
      <EmptyState message={t('list.stub')} />
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
