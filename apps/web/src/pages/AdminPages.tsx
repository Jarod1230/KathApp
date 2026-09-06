import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function AdminDashboardPage() {
  const { t } = useTranslation('admin');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('dashboard.title')}</h1>
      <p className="text-muted">{t('dashboard.stub')}</p>
    </section>
  );
}

export function AdminReviewPage() {
  const { t } = useTranslation('admin');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('review.title')}</h1>
      <p className="text-muted">{t('review.stub')}</p>
    </section>
  );
}

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
        className="text-sm text-accent"
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
        className="text-sm text-accent"
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
        className="text-sm text-accent"
      >
        {t('list.editStub')}
      </Link>
    </section>
  );
}

export function AdminSaintEditPage() {
  const { t } = useTranslation('admin');
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('edit.title.saints')}</h1>
      <p className="text-muted">{t('edit.stub')}</p>
      <p className="text-sm">
        id: <code>{id ?? '—'}</code>
      </p>
    </section>
  );
}

export function AdminMiracleEditPage() {
  const { t } = useTranslation('admin');
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('edit.title.miracles')}</h1>
      <p className="text-muted">{t('edit.stub')}</p>
      <p className="text-sm">
        id: <code>{id ?? '—'}</code>
      </p>
    </section>
  );
}

export function AdminSourceEditPage() {
  const { t } = useTranslation('admin');
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('edit.title.sources')}</h1>
      <p className="text-muted">{t('edit.stub')}</p>
      <p className="text-sm">
        id: <code>{id ?? '—'}</code>
      </p>
    </section>
  );
}
