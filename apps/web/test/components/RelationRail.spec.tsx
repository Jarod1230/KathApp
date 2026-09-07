import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { EdgeChip } from '@kathapp/shared';
import { RelationRail } from '../../src/components/RelationRail';
import '../../src/i18n';

const edge: EdgeChip = {
  id: 'e1',
  type: 'saint_source',
  relatedEntityType: 'saint',
  relatedId: 'sa1',
  label: 'Isidor von Sevilla',
  citationId: null,
  note: null,
};

describe('RelationRail', () => {
  afterEach(cleanup);

  it('names itself with a heading, so the page keeps an outline', () => {
    render(<RelationRail title="Verknüpft" emptyMessage="Keine" items={[]} />);
    expect(screen.getByRole('heading').textContent).toBe('Verknüpft');
  });

  it('shows the empty message rather than an empty list', () => {
    const { container } = render(
      <RelationRail title="Verknüpft" emptyMessage="Keine Verknüpfungen" items={[]} />,
    );
    expect(screen.getByText('Keine Verknüpfungen')).toBeDefined();
    expect(container.querySelector('a')).toBeNull();
  });

  it('links each relation, with the label the caller supplied', () => {
    render(
      <RelationRail
        title="Verknüpft"
        emptyMessage="Keine"
        items={[{ edge, link: <a href="/de/saints/sa1">Isidor von Sevilla</a> }]}
      />,
    );
    const rendered = screen.getByRole('link');
    expect(rendered.getAttribute('href')).toBe('/de/saints/sa1');
    expect(rendered.textContent).toContain('Isidor von Sevilla');
  });

  it('keys by edge id, so two relations to the same entity both render', () => {
    render(
      <RelationRail
        title="Verknüpft"
        emptyMessage="Keine"
        items={[
          { edge, link: <a href="/de/saints/sa1">Erster</a> },
          { edge: { ...edge, id: 'e2' }, link: <a href="/de/saints/sa1">Zweiter</a> },
        ]}
      />,
    );
    expect(screen.getAllByRole('link').length).toBe(2);
  });
});
