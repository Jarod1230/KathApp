import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { hasTestDatabase, migrateTestSchema, testDatabaseUrl } from './db';

/**
 * The paging regression that prompted this file was invisible to the
 * service-level tests: the service was fine, the controller rejected the
 * request before reaching it. Exercise the real HTTP surface.
 */
describe.skipIf(!hasTestDatabase)('GET /v1/search over HTTP', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    migrateTestSchema();
    process.env.DATABASE_URL = testDatabaseUrl;
    process.env.JWT_SECRET ??= 'test-secret-not-the-placeholder';

    const { NestFactory } = await import('@nestjs/core');
    const { AppModule } = await import('../../src/app.module');
    const { configureApp } = await import('../../src/bootstrap');
    app = await NestFactory.create(AppModule, { logger: false });
    // Same global configuration as production, or the test proves nothing
    // about the pipes a real request goes through.
    configureApp(app);
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  const get = (query: string) => fetch(`${baseUrl}/v1/search${query}`);

  it('answers a plain query with no paging parameters', async () => {
    const res = await get('?q=zzprobe');

    expect(res.status).toBe(200);
  });

  it('answers when only limit is given', async () => {
    const res = await get('?q=zzprobe&limit=5');

    expect(res.status).toBe(200);
    expect((await res.json()).limit).toBe(5);
  });

  it('answers when only offset is given', async () => {
    const res = await get('?q=zzprobe&offset=10');

    expect(res.status).toBe(200);
    expect((await res.json()).offset).toBe(10);
  });

  it('answers with no query string at all', async () => {
    const res = await get('');

    expect(res.status).toBe(200);
  });

  it('clamps rather than rejecting a non-numeric limit, as ADR 0004 requires', async () => {
    const res = await get('?q=zzprobe&limit=abc');

    expect(res.status).toBe(200);
    expect((await res.json()).limit).toBe(20);
  });

  it('clamps an oversized limit instead of rejecting it', async () => {
    const res = await get('?q=zzprobe&limit=9999');

    expect(res.status).toBe(200);
    expect((await res.json()).limit).toBe(100);
  });

  it('clamps a negative offset instead of rejecting it', async () => {
    const res = await get('?q=zzprobe&offset=-5');

    expect(res.status).toBe(200);
    expect((await res.json()).offset).toBe(0);
  });
});
