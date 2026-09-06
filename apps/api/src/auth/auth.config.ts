/**
 * Environment gates for authentication.
 *
 * Both switches here fail closed. An earlier version derived them from
 * `NODE_ENV !== 'production'`, which is enabled whenever NODE_ENV is unset —
 * including under this project's own `start:prod` script (`node dist/main.js`).
 * A deployment that simply forgot the variable exposed a login endpoint that
 * mints admin tokens for any email address. Neither switch consults NODE_ENV
 * to decide whether to turn something ON any more.
 */

/** The value shipped in .env.example. Never valid outside local development. */
export const DEV_JWT_SECRET_PLACEHOLDER = 'dev-change-me';

type Env = Record<string, string | undefined>;

export function resolveJwtSecret(env: Env): string {
  const secret = (env.JWT_SECRET ?? '').trim();

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. The API refuses to start rather than sign tokens ' +
        'with a built-in fallback.',
    );
  }

  if (secret === DEV_JWT_SECRET_PLACEHOLDER && env.NODE_ENV !== 'development') {
    throw new Error(
      `JWT_SECRET is still the placeholder from .env.example. It is published in ` +
        `the repository, so anyone could forge tokens. Set a real secret, or set ` +
        `NODE_ENV=development for local work.`,
    );
  }

  return secret;
}

/**
 * The dev login must be switched on deliberately. Anything other than the
 * exact string "true" leaves it off, so a stray value cannot enable it.
 */
export function isDevLoginEnabled(env: Env): boolean {
  return env.AUTH_DEV_LOGIN === 'true';
}
