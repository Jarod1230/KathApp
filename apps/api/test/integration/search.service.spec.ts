import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PublishStatus } from '@prisma/client';
import { SearchService } from '../../src/v1/search.service';
import type { PrismaService } from '../../src/prisma/prisma.service';
import {
  countingClient,
  disconnect,
  hasTestDatabase,
  migrateTestSchema,
  prisma,
  resetDomainTables,
} from './db';

/**
 * Fixtures are deliberately synthetic. CLAUDE.md forbids anything that could be
 * mistaken for curated domain knowledge, so nothing here names a real saint,
 * miracle or source.
 */
const MATCH = 'zzprobe';

async function seedSaint(opts: {
  status?: PublishStatus;
  deleted?: boolean;
  translations: { locale: string; field: string; value: string }[];
}): Promise<string> {
  const db = prisma();
  const saint = await db.saint.create({
    data: {
      status: opts.status ?? PublishStatus.published,
      deletedAt: opts.deleted ? new Date() : null,
    },
  });
  await db.translation.createMany({
    data: opts.translations.map((t) => ({
      entityType: 'saint' as const,
      entityId: saint.id,
      ...t,
    })),
  });
  return saint.id;
}

async function seedSource(value: string): Promise<string> {
  const db = prisma();
  const source = await db.source.create({
    data: { status: PublishStatus.published, language: 'la' },
  });
  await db.translation.create({
    data: {
      entityType: 'source',
      entityId: source.id,
      locale: 'de',
      field: 'title',
      value,
    },
  });
  return source.id;
}

describe.skipIf(!hasTestDatabase)('SearchService (integration)', () => {
  let service: SearchService;

  beforeAll(() => {
    migrateTestSchema();
    service = new SearchService(prisma() as unknown as PrismaService);
  }, 60_000);

  beforeEach(async () => {
    await resetDomainTables();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('reports every match in total, not just the size of the returned page', async () => {
    for (let i = 0; i < 5; i++) {
      await seedSaint({
        translations: [{ locale: 'de', field: 'name', value: `${MATCH} ${i}` }],
      });
    }

    const result = await service.search({ q: MATCH, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  it('walks through all results with offset without repeating or skipping any', async () => {
    for (let i = 0; i < 5; i++) {
      await seedSaint({
        translations: [{ locale: 'de', field: 'name', value: `${MATCH} ${i}` }],
      });
    }

    const seen: string[] = [];
    for (const offset of [0, 2, 4]) {
      const page = await service.search({ q: MATCH, limit: 2, offset });
      seen.push(...page.items.map((hit) => hit.id));
    }

    expect(new Set(seen).size).toBe(5);
  });

  it('does not let draft entities push published ones out of the result set', async () => {
    // More drafts than any internal candidate cap, all matching the query.
    for (let i = 0; i < 250; i++) {
      await seedSaint({
        status: PublishStatus.draft,
        translations: [
          { locale: 'de', field: 'name', value: `${MATCH} draft ${i}` },
        ],
      });
    }
    const publishedId = await seedSaint({
      translations: [
        { locale: 'de', field: 'name', value: `${MATCH} published` },
      ],
    });

    const result = await service.search({ q: MATCH });

    expect(result.total).toBe(1);
    expect(result.items.map((hit) => hit.id)).toEqual([publishedId]);
  });

  it('excludes soft-deleted entities', async () => {
    await seedSaint({
      deleted: true,
      translations: [{ locale: 'de', field: 'name', value: MATCH }],
    });

    const result = await service.search({ q: MATCH });

    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });

  it('finds an entity whose only matching translation is in a locale other than de or en', async () => {
    const id = await seedSaint({
      translations: [{ locale: 'la', field: 'name', value: `${MATCH} latinum` }],
    });

    const result = await service.search({ q: MATCH, locale: 'la' });

    expect(result.items.map((hit) => hit.id)).toEqual([id]);
  });

  it('restricts results to the requested entity type', async () => {
    await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: MATCH }],
    });
    const sourceId = await seedSource(MATCH);

    const result = await service.search({ q: MATCH, type: 'source' });

    expect(result.items.map((hit) => hit.id)).toEqual([sourceId]);
    expect(result.total).toBe(1);
  });

  it('clamps an oversized limit and echoes back what was applied', async () => {
    const result = await service.search({ q: MATCH, limit: 5000 });

    expect(result.limit).toBe(100);
  });

  it('clamps a negative offset to zero', async () => {
    const result = await service.search({ q: MATCH, offset: -10 });

    expect(result.offset).toBe(0);
  });

  it('returns an empty result for a blank query', async () => {
    await seedSaint({
      translations: [{ locale: 'de', field: 'name', value: MATCH }],
    });

    const result = await service.search({ q: '   ' });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('shows the label in the requested content locale', async () => {
    await seedSaint({
      translations: [
        { locale: 'de', field: 'name', value: `${MATCH} deutsch` },
        { locale: 'en', field: 'name', value: `${MATCH} english` },
      ],
    });

    const result = await service.search({ q: MATCH, locale: 'en' });

    expect(result.items[0].label).toBe(`${MATCH} english`);
  });

  it('falls back to another locale for the label when the requested one is missing', async () => {
    await seedSaint({
      translations: [
        { locale: 'de', field: 'name', value: `${MATCH} deutsch` },
      ],
    });

    const result = await service.search({ q: MATCH, locale: 'la' });

    expect(result.items[0].label).toBe(`${MATCH} deutsch`);
  });
});

describe.skipIf(!hasTestDatabase)('SearchService query volume', () => {
  const counter = countingClient();
  let service: SearchService;

  beforeAll(() => {
    migrateTestSchema();
    service = new SearchService(counter.client as unknown as PrismaService);
  }, 60_000);

  beforeEach(async () => {
    await resetDomainTables();
  });

  afterAll(async () => {
    await disconnect();
  });

  async function seedMatching(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await seedSaint({
        translations: [
          { locale: 'de', field: 'name', value: `${MATCH} ${i}` },
          { locale: 'de', field: 'shortBio', value: `bio ${i}` },
        ],
      });
    }
  }

  it('issues the same number of queries for 5 results as for 60', async () => {
    await seedMatching(5);
    counter.reset();
    await service.search({ q: MATCH, limit: 100 });
    const forFive = counter.count();

    await resetDomainTables();
    await seedMatching(60);
    counter.reset();
    await service.search({ q: MATCH, limit: 100 });
    const forSixty = counter.count();

    expect(forFive).toBeGreaterThan(0);
    expect(forSixty).toBe(forFive);
  });
});
