import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { EmptyState, PageHeader } from '../../components';

export function AdminSaintEditPage() {
  const { t } = useTranslation('admin');
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <section className="flex flex-col gap-4">
      <PageHeader title={t('edit.title.saints')} />
      <EmptyState message={t('edit.stub')} />
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
    <section className="flex flex-col gap-4">
      <PageHeader title={t('edit.title.miracles')} />
      <EmptyState message={t('edit.stub')} />
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
    <section className="flex flex-col gap-4">
      <PageHeader title={t('edit.title.sources')} />
      <EmptyState message={t('edit.stub')} />
      <p className="text-sm">
        id: <code>{id ?? '—'}</code>
      </p>
    </section>
  );
}
