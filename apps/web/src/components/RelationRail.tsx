import type { ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { EdgeChip } from '@kathapp/shared';

/**
 * Relations as a side column. Like Citation, each link arrives already built
 * so client-side routing is not lost to a plain anchor.
 */
export function RelationRail({
  title,
  emptyMessage,
  items,
}: {
  title: string;
  emptyMessage: string;
  items: { edge: EdgeChip; link: ReactNode }[];
}) {
  return (
    <aside className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-label text-muted">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        items.map(({ edge, link }) => (
          <Slot
            key={edge.id}
            className="flex flex-col gap-0.5 border-l-2 border-accent bg-bg px-3 py-2 no-underline"
          >
            {link}
          </Slot>
        ))
      )}
    </aside>
  );
}
