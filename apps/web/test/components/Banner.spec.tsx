import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Banner } from '../../src/components/Banner';

describe('Banner', () => {
  afterEach(cleanup);

  it('announces itself as an alert so a screen reader reports it', () => {
    render(<Banner tone="error">Suche fehlgeschlagen</Banner>);
    expect(screen.getByRole('alert').textContent).toContain(
      'Suche fehlgeschlagen',
    );
  });

  it('marks the tone so styling and tests can rely on it', () => {
    render(<Banner tone="denied">Keine Berechtigung</Banner>);
    expect(screen.getByRole('alert').getAttribute('data-tone')).toBe('denied');
  });

  it('lists every failed gate, so none is silently dropped', () => {
    render(
      <Banner
        tone="gates"
        title="Publish-Gates nicht erfüllt"
        items={['translation_required', 'citation_required']}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('translation_required');
    expect(alert.textContent).toContain('citation_required');
    expect(alert.querySelectorAll('li').length).toBe(2);
  });

  it('renders a title together with its children', () => {
    render(
      <Banner tone="error" title="Fehler">
        Details
      </Banner>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Fehler');
    expect(alert.textContent).toContain('Details');
  });

  it('renders no list when there are no items', () => {
    render(<Banner tone="error">Nur Text</Banner>);
    expect(screen.getByRole('alert').querySelector('ul')).toBeNull();
  });
});
