import { describe, expect, it } from 'vitest';
import { EDGE_ENDPOINT_KINDS, EDGE_TYPES, type EdgeType } from '../src/index';

describe('EDGE_ENDPOINT_KINDS', () => {
  it('covers every edge type, so a new type cannot be forgotten', () => {
    for (const type of EDGE_TYPES) {
      expect(EDGE_ENDPOINT_KINDS[type]).toBeDefined();
    }
    expect(Object.keys(EDGE_ENDPOINT_KINDS).sort()).toEqual(
      [...EDGE_TYPES].sort(),
    );
  });

  it('encodes the Contract-v1 convention that the name reads from → to', () => {
    // saint_miracle → fromId is a Saint, toId is a Miracle.
    for (const type of EDGE_TYPES) {
      const [left, right] = (type as string).split('_');
      expect(EDGE_ENDPOINT_KINDS[type as EdgeType]).toEqual({
        from: left,
        to: right,
      });
    }
  });

  it('names the endpoints of saint_miracle', () => {
    expect(EDGE_ENDPOINT_KINDS.saint_miracle).toEqual({
      from: 'saint',
      to: 'miracle',
    });
  });

  it('names the endpoints of miracle_source', () => {
    expect(EDGE_ENDPOINT_KINDS.miracle_source).toEqual({
      from: 'miracle',
      to: 'source',
    });
  });

  it('names the endpoints of saint_source', () => {
    expect(EDGE_ENDPOINT_KINDS.saint_source).toEqual({
      from: 'saint',
      to: 'source',
    });
  });
});
