import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { HealthController } from '../../src/health.controller';
import type { PrismaService } from '../../src/prisma/prisma.service';
import { hasTestDatabase, migrateTestSchema, prisma } from './db';

describe.skipIf(!hasTestDatabase)('HealthController', () => {
  let healthy: HealthController;
  let broken: HealthController;
  let brokenClient: PrismaClient;

  beforeAll(() => {
    migrateTestSchema();
    healthy = new HealthController(prisma() as unknown as PrismaService);
    brokenClient = new PrismaClient({
      datasources: {
        db: { url: 'postgresql://nobody:nobody@127.0.0.1:1/absent' },
      },
    });
    broken = new HealthController(brokenClient as unknown as PrismaService);
  }, 60_000);

  afterAll(async () => {
    await brokenClient.$disconnect().catch(() => undefined);
  });

  it('reports liveness without touching the database', async () => {
    // Liveness must not depend on Postgres, or an outage would make an
    // orchestrator restart a process that is perfectly healthy.
    const result = await broken.getHealth();

    expect(result.status).toBe('ok');
  });

  it('reports ready when the database answers', async () => {
    const result = await healthy.getReadiness();

    expect(result.status).toBe('ready');
    expect(result.database).toBe('up');
  });

  it('reports not ready when the database is unreachable', async () => {
    await expect(broken.getReadiness()).rejects.toMatchObject({
      status: 503,
    });
  }, 30_000);
});
