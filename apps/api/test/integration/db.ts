import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

/**
 * Integration tests run against a real Postgres, in a dedicated schema so they
 * never touch a developer's working data. Set TEST_DATABASE_URL to opt in.
 *
 * CI must set it. A silently skipped suite is exactly the kind of green-but-
 * empty signal this repository already had once, so fail loudly there instead.
 */
export const testDatabaseUrl = process.env.TEST_DATABASE_URL;
export const hasTestDatabase = Boolean(testDatabaseUrl);

if (!hasTestDatabase && process.env.CI) {
  throw new Error(
    'TEST_DATABASE_URL is required in CI so integration tests cannot be skipped silently.',
  );
}

let client: PrismaClient | null = null;

export function prisma(): PrismaClient {
  if (!client) {
    client = new PrismaClient({
      datasources: { db: { url: testDatabaseUrl } },
    });
  }
  return client;
}

/**
 * A client that counts the operations run through it, to guard against N+1.
 *
 * This uses a client extension rather than the `query` log event on purpose:
 * log events are emitted asynchronously and can land after the awaited work
 * has already resolved, which makes the count race. Extensions wrap each
 * operation inline, so the count is deterministic.
 */
export function countingClient(): {
  client: PrismaClient;
  reset: () => void;
  count: () => number;
} {
  let n = 0;
  const extended = prisma().$extends({
    query: {
      async $allOperations({ args, query }) {
        n += 1;
        return query(args);
      },
    },
  });
  return {
    client: extended as unknown as PrismaClient,
    reset: () => {
      n = 0;
    },
    count: () => n,
  };
}

export function migrateTestSchema(): void {
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'pipe',
  });
}

/** Remove every domain row between tests. CASCADE handles the foreign keys. */
export async function resetDomainTables(): Promise<void> {
  await prisma().$executeRawUnsafe(
    'TRUNCATE TABLE "Suggestion", "Edge", "Citation", "Translation", "Saint", "Miracle", "Source", "User" RESTART IDENTITY CASCADE',
  );
}

export async function disconnect(): Promise<void> {
  if (client) await client.$disconnect();
  client = null;
}
