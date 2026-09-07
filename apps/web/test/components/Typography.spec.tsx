import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
  EmptyState,
  PageHeader,
  Prose,
  SectionRule,
} from '../../src/components/Typography';

describe('PageHeader', () => {
  afterEach(cleanup);

  it('renders the title as the page heading', () => {
    render(<PageHeader title="Etymologiae" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Etymologiae',
    );
  });

  it('renders kicker and byline when given', () => {
    render(<PageHeader kicker="Quelle" title="Etymologiae" byline="Latein" />);
    expect(screen.getByText('Quelle')).toBeDefined();
    expect(screen.getByText('Latein')).toBeDefined();
  });

  it('omits the kicker element entirely when none is given', () => {
    const { container } = render(<PageHeader title="Etymologiae" />);
    expect(container.querySelector('[data-slot="kicker"]')).toBeNull();
  });
});

describe('SectionRule', () => {
  afterEach(cleanup);

  it('renders its label as a level-two heading, so the page keeps an outline', () => {
    render(<SectionRule label="Belegstellen" />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      'Belegstellen',
    );
  });
});

describe('Prose', () => {
  afterEach(cleanup);

  it('caps the line length, which is the whole point of the component', () => {
    const { container } = render(<Prose>Text</Prose>);
    expect(container.firstElementChild?.className).toContain('max-w-measure');
  });
});

describe('EmptyState', () => {
  afterEach(cleanup);

  it('shows its message without claiming to be an error', () => {
    render(<EmptyState message="Keine veröffentlichten Treffer." />);
    expect(screen.getByText('Keine veröffentlichten Treffer.')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
