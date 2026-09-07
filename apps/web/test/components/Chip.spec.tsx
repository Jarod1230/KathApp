import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PUBLIC_ENTITY_KINDS, SUGGESTION_STATUSES } from '@kathapp/shared';
import { EntityKindChip, SuggestionStatusChip } from '../../src/components/Chip';
import '../../src/i18n';

describe('EntityKindChip', () => {
  afterEach(cleanup);

  it('covers every public entity kind, so a new one cannot fall through', () => {
    for (const kind of PUBLIC_ENTITY_KINDS) {
      cleanup();
      render(<EntityKindChip kind={kind} />);
      const chip = screen.getByTestId('chip');
      expect(chip.getAttribute('data-kind')).toBe(kind);
      expect(chip.textContent?.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('SuggestionStatusChip', () => {
  afterEach(cleanup);

  it('covers every suggestion status', () => {
    for (const status of SUGGESTION_STATUSES) {
      cleanup();
      render(<SuggestionStatusChip status={status} />);
      const chip = screen.getByTestId('chip');
      expect(chip.getAttribute('data-status')).toBe(status);
      expect(chip.textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  it('separates resolved statuses from open ones', () => {
    render(<SuggestionStatusChip status="accepted" />);
    expect(screen.getByTestId('chip').getAttribute('data-resolved')).toBe('true');
  });

  it('marks a submitted suggestion as still open', () => {
    render(<SuggestionStatusChip status="submitted" />);
    expect(screen.getByTestId('chip').getAttribute('data-resolved')).toBe('false');
  });
});
