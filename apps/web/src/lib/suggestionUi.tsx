import type { SuggestionStatus } from '@kathapp/shared';
import { Banner } from '../components/Banner';
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
    <Banner
      tone="gates"
      title={title}
      items={gates.map((code) => ({ key: code, label: labelFor(code) }))}
    />
  );
}

export function AuthErrorBanner({ message }: { message: string }) {
  return <Banner tone="denied">{message}</Banner>;
}

export function GenericErrorBanner({ message }: { message: string }) {
  return <Banner tone="error">{message}</Banner>;
}
