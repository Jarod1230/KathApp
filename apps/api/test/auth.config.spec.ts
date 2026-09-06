import { describe, expect, it } from 'vitest';
import {
  DEV_JWT_SECRET_PLACEHOLDER,
  isDevLoginEnabled,
  resolveJwtSecret,
} from '../src/auth/auth.config';

describe('resolveJwtSecret', () => {
  it('returns the configured secret', () => {
    expect(resolveJwtSecret({ JWT_SECRET: 'a-real-secret' })).toBe(
      'a-real-secret',
    );
  });

  it('refuses to start when no secret is configured', () => {
    expect(() => resolveJwtSecret({})).toThrow(/JWT_SECRET/);
  });

  it('refuses a blank secret', () => {
    expect(() => resolveJwtSecret({ JWT_SECRET: '   ' })).toThrow(/JWT_SECRET/);
  });

  it('refuses the placeholder from .env.example when NODE_ENV is unset', () => {
    // The dangerous case: a deployment that never sets NODE_ENV would
    // otherwise sign tokens with a secret published in the repository.
    expect(() =>
      resolveJwtSecret({ JWT_SECRET: DEV_JWT_SECRET_PLACEHOLDER }),
    ).toThrow(/placeholder/i);
  });

  it('refuses the placeholder in production', () => {
    expect(() =>
      resolveJwtSecret({
        JWT_SECRET: DEV_JWT_SECRET_PLACEHOLDER,
        NODE_ENV: 'production',
      }),
    ).toThrow(/placeholder/i);
  });

  it('allows the placeholder only in explicit development', () => {
    expect(
      resolveJwtSecret({
        JWT_SECRET: DEV_JWT_SECRET_PLACEHOLDER,
        NODE_ENV: 'development',
      }),
    ).toBe(DEV_JWT_SECRET_PLACEHOLDER);
  });
});

describe('isDevLoginEnabled', () => {
  it('is off when nothing is configured', () => {
    expect(isDevLoginEnabled({})).toBe(false);
  });

  it('is off when NODE_ENV is unset', () => {
    // `node dist/main.js` sets no NODE_ENV. The endpoint mints admin tokens
    // for any email, so an unset environment must not switch it on.
    expect(isDevLoginEnabled({ AUTH_DEV_LOGIN: undefined })).toBe(false);
  });

  it('is off in production even when NODE_ENV says so', () => {
    expect(isDevLoginEnabled({ NODE_ENV: 'production' })).toBe(false);
  });

  it('stays off in development unless the flag is set', () => {
    expect(isDevLoginEnabled({ NODE_ENV: 'development' })).toBe(false);
  });

  it('is on only when explicitly enabled', () => {
    expect(isDevLoginEnabled({ AUTH_DEV_LOGIN: 'true' })).toBe(true);
  });

  it('is off for values that merely look truthy', () => {
    for (const value of ['1', 'yes', 'TRUE', 'on', '']) {
      expect(isDevLoginEnabled({ AUTH_DEV_LOGIN: value })).toBe(false);
    }
  });

  it('is off when explicitly disabled', () => {
    expect(isDevLoginEnabled({ AUTH_DEV_LOGIN: 'false' })).toBe(false);
  });
});
