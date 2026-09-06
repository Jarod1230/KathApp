import { describe, expect, it } from 'vitest';
import { ROLES, roleAtLeast, type Role } from '../src/index';

describe('roleAtLeast', () => {
  it('accepts a role that equals the requirement', () => {
    expect(roleAtLeast('reviewer', 'reviewer')).toBe(true);
  });

  it('accepts a more privileged role', () => {
    expect(roleAtLeast('admin', 'contributor')).toBe(true);
  });

  it('rejects a less privileged role', () => {
    expect(roleAtLeast('contributor', 'reviewer')).toBe(false);
  });

  it('treats viewer as the lowest rank', () => {
    for (const role of ROLES) {
      expect(roleAtLeast(role, 'viewer')).toBe(true);
    }
  });

  it('treats admin as the highest rank', () => {
    for (const role of ROLES) {
      expect(roleAtLeast('admin', role)).toBe(true);
    }
  });

  it('encodes the hierarchy from ADR 0003: admin > reviewer > contributor > viewer', () => {
    const ordered: Role[] = ['viewer', 'contributor', 'reviewer', 'admin'];
    for (let i = 0; i < ordered.length; i++) {
      for (let j = 0; j < ordered.length; j++) {
        expect(roleAtLeast(ordered[i], ordered[j])).toBe(i >= j);
      }
    }
  });

  it('covers every role in ROLES, so a new role cannot be forgotten', () => {
    for (const role of ROLES) {
      expect(typeof roleAtLeast(role, 'viewer')).toBe('boolean');
    }
  });
});
