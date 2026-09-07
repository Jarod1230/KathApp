import type { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  byline,
}: {
  kicker?: string;
  title: string;
  byline?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-5">
      {kicker ? (
        <p
          data-slot="kicker"
          className="text-xs uppercase tracking-label text-accent-text"
        >
          {kicker}
        </p>
      ) : null}
      <h1 className="text-balance font-serif text-display leading-tight">
        {title}
      </h1>
      {byline ? (
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          {byline}
        </p>
      ) : null}
    </header>
  );
}

/** A labelled hairline. The label is a real heading so the outline survives. */
export function SectionRule({ label }: { label: string }) {
  return (
    <div className="mb-4 mt-8 flex items-center gap-3">
      <h2 className="whitespace-nowrap text-xs uppercase tracking-label text-muted">
        {label}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-measure font-serif text-base leading-prose">
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-muted">{message}</p>;
}
