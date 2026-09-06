import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PublishStatus, Role, SuggestionStatus } from '@prisma/client';
import type { AuthUser } from '@kathapp/shared';
import { SuggestionsService } from '../../src/suggestions/suggestions.service';
import type { PrismaService } from '../../src/prisma/prisma.service';
import {
  disconnect,
  hasTestDatabase,
  migrateTestSchema,
  prisma,
  resetDomainTables,
} from './db';
import { seedMiracle, seedSaint, seedSource } from './fixtures';

/** Fixtures stay synthetic; nothing here names a real saint, miracle or source. */
describe.skipIf(!hasTestDatabase)('SuggestionsService edge endpoints', () => {
  let service: SuggestionsService;
  let reviewer: AuthUser;

  beforeAll(() => {
    migrateTestSchema();
    service = new SuggestionsService(prisma() as unknown as PrismaService);
  }, 60_000);

  beforeEach(async () => {
    await resetDomainTables();
    const row = await prisma().user.create({
      data: { email: 'reviewer@example.org', role: Role.reviewer },
    });
    reviewer = { id: row.id, email: row.email, role: 'reviewer' };
  });

  afterAll(async () => {
    await disconnect();
  });

  async function suggestEdge(payload: Record<string, unknown>): Promise<string> {
    const row = await prisma().suggestion.create({
      data: {
        entityType: 'edge',
        status: SuggestionStatus.submitted,
        schemaVersion: 1,
        payload: { kind: 'edge', ...payload },
        submittedByUserId: reviewer.id,
      },
    });
    return row.id;
  }

  const edgeCount = () => prisma().edge.count();

  it('writes an edge whose endpoints exist and match the type', async () => {
    const saintId = await seedSaint({ status: PublishStatus.draft });
    const miracleId = await seedMiracle({ status: PublishStatus.draft });
    const id = await suggestEdge({
      type: 'saint_miracle',
      fromId: saintId,
      toId: miracleId,
    });

    await service.accept(reviewer, id);

    expect(await edgeCount()).toBe(1);
  });

  it('refuses an edge whose fromId does not exist', async () => {
    const miracleId = await seedMiracle({ status: PublishStatus.draft });
    const id = await suggestEdge({
      type: 'saint_miracle',
      fromId: 'does-not-exist',
      toId: miracleId,
    });

    await expect(service.accept(reviewer, id)).rejects.toThrow();
    expect(await edgeCount()).toBe(0);
  });

  it('refuses an edge whose toId does not exist', async () => {
    const saintId = await seedSaint({ status: PublishStatus.draft });
    const id = await suggestEdge({
      type: 'saint_miracle',
      fromId: saintId,
      toId: 'does-not-exist',
    });

    await expect(service.accept(reviewer, id)).rejects.toThrow();
    expect(await edgeCount()).toBe(0);
  });

  it('refuses an endpoint of the wrong kind for the edge type', async () => {
    // saint_miracle must run Saint → Miracle. A Source on the right is not a
    // typo the reader can see later: the read path silently drops such rows.
    const saintId = await seedSaint({ status: PublishStatus.draft });
    const sourceId = await seedSource({ status: PublishStatus.draft });
    const id = await suggestEdge({
      type: 'saint_miracle',
      fromId: saintId,
      toId: sourceId,
    });

    await expect(service.accept(reviewer, id)).rejects.toThrow();
    expect(await edgeCount()).toBe(0);
  });

  it('refuses an edge pointing at a soft-deleted entity', async () => {
    const saintId = await seedSaint({ status: PublishStatus.draft });
    const miracleId = await seedMiracle({
      status: PublishStatus.draft,
      deleted: true,
    });
    const id = await suggestEdge({
      type: 'saint_miracle',
      fromId: saintId,
      toId: miracleId,
    });

    await expect(service.accept(reviewer, id)).rejects.toThrow();
    expect(await edgeCount()).toBe(0);
  });

  it('leaves the suggestion unresolved when the endpoints are rejected', async () => {
    const miracleId = await seedMiracle({ status: PublishStatus.draft });
    const id = await suggestEdge({
      type: 'saint_miracle',
      fromId: 'does-not-exist',
      toId: miracleId,
    });

    await expect(service.accept(reviewer, id)).rejects.toThrow();

    const row = await prisma().suggestion.findFirstOrThrow({ where: { id } });
    expect(row.status).toBe(SuggestionStatus.submitted);
  });

  it('validates edges attached to an entity payload as well', async () => {
    const row = await prisma().suggestion.create({
      data: {
        entityType: 'saint',
        status: SuggestionStatus.submitted,
        schemaVersion: 1,
        payload: {
          kind: 'entity',
          entityType: 'saint',
          op: 'create',
          fields: { status: 'draft' },
          translations: [
            { locale: 'de', field: 'name', value: 'Stub Saint (dev)' },
          ],
          edges: [{ type: 'saint_miracle', relatedId: 'does-not-exist' }],
        },
        submittedByUserId: reviewer.id,
      },
    });

    await expect(service.accept(reviewer, row.id)).rejects.toThrow();
    expect(await edgeCount()).toBe(0);
  });
});
