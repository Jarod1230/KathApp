import type { ReactNode } from 'react';

type Tone = 'error' | 'denied' | 'gates';

const TONES: Record<Tone, string> = {
  error: 'border-danger/40 bg-danger/10 text-danger',
  denied: 'border-warning/40 bg-warning/10 text-warning',
  // Same palette as `error` on purpose: a failed publish gate is a refusal,
  // not a warning. The tone stays separate so styling can diverge later.
  gates: 'border-danger/40 bg-danger/10 text-danger',
};

export interface BannerProps {
  tone: Tone;
  title?: string;
  /** Rendered as a list; used for the publish-gate codes. */
  items?: { key: string; label: string }[] | string[];
  children?: ReactNode;
}

function normalize(items: BannerProps['items']) {
  return (items ?? []).map((item) =>
    typeof item === 'string' ? { key: item, label: item } : item,
  );
}

export function Banner({ tone, title, items, children }: BannerProps) {
  return (
    <div
      role="alert"
      data-tone={tone}
      className={`rounded-sm border p-3 text-sm ${TONES[tone]}`}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? (
        <div className={title ? 'mt-1' : undefined}>{children}</div>
      ) : null}
      {items?.length ? (
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {normalize(items).map((item) => (
            <li key={item.key}>
              <span className="font-mono text-xs">{item.key}</span>
              {item.key === item.label ? null : <>{': '}{item.label}</>}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
