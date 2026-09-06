import type { SuggestionStatus } from '@kathapp/shared';
import type { ApiError } from './api';

/** Status chip token colors: accepted→success, rejected→danger, queue states→warning. */
export function suggestionStatusChipClass(status: SuggestionStatus | string): string {
  const base =
    'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize';
  switch (status) {
    case 'accepted':
      return `${base} border-success/40 bg-success/10 text-success`;
    case 'rejected':
      return `${base} border-danger/40 bg-danger/10 text-danger`;
    case 'submitted':
    case 'in_review':
      return `${base} border-warning/40 bg-warning/10 text-warning`;
    default:
      return `${base} border-border bg-surface text-muted`;
  }
}

export type ClassifiedApiError =
  | { kind: 'auth'; status: number; message: string }
  | { kind: 'gates'; status: number; message: string; gates: string[] }
  | { kind: 'other'; status: number; message: string };

export function classifyApiError(err: ApiError): ClassifiedApiError {
  if (err.status === 401 || err.status === 403) {
    return { kind: 'auth', status: err.status, message: err.message };
  }
  if (err.status === 400 && err.gates && err.gates.length > 0) {
    return {
      kind: 'gates',
      status: err.status,
      message: err.message,
      gates: err.gates,
    };
  }
  return { kind: 'other', status: err.status, message: err.message };
}

export function GateFailureList({
  title,
  gates,
  labelFor,
}: {
  title: string;
  gates: string[];
  labelFor: (code: string) => string;
}) {
  return (
    <div
      className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger"
      role="alert"
    >
      <p className="font-medium">{title}</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {gates.map((code) => (
          <li key={code}>
            <span className="font-mono text-xs">{code}</span>
            {': '}
            {labelFor(code)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <p
      className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning"
      role="alert"
    >
      {message}
    </p>
  );
}

export function GenericErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}
