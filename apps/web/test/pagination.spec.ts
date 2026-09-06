import { describe, expect, it } from 'vitest';
import { pageState } from '../src/lib/pagination';

describe('pageState', () => {
  it('describes the first page of several', () => {
    const state = pageState({ total: 45, limit: 20, offset: 0 });

    expect(state).toMatchObject({
      page: 1,
      pageCount: 3,
      hasPrevious: false,
      hasNext: true,
      firstShown: 1,
      lastShown: 20,
    });
  });

  it('describes a middle page', () => {
    const state = pageState({ total: 45, limit: 20, offset: 20 });

    expect(state).toMatchObject({
      page: 2,
      hasPrevious: true,
      hasNext: true,
      firstShown: 21,
      lastShown: 40,
    });
  });

  it('does not run the last page past the total', () => {
    const state = pageState({ total: 45, limit: 20, offset: 40 });

    expect(state).toMatchObject({
      page: 3,
      hasNext: false,
      firstShown: 41,
      lastShown: 45,
    });
  });

  it('reports a single page when everything fits', () => {
    const state = pageState({ total: 5, limit: 20, offset: 0 });

    expect(state).toMatchObject({
      page: 1,
      pageCount: 1,
      hasPrevious: false,
      hasNext: false,
    });
  });

  it('handles an empty result set without dividing by zero', () => {
    const state = pageState({ total: 0, limit: 20, offset: 0 });

    expect(state).toMatchObject({
      page: 1,
      pageCount: 0,
      hasPrevious: false,
      hasNext: false,
      firstShown: 0,
      lastShown: 0,
    });
  });

  it('offers a way back when the offset is past the end of the results', () => {
    const state = pageState({ total: 10, limit: 20, offset: 100 });

    expect(state.hasNext).toBe(false);
    expect(state.hasPrevious).toBe(true);
    expect(state.previousOffset).toBe(80);
  });
});
