import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

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
