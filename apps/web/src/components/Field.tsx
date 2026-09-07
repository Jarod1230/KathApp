import { useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const CONTROL =
  'w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-text';

/** One generated id per field, so two fields on a page never collide. */
function useFieldIds(explicit?: string) {
  const generated = useId();
  const id = explicit ?? `field-${generated}`;
  return { id, hintId: `${id}-hint` };
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-text">
      {children}
    </label>
  );
}

function Hint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} className="text-xs text-muted">
      {children}
    </span>
  );
}

interface Shared {
  label: string;
  hint?: string;
}

export function TextField({
  label,
  hint,
  id,
  ...rest
}: Shared & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={ids.id}>{label}</Label>
      <input
        {...rest}
        id={ids.id}
        aria-describedby={hint ? ids.hintId : undefined}
        className={CONTROL}
      />
      {hint ? <Hint id={ids.hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  id,
  ...rest
}: Shared & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={ids.id}>{label}</Label>
      <textarea
        {...rest}
        id={ids.id}
        aria-describedby={hint ? ids.hintId : undefined}
        className={CONTROL}
      />
      {hint ? <Hint id={ids.hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  id,
  children,
  ...rest
}: Shared & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(id);
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={ids.id}>{label}</Label>
      <select
        {...rest}
        id={ids.id}
        aria-describedby={hint ? ids.hintId : undefined}
        className={CONTROL}
      >
        {children}
      </select>
      {hint ? <Hint id={ids.hintId}>{hint}</Hint> : null}
    </div>
  );
}
