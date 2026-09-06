import type { PublishGateCode, PublicEntityKind } from '@kathapp/shared';
import {
  EntityType,
  EdgeType,
  PublishStatus,
  Prisma,
} from '@prisma/client';

type Db = Prisma.TransactionClient | {
  translation: Prisma.TransactionClient['translation'];
  citation: Prisma.TransactionClient['citation'];
  edge: Prisma.TransactionClient['edge'];
  saint: Prisma.TransactionClient['saint'];
  miracle: Prisma.TransactionClient['miracle'];
  source: Prisma.TransactionClient['source'];
};

const CONTENT_LOCALES = new Set(['de', 'en']);

/**
 * Contract-v1 publish gates for a resulting public entity.
 * 1. ≥1 Translation with locale de|en
 * 2. ≥1 Citation (exception: Source metadata-only — citation not required)
 * 3. Miracle: ≥1 Edge type saint_miracle
 */
export async function evaluatePublishGates(
  db: Db,
  entityType: PublicEntityKind,
  entityId: string,
): Promise<PublishGateCode[]> {
  const gates: PublishGateCode[] = [];

  const translations = await db.translation.findMany({
    where: {
      deletedAt: null,
      entityType: entityType as EntityType,
      entityId,
    },
    select: { locale: true },
  });
  const hasDeEn = translations.some((t) =>
    CONTENT_LOCALES.has(t.locale.toLowerCase()),
  );
  if (!hasDeEn) {
    gates.push('MISSING_TRANSLATION_DE_EN');
  }

  // Saint / Miracle require ≥1 Citation. Source metadata-only may omit citations.
  if (entityType !== 'source') {
    const citationCount = await db.citation.count({
      where: {
        deletedAt: null,
        entityType: entityType as EntityType,
        entityId,
      },
    });
    if (citationCount === 0) {
      gates.push('MISSING_CITATION');
    }
  }

  if (entityType === 'miracle') {
    const edge = await db.edge.findFirst({
      where: {
        deletedAt: null,
        type: EdgeType.saint_miracle,
        toId: entityId,
      },
      select: { id: true },
    });
    if (!edge) {
      gates.push('MISSING_SAINT_MIRACLE_EDGE');
    }
  }

  return gates;
}

/** Load publish status for a public entity (soft-delete aware). */
export async function loadEntityStatus(
  db: Db,
  entityType: PublicEntityKind,
  entityId: string,
): Promise<PublishStatus | null> {
  const where = { id: entityId, deletedAt: null };
  if (entityType === 'saint') {
    const row = await db.saint.findFirst({ where, select: { status: true } });
    return row?.status ?? null;
  }
  if (entityType === 'miracle') {
    const row = await db.miracle.findFirst({
      where,
      select: { status: true },
    });
    return row?.status ?? null;
  }
  const row = await db.source.findFirst({
    where,
    select: { status: true },
  });
  return row?.status ?? null;
}
