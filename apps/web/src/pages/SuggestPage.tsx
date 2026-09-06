import { useTranslation } from 'react-i18next';

export function SuggestPage() {
  const { t } = useTranslation('suggest');

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-elev-1">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted">{t('blurb')}</p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <label className="block space-y-1">
          <span className="text-sm text-muted">{t('entityType')}</span>
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-text focus:outline focus:outline-2 focus:outline-focus"
            defaultValue=""
            disabled
          >
            <option value="">{t('fieldPlaceholder')}</option>
            <option value="saint">saint</option>
            <option value="miracle">miracle</option>
            <option value="source">source</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-muted">{t('notes')}</span>
          <textarea
            className="min-h-[6rem] w-full rounded-md border border-border bg-bg px-3 py-2 text-text placeholder:text-muted focus:outline focus:outline-2 focus:outline-focus"
            placeholder={t('fieldPlaceholder')}
            disabled
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg opacity-70"
          disabled
        >
          {t('submit')}
        </button>
      </form>
      <div className="rounded-md border border-dashed border-border bg-bg px-3 py-2 text-sm text-muted">
        <span className="font-medium text-text">{t('statusLabel')}: </span>
        {t('statusPlaceholder')}
      </div>
    </section>
  );
}
