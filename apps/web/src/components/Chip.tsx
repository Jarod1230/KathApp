import { useTranslation } from 'react-i18next';
import type { PublicEntityKind, SuggestionStatus } from '@kathapp/shared';

const BASE =
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs uppercase tracking-label';

export function EntityKindChip({ kind }: { kind: PublicEntityKind }) {
  const { t } = useTranslation('entity');
  return (
    <span data-testid="chip" data-kind={kind} className={`${BASE} text-muted`}>
      {t(`chips.${kind}`)}
    </span>
  );
}

const RESOLVED: readonly SuggestionStatus[] = ['accepted', 'rejected'];

export function SuggestionStatusChip({ status }: { status: SuggestionStatus }) {
  const resolved = RESOLVED.includes(status);
  return (
    <span
      data-testid="chip"
      data-status={status}
      data-resolved={resolved ? 'true' : 'false'}
      className={`${BASE} ${resolved ? 'text-muted' : 'text-accent'}`}
    >
      {status}
    </span>
  );
}
