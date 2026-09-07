import type { ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { CitationView } from '@kathapp/shared';

/**
 * A citation is the provenance of everything around it, so it carries weight
 * on the page rather than sitting in a list of links. The gold rule on hover
 * is one of the three jobs the accent colour is allowed to do.
 *
 * The source link arrives as a child rather than as an href: a plain anchor
 * would reload the page and throw away client-side routing.
 */
export function Citation({
  citation,
  children,
}: {
  citation: CitationView;
  /** The source link, already built by the caller so routing survives. */
  children: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 border-l-2 border-border pb-5 pl-5 transition-colors hover:border-accent">
      <span className="text-xs uppercase tracking-label text-muted">
        {citation.locus}
      </span>
      {citation.excerptLatin ? (
        <p lang="la" className="max-w-measure font-serif italic leading-prose">
          {citation.excerptLatin}
        </p>
      ) : null}
      {citation.excerpt ? (
        <p className="max-w-measure font-serif text-sm leading-prose text-muted">
          {citation.excerpt}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        <Slot className="text-text underline-offset-4 hover:underline">
          {children}
        </Slot>
      </p>
    </div>
  );
}
