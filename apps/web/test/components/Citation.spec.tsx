import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { CitationView } from '@kathapp/shared';
import { Citation } from '../../src/components/Citation';

const link = (label: string) => <a href="/de/sources/s1">{label}</a>;

function citation(over: Partial<CitationView> = {}): CitationView {
  return {
    id: 'c1',
    sourceId: 's1',
    locus: 'Buch I · 29, 1',
    excerpt: null,
    excerptLatin: null,
    entityType: 'source',
    entityId: 's1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    source: null,
    sourceTitle: null,
    ...over,
  } as CitationView;
}

describe('Citation', () => {
  afterEach(cleanup);

  it('always shows the locus, which is what makes a citation checkable', () => {
    render(<Citation citation={citation()}>{link('s1')}</Citation>);
    expect(screen.getByText('Buch I · 29, 1')).toBeDefined();
  });

  it('shows the Latin wording and the rendering when both exist', () => {
    render(
      <Citation
        citation={citation({
          excerptLatin: 'Etymologia est origo vocabulorum.',
          excerpt: 'Die Etymologie ist der Ursprung der Wörter.',
        })}
      >
        {link('Etymologiae')}
      </Citation>,
    );
    expect(screen.getByText('Etymologia est origo vocabulorum.')).toBeDefined();
    expect(
      screen.getByText('Die Etymologie ist der Ursprung der Wörter.'),
    ).toBeDefined();
  });

  it('marks the Latin wording with its language, for screen readers', () => {
    const { container } = render(
      <Citation citation={citation({ excerptLatin: 'Etymologia est origo.' })}>
        {link('Etymologiae')}
      </Citation>,
    );
    expect(container.querySelector('[lang="la"]')?.textContent).toBe(
      'Etymologia est origo.',
    );
  });

  it('keeps the link element it was given, so routing survives', () => {
    render(<Citation citation={citation()}>{link('Etymologiae')}</Citation>);
    const rendered = screen.getByRole('link', { name: 'Etymologiae' });
    expect(rendered.getAttribute('href')).toBe('/de/sources/s1');
  });

  it('lays its own styling onto that link', () => {
    render(<Citation citation={citation()}>{link('Etymologiae')}</Citation>);
    expect(screen.getByRole('link').className).toContain('underline-offset-4');
  });

  it('renders nothing for an excerpt that is not there', () => {
    const { container } = render(
      <Citation citation={citation()}>{link('s1')}</Citation>,
    );
    expect(container.querySelector('[lang="la"]')).toBeNull();
  });
});
