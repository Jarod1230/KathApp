import { useTranslation } from 'react-i18next';

export function SuggestPage() {
  const { t } = useTranslation('suggest');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('form.title')}</h1>
      <p className="text-muted">{t('form.stub')}</p>
      <form
        className="max-w-lg space-y-4 rounded-lg border border-border bg-surface p-4 shadow-elev-1 md:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">{t('form.entityType')}</span>
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-2"
            disabled
            defaultValue="saint"
          >
            <option value="saint">saint</option>
            <option value="miracle">miracle</option>
            <option value="source">source</option>
            <option value="edge">edge</option>
          </select>
        </label>
        <p className="text-sm text-muted">{t('form.authHint')}</p>
        <button
          type="submit"
          disabled
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg opacity-60"
        >
          {t('form.submit')}
        </button>
      </form>
    </section>
  );
}
