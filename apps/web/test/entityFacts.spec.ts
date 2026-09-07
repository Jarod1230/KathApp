import { describe, expect, it } from 'vitest';
import type { EntityDetailResponse } from '@kathapp/shared';
import { entityFacts } from '../src/lib/entityFacts';

function detail(over: Partial<EntityDetailResponse>): EntityDetailResponse {
  return {
    entityType: 'saint',
    id: 'x',
    locale: 'de',
    status: 'published',
    label: 'Stub Entity (dev)',
    translations: [],
    citations: [],
    edges: [],
    ...over,
  } as EntityDetailResponse;
}

const stamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('entityFacts', () => {
  it('returns nothing when an entity carries no facts', () => {
    expect(entityFacts(detail({}))).toEqual([]);
  });

  it('reports a saint feast note', () => {
    const facts = entityFacts(
      detail({
        entityType: 'saint',
        saint: { id: 'x', status: 'published', feastNote: '4. April', ...stamps },
      }),
    );
    expect(facts).toEqual([{ labelKey: 'detail.feastNote', value: '4. April' }]);
  });

  it('reports a death year and marks an approximate one', () => {
    const exact = entityFacts(
      detail({
        entityType: 'saint',
        saint: { id: 'x', status: 'published', deathYear: 636, ...stamps },
      }),
    );
    expect(exact).toEqual([{ labelKey: 'detail.deathYear', value: '636' }]);

    const approx = entityFacts(
      detail({
        entityType: 'saint',
        saint: {
          id: 'x',
          status: 'published',
          deathYear: 636,
          deathYearApprox: true,
          ...stamps,
        },
      }),
    );
    expect(approx).toEqual([{ labelKey: 'detail.deathYear', value: 'um 636' }]);
  });

  it('reports a miracle approximate date', () => {
    const facts = entityFacts(
      detail({
        entityType: 'miracle',
        miracle: { id: 'x', status: 'published', approxDate: '7. Jh.', ...stamps },
      }),
    );
    expect(facts).toEqual([{ labelKey: 'detail.approxDate', value: '7. Jh.' }]);
  });

  it('reports language, author and year for a source, in that order', () => {
    const facts = entityFacts(
      detail({
        entityType: 'source',
        source: {
          id: 'x',
          status: 'published',
          language: 'la',
          author: 'Isidor von Sevilla',
          year: 630,
          ...stamps,
        },
      }),
    );
    expect(facts.map((f) => f.labelKey)).toEqual([
      'detail.language',
      'detail.author',
      'detail.year',
    ]);
    expect(facts[2].value).toBe('630');
  });

  it('skips absent optional facts rather than showing an empty row', () => {
    const facts = entityFacts(
      detail({
        entityType: 'source',
        source: { id: 'x', status: 'published', language: 'la', ...stamps },
      }),
    );
    expect(facts).toEqual([{ labelKey: 'detail.language', value: 'la' }]);
  });

  it('ignores a payload that does not match the entity type', () => {
    // The API returns exactly one of saint/miracle/source; a mismatch is a bug
    // elsewhere and must not surface as a stray row.
    const facts = entityFacts(
      detail({
        entityType: 'miracle',
        saint: { id: 'x', status: 'published', feastNote: '4. April', ...stamps },
      }),
    );
    expect(facts).toEqual([]);
  });
});
