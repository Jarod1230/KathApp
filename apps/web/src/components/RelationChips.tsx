import { useTranslation } from 'react-i18next';

/** Relations slot — chip placeholders only (no graph data). */
export function RelationChips() {
  const { t } = useTranslation('entity');
  const chips = [t('chipPlaceholder'), t('chipPlaceholder'), t('chipPlaceholder')];

  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((label, i) => (
        <li
          key={i}
          className="rounded-md border border-border bg-bg px-3 py-1 text-sm text-muted"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
