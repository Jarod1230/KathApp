import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { EdgeType, EntityType, PublishStatus } from '@prisma/client';
import { EntitiesService } from '../../src/v1/entities.service';
import type { PrismaService } from '../../src/prisma/prisma.service';
import {
  countingClient,
  disconnect,
  hasTestDatabase,
  migrateTestSchema,
  prisma,
  resetDomainTables,
} from './db';
import {
  seedCitation,
  seedEdge,
  seedMiracle,
  seedSaint,
  seedSource,
} from './fixtures';

describe.skipIf(!hasTestDatabase)('EntitiesService publish gate', () => {
  let service: EntitiesService;

  beforeAll(() => {
    migrateTestSchema();
    service = new EntitiesService(prisma() as unknown as PrismaService);
  }, 60_000);

  beforeEach(async () => {
    await resetDomainTables();
  });

  afterAll(async () => {
    await disconnect();
  });

  async function publishedSaintWithCitationTo(
    sourceOptions: Parameters<typeof seedSource>[0],
  ): Promise<string> {
    const saintId = await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: 'Stub Saint (dev)' }],
    });
    const sourceId = await seedSource(sourceOptions);
    await seedCitation({
      sourceId,
      entityType: EntityType.saint,
      entityId: saintId,
    });
    return saintId;
  }

  it('serves a citation whose source is published', async () => {
    const saintId = await publishedSaintWithCitationTo({
      translations: [
        { locale: 'de', field: 'title', value: 'Stub Source (dev)' },
      ],
    });

    const detail = await service.getDetail('saint', saintId, 'de');

    expect(detail.citations).toHaveLength(1);
    expect(detail.citations[0].sourceTitle).toBe('Stub Source (dev)');
  });

  it('hides a citation whose source is still a draft', async () => {
    const saintId = await publishedSaintWithCitationTo({
      status: PublishStatus.draft,
      shelfmark: 'UNPUBLISHED-SHELFMARK',
      translations: [
        { locale: 'de', field: 'title', value: 'Stub Draft Source (dev)' },
      ],
    });

    const detail = await service.getDetail('saint', saintId, 'de');

    expect(detail.citations).toEqual([]);
  });

  it('never leaks draft source metadata onto a public detail page', async () => {
    const saintId = await publishedSaintWithCitationTo({
      status: PublishStatus.draft,
      shelfmark: 'UNPUBLISHED-SHELFMARK',
    });

    const detail = await service.getDetail('saint', saintId, 'de');

    expect(JSON.stringify(detail)).not.toContain('UNPUBLISHED-SHELFMARK');
  });

  it('hides a citation whose source is soft-deleted', async () => {
    const saintId = await publishedSaintWithCitationTo({ deleted: true });

    const detail = await service.getDetail('saint', saintId, 'de');

    expect(detail.citations).toEqual([]);
  });

  it('hides an edge chip pointing at a draft entity', async () => {
    const saintId = await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: 'Stub Saint (dev)' }],
    });
    const miracleId = await seedMiracle({ status: PublishStatus.draft });
    await seedEdge({
      type: EdgeType.saint_miracle,
      fromId: saintId,
      toId: miracleId,
    });

    const detail = await service.getDetail('saint', saintId, 'de');

    expect(detail.edges).toEqual([]);
  });

  it('serves an edge chip pointing at a published entity', async () => {
    const saintId = await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: 'Stub Saint (dev)' }],
    });
    const miracleId = await seedMiracle({
      translations: [
        { locale: 'de', field: 'title', value: 'Stub Miracle (dev)' },
      ],
    });
    await seedEdge({
      type: EdgeType.saint_miracle,
      fromId: saintId,
      toId: miracleId,
    });

    const detail = await service.getDetail('saint', saintId, 'de');

    expect(detail.edges).toHaveLength(1);
    expect(detail.edges[0].label).toBe('Stub Miracle (dev)');
  });

  it('falls back to another locale for a related entity label', async () => {
    const saintId = await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: 'Stub Saint (dev)' }],
    });
    const miracleId = await seedMiracle({
      translations: [
        { locale: 'de', field: 'title', value: 'Stub Miracle (dev)' },
      ],
    });
    await seedEdge({
      type: EdgeType.saint_miracle,
      fromId: saintId,
      toId: miracleId,
    });

    const detail = await service.getDetail('saint', saintId, 'la');

    expect(detail.edges[0].label).toBe('Stub Miracle (dev)');
  });
});

describe.skipIf(!hasTestDatabase)('EntitiesService query volume', () => {
  const counter = countingClient();
  let service: EntitiesService;

  beforeAll(() => {
    migrateTestSchema();
    service = new EntitiesService(counter.client as unknown as PrismaService);
  }, 60_000);

  beforeEach(async () => {
    await resetDomainTables();
  });

  afterAll(async () => {
    await disconnect();
  });

  async function saintWith(relations: number): Promise<string> {
    const saintId = await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: 'Stub Saint (dev)' }],
    });
    for (let i = 0; i < relations; i++) {
      const sourceId = await seedSource({
        translations: [
          { locale: 'de', field: 'title', value: `Stub Source (dev) ${i}` },
        ],
      });
      await seedCitation({
        sourceId,
        entityType: EntityType.saint,
        entityId: saintId,
      });
      const miracleId = await seedMiracle({
        translations: [
          { locale: 'de', field: 'title', value: `Stub Miracle (dev) ${i}` },
        ],
      });
      await seedEdge({
        type: EdgeType.saint_miracle,
        fromId: saintId,
        toId: miracleId,
      });
    }
    return saintId;
  }

  it('issues the same number of queries for 2 relations as for 20', async () => {
    const few = await saintWith(2);
    counter.reset();
    await service.getDetail('saint', few, 'de');
    const forFew = counter.count();

    await resetDomainTables();
    const many = await saintWith(20);
    counter.reset();
    await service.getDetail('saint', many, 'de');
    const forMany = counter.count();

    expect(forFew).toBeGreaterThan(0);
    expect(forMany).toBe(forFew);
  });
});
