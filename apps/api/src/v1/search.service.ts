import { Injectable } from '@nestjs/common';
import {
  PUBLIC_ENTITY_KINDS,
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT,
  PublicEntityKind,
  SearchHit,
  SearchResponse,
} from '@kathapp/shared';
import { EntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeContentLocale, pickLocaleValue } from './locale.util';

const LABEL_FIELD: Record<PublicEntityKind, string> = {
  saint: 'name',
  miracle: 'title',
  source: 'title',
};

const SNIPPET_FIELD: Record<PublicEntityKind, string> = {
  saint: 'shortBio',
  miracle: 'summary',
  source: 'notes',
};

export type SearchParams = {
  q?: string;
  locale?: string;
  type?: string;
  limit?: number;
  offset?: number;
};

type CandidateRow = { kind: PublicEntityKind; id: string };

function parseType(raw: string | undefined): PublicEntityKind | null {
  if (!raw) return null;
  return (PUBLIC_ENTITY_KINDS as readonly string[]).includes(raw)
    ? (raw as PublicEntityKind)
    : null;
}

/**
 * ADR 0004: out-of-range paging is clamped, never rejected. A public read
 * surface should not answer a malformed page cursor with a 400.
 */
function clampLimit(raw: number | undefined): number {
  if (raw === undefined || !Number.isFinite(raw)) return SEARCH_DEFAULT_LIMIT;
  return Math.min(SEARCH_MAX_LIMIT, Math.max(1, Math.trunc(raw)));
}

function clampOffset(raw: number | undefined): number {
  if (raw === undefined || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.trunc(raw));
}

/** Neutralize LIKE wildcards so a query for "100%" is not a prefix match. */
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: SearchParams): Promise<SearchResponse> {
    const q = (params.q ?? '').trim();
    const locale = normalizeContentLocale(params.locale);
    const type = parseType(params.type);
    const limit = clampLimit(params.limit);
    const offset = clampOffset(params.offset);

    if (!q) {
      return { q: '', locale, type, items: [], total: 0, limit, offset };
    }

    const kinds = type ? [type] : [...PUBLIC_ENTITY_KINDS];
    const matches = this.matchingEntities(kinds, likePattern(q));

    // Three queries, regardless of how many results there are: count, page,
    // and one translation lookup for the page. The previous implementation
    // issued two queries per candidate.
    const [countRows, page] = await Promise.all([
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint AS count FROM (${matches}) AS m
      `,
      this.prisma.$queryRaw<CandidateRow[]>`
        SELECT m.kind, m.id FROM (${matches}) AS m
        ORDER BY m.kind, m.id
        LIMIT ${limit} OFFSET ${offset}
      `,
    ]);

    const total = Number(countRows[0]?.count ?? 0);
    const items = page.length ? await this.toHits(page, locale) : [];

    return { q, locale, type, items, total, limit, offset };
  }

  /**
   * Published, non-deleted entities that carry a matching translation in ANY
   * content locale (ADR 0004). The publish filter lives inside the query, so a
   * backlog of drafts can never displace published results the way it did when
   * candidates were capped first and filtered afterwards.
   */
  private matchingEntities(
    kinds: PublicEntityKind[],
    pattern: string,
  ): Prisma.Sql {
    return Prisma.sql`
      SELECT DISTINCT t."entityType"::text AS kind, t."entityId" AS id
      FROM "Translation" t
      WHERE t."deletedAt" IS NULL
        AND t."entityType"::text = ANY(${kinds}::text[])
        AND t.value ILIKE ${pattern}
        AND (
          (t."entityType" = 'saint' AND EXISTS (
            SELECT 1 FROM "Saint" e
            WHERE e.id = t."entityId"
              AND e.status = 'published' AND e."deletedAt" IS NULL))
          OR (t."entityType" = 'miracle' AND EXISTS (
            SELECT 1 FROM "Miracle" e
            WHERE e.id = t."entityId"
              AND e.status = 'published' AND e."deletedAt" IS NULL))
          OR (t."entityType" = 'source' AND EXISTS (
            SELECT 1 FROM "Source" e
            WHERE e.id = t."entityId"
              AND e.status = 'published' AND e."deletedAt" IS NULL))
        )
    `;
  }

  private async toHits(
    page: CandidateRow[],
    locale: string,
  ): Promise<SearchHit[]> {
    const rows = await this.prisma.translation.findMany({
      where: {
        deletedAt: null,
        OR: page.map((c) => ({
          entityType: c.kind as EntityType,
          entityId: c.id,
        })),
      },
      select: { entityType: true, entityId: true, locale: true, field: true, value: true },
    });

    const byEntity = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.entityType}:${row.entityId}`;
      const bucket = byEntity.get(key);
      if (bucket) bucket.push(row);
      else byEntity.set(key, [row]);
    }

    return page.map((candidate) => {
      const translations = byEntity.get(`${candidate.kind}:${candidate.id}`) ?? [];
      return {
        entityType: candidate.kind,
        id: candidate.id,
        label:
          pickLocaleValue(translations, LABEL_FIELD[candidate.kind], locale)
            ?.value ?? candidate.id,
        snippet:
          pickLocaleValue(translations, SNIPPET_FIELD[candidate.kind], locale)
            ?.value ?? null,
      };
    });
  }
}
