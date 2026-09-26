import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import Ajv, { type ValidateFunction } from 'ajv';
import {
  RESPONSE_SCHEMAS,
  type ResponseSchemaName,
} from '../../src/openapi/schemas';
import {
  hasTestDatabase,
  migrateTestSchema,
  prisma,
  resetDomainTables,
  testDatabaseUrl,
} from './db';

/**
 * The OpenAPI document is only useful if it describes what the API actually
 * returns. A hand-written schema that drifts from the code is worse than no
 * schema, because a consumer believes it.
 *
 * So the schemas are not reviewed, they are checked: every response below is a
 * real HTTP response from the real app, validated against the schema the
 * document publishes.
 */
describe.skipIf(!hasTestDatabase)('published schemas match real responses', () => {
  let app: INestApplication;
  let baseUrl: string;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validators = new Map<string, ValidateFunction>();

  function check(name: ResponseSchemaName, body: unknown): void {
    let validate = validators.get(name);
    if (!validate) {
      validate = ajv.compile(RESPONSE_SCHEMAS[name]);
      validators.set(name, validate);
    }
    const valid = validate(body);
    expect(
      valid,
      `${name} does not match its published schema:\n` +
        ajv.errorsText(validate.errors, { separator: '\n' }) +
        `\n\nreceived: ${JSON.stringify(body, null, 2)}`,
    ).toBe(true);
  }

  beforeAll(async () => {
    migrateTestSchema();
    process.env.DATABASE_URL = testDatabaseUrl;
    process.env.JWT_SECRET ??= 'test-secret-not-the-placeholder';
    process.env.AUTH_DEV_LOGIN = 'true';

    const { NestFactory } = await import('@nestjs/core');
    const { AppModule } = await import('../../src/app.module');
    const { configureApp } = await import('../../src/bootstrap');
    app = await NestFactory.create(AppModule, { logger: false });
    configureApp(app);
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', '127.0.0.1');

    await resetDomainTables();
  }, 60_000);

  afterAll(async () => {
    await app?.close();
  });

  const get = (path: string, token?: string) =>
    fetch(`${baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  it('GET /health', async () => {
    const res = await get('/health');
    expect(res.status).toBe(200);
    check('Health', await res.json());
  });

  it('GET /health/ready', async () => {
    const res = await get('/health/ready');
    expect(res.status).toBe(200);
    check('Readiness', await res.json());
  });

  it('GET /v1', async () => {
    const res = await get('/v1');
    expect(res.status).toBe(200);
    check('ApiRoot', await res.json());
  });

  it('GET /v1/search on an empty database', async () => {
    const res = await get('/v1/search?q=zzprobe');
    expect(res.status).toBe(200);
    check('SearchResponse', await res.json());
  });

  it('GET /v1/search with a hit', async () => {
    const saint = await prisma().saint.create({ data: { status: 'published' } });
    await prisma().translation.create({
      data: {
        entityType: 'saint',
        entityId: saint.id,
        locale: 'de',
        field: 'name',
        value: 'Stub Entity (dev) zzprobe',
      },
    });

    const res = await get('/v1/search?q=zzprobe');
    const body = await res.json();

    expect(body.items.length).toBe(1);
    check('SearchResponse', body);
  });

  it('GET /v1/saints/:id', async () => {
    const saint = await prisma().saint.create({ data: { status: 'published' } });
    await prisma().translation.create({
      data: {
        entityType: 'saint',
        entityId: saint.id,
        locale: 'de',
        field: 'name',
        value: 'Stub Entity (dev)',
      },
    });

    const res = await get(`/v1/saints/${saint.id}`);
    expect(res.status).toBe(200);
    check('EntityDetailResponse', await res.json());
  });

  it('GET /v1/sources/:id carries its entity payload', async () => {
    const source = await prisma().source.create({
      data: { status: 'published', language: 'la', author: 'Stub (dev)', year: 630 },
    });

    const res = await get(`/v1/sources/${source.id}`);
    const body = await res.json();

    expect(body.source).toBeDefined();
    check('EntityDetailResponse', body);
  });

  it('POST /v1/auth/dev-login', async () => {
    const res = await fetch(`${baseUrl}/v1/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'schema@example.org', role: 'reviewer' }),
    });
    expect(res.status).toBe(201);
    check('AuthSession', await res.json());
  });

  it('GET /v1/auth/me', async () => {
    const login = await fetch(`${baseUrl}/v1/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'schema-me@example.org' }),
    });
    const { accessToken } = await login.json();

    const res = await get('/v1/auth/me', accessToken);
    expect(res.status).toBe(200);
    check('AuthUser', await res.json());
  });

  it('GET /v1/suggestions', async () => {
    const login = await fetch(`${baseUrl}/v1/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'schema-rev@example.org', role: 'reviewer' }),
    });
    const { accessToken, user } = await login.json();

    await prisma().suggestion.create({
      data: {
        entityType: 'saint',
        status: 'submitted',
        schemaVersion: 1,
        payload: { kind: 'entity', entityType: 'saint', op: 'create' },
        submittedByUserId: user.id,
      },
    });

    const res = await get('/v1/suggestions', accessToken);
    const body = await res.json();

    expect(body.length).toBeGreaterThan(0);
    check('SuggestionList', body);
  });
});
