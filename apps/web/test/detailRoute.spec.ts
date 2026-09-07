import { describe, expect, it } from 'vitest';
import { PUBLIC_ENTITY_KINDS } from '@kathapp/shared';
import { DETAIL_ROUTE, detailRoute } from '../src/lib/detailRoute';

describe('detailRoute', () => {
  it('maps every public entity kind, so a new one cannot fall through', () => {
    expect(Object.keys(DETAIL_ROUTE).sort()).toEqual([...PUBLIC_ENTITY_KINDS].sort());
  });

  it('returns the router paths, not assembled strings', () => {
    expect(detailRoute('saint')).toBe('/$locale/saints/$id');
    expect(detailRoute('miracle')).toBe('/$locale/miracles/$id');
    expect(detailRoute('source')).toBe('/$locale/sources/$id');
  });

  it('keeps the plural segments the API path builder also uses', () => {
    for (const kind of PUBLIC_ENTITY_KINDS) {
      expect(detailRoute(kind)).toContain(`/${kind}s/`);
    }
  });
});
