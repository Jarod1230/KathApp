import { EdgeType, EntityType, PublishStatus } from '@prisma/client';
import { prisma } from './db';

/**
 * Fixtures are deliberately synthetic. CLAUDE.md forbids anything that could
 * be mistaken for curated domain knowledge, so nothing here names a real
 * saint, miracle or source.
 */
export type TranslationInput = {
  locale: string;
  field: string;
  value: string;
};

type EntityOptions = {
  status?: PublishStatus;
  deleted?: boolean;
  translations?: TranslationInput[];
};

async function addTranslations(
  entityType: EntityType,
  entityId: string,
  translations: TranslationInput[],
): Promise<void> {
  if (!translations.length) return;
  await prisma().translation.createMany({
    data: translations.map((t) => ({ entityType, entityId, ...t })),
  });
}

export async function seedSaint(opts: EntityOptions = {}): Promise<string> {
  const saint = await prisma().saint.create({
    data: {
      status: opts.status ?? PublishStatus.published,
      deletedAt: opts.deleted ? new Date() : null,
    },
  });
  await addTranslations(EntityType.saint, saint.id, opts.translations ?? []);
  return saint.id;
}

export async function seedMiracle(opts: EntityOptions = {}): Promise<string> {
  const miracle = await prisma().miracle.create({
    data: {
      status: opts.status ?? PublishStatus.published,
      deletedAt: opts.deleted ? new Date() : null,
    },
  });
  await addTranslations(EntityType.miracle, miracle.id, opts.translations ?? []);
  return miracle.id;
}

export async function seedSource(
  opts: EntityOptions & { language?: string; shelfmark?: string } = {},
): Promise<string> {
  const source = await prisma().source.create({
    data: {
      status: opts.status ?? PublishStatus.published,
      deletedAt: opts.deleted ? new Date() : null,
      language: opts.language ?? 'la',
      shelfmark: opts.shelfmark ?? null,
    },
  });
  await addTranslations(EntityType.source, source.id, opts.translations ?? []);
  return source.id;
}

export async function seedCitation(opts: {
  sourceId: string;
  entityType: EntityType;
  entityId: string;
  locus?: string;
}): Promise<string> {
  const citation = await prisma().citation.create({
    data: {
      sourceId: opts.sourceId,
      entityType: opts.entityType,
      entityId: opts.entityId,
      locus: opts.locus ?? 'fol. 1r',
    },
  });
  return citation.id;
}

export async function seedEdge(opts: {
  type: EdgeType;
  fromId: string;
  toId: string;
}): Promise<string> {
  const edge = await prisma().edge.create({ data: opts });
  return edge.id;
}
