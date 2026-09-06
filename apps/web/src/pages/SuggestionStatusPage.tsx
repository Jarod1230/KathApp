import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export function SuggestionStatusPage() {
  const { t } = useTranslation('suggest');
  const { id } = useParams({ strict: false }) as { id?: string };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('status.title')}</h1>
      <p className="text-muted">{t('status.stub')}</p>
      <p className="text-sm">
        id: <code>{id ?? '—'}</code>
      </p>
      <ul className="list-inside list-disc text-sm text-muted">
        <li>submitted</li>
        <li>in_review</li>
        <li>accepted</li>
        <li>rejected</li>
      </ul>
    </section>
  );
}
