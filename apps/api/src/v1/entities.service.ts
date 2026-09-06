import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EDGE_ENDPOINT_KINDS,
  type CitationView,
  type EdgeChip,
  type EdgeType,
  type EntityDetailResponse,
  type PublicEntityKind,
  type ResolvedTranslationField,
} from '@kathapp/shared';
import {
  EntityType,
  EdgeType as PrismaEdgeType,
  PublishStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeContentLocale, pickLocaleValue } from './locale.util';

const LABEL_FIELD: Record<PublicEntityKind, string> = {
  saint: 'name',
  miracle: 'title',
  source: 'title',
};

const BODY_FIELD: Record<PublicEntityKind, string> = {
  saint: 'shortBio',
  miracle: 'summary',
  source: 'notes',
};

function iso(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

type RelatedRef = { relatedEntityType: PublicEntityKind; relatedId: string };

function refKey(kind: PublicEntityKind, id: string): string {
  return `${kind}:${id}`;
}

function groupByEntity<T extends { entityId: string }>(
  rows: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const bucket = grouped.get(row.entityId);
    if (bucket) bucket.push(row);
    else grouped.set(row.entityId, [row]);
  }
  return grouped;
}

function relatedKindForEdge(
  edgeType: PrismaEdgeType,
  selfKind: PublicEntityKind,
  fromId: string,
  toId: string,
  selfId: string,
): RelatedRef | null {
  const endpoints = EDGE_ENDPOINT_KINDS[edgeType as EdgeType];
  if (!endpoints) return null;

  if (selfKind === endpoints.from && fromId === selfId) {
    return { relatedEntityType: endpoints.to, relatedId: toId };
  }
  if (selfKind === endpoints.to && toId === selfId) {
    return { relatedEntityType: endpoints.from, relatedId: fromId };
  }
  return null;
}

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDetail(
    kind: PublicEntityKind,
    id: string,
    localeRaw?: string,
  ): Promise<EntityDetailResponse> {
    const locale = normalizeContentLocale(localeRaw);
    const entity = await this.loadPublished(kind, id);
    if (!entity) {
      throw new NotFoundException(`${kind} not found`);
    }

    const translations = await this.prisma.translation.findMany({
      where: {
        deletedAt: null,
        entityType: kind as EntityType,
        entityId: id,
      },
      select: { locale: true, field: true, value: true },
    });

    const labelField = LABEL_FIELD[kind];
    const bodyField = BODY_FIELD[kind];
    const labelPick = pickLocaleValue(translations, labelField, locale);
    const bodyPick = pickLocaleValue(translations, bodyField, locale);

    const resolvedFields = new Map<string, ResolvedTranslationField>();
    for (const field of [labelField, bodyField]) {
      const picked = pickLocaleValue(translations, field, locale);
      if (picked) {
        resolvedFields.set(field, {
          field,
          value: picked.value,
          locale: picked.locale,
        });
      }
    }

    const citations = await this.loadCitations(kind, id, locale);
    const edges = await this.loadEdgeChips(kind, id, locale);

    const base: EntityDetailResponse = {
      entityType: kind,
      id,
      locale,
      status: 'published',
      label: labelPick?.value ?? id,
      body: bodyPick?.value ?? null,
      translations: [...resolvedFields.values()],
      citations,
      edges,
    };

    if (kind === 'saint' && 'slug' in entity) {
      base.saint = {
        id: entity.id,
        status: entity.status,
        slug: entity.slug,
        feastNote: entity.feastNote,
        deathYear: entity.deathYear,
        deathYearApprox: entity.deathYearApprox,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        deletedAt: iso(entity.deletedAt),
      };
    } else if (kind === 'miracle' && 'approxDate' in entity) {
      base.miracle = {
        id: entity.id,
        status: entity.status,
        approxDate: entity.approxDate,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        deletedAt: iso(entity.deletedAt),
      };
    } else if (kind === 'source' && 'language' in entity) {
      base.source = {
        id: entity.id,
        status: entity.status,
        language: entity.language,
        author: entity.author,
        year: entity.year,
        shelfmark: entity.shelfmark,
        url: entity.url,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
        deletedAt: iso(entity.deletedAt),
      };
    }

    return base;
  }

  private async loadPublished(kind: PublicEntityKind, id: string) {
    const where = {
      id,
      status: PublishStatus.published,
      deletedAt: null,
    };
    if (kind === 'saint') return this.prisma.saint.findFirst({ where });
    if (kind === 'miracle') return this.prisma.miracle.findFirst({ where });
    return this.prisma.source.findFirst({ where });
  }

  private async loadCitations(
    kind: PublicEntityKind,
    id: string,
    locale: string,
  ): Promise<CitationView[]> {
    const rows = await this.prisma.citation.findMany({
      where: {
        deletedAt: null,
        entityType: kind as EntityType,
        entityId: id,
        // A citation is provenance. If its source is not published, the
        // citation has no verifiable backing and must not appear on a public
        // page — nor may the source's metadata (shelfmark, author, url) leak
        // through the attached chip.
        source: { deletedAt: null, status: PublishStatus.published },
      },
      include: { source: true },
      orderBy: { createdAt: 'asc' },
    });
    if (rows.length === 0) return [];

    const titles = await this.sourceTitles(
      [...new Set(rows.map((row) => row.sourceId))],
      locale,
    );

    return rows.map((row) => ({
      id: row.id,
      sourceId: row.sourceId,
      locus: row.locus,
      excerpt: row.excerpt,
      excerptLatin: row.excerptLatin,
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      deletedAt: iso(row.deletedAt),
      source: row.source
        ? {
            id: row.source.id,
            language: row.source.language,
            author: row.source.author,
            year: row.source.year,
            shelfmark: row.source.shelfmark,
            url: row.source.url,
            status: row.source.status,
          }
        : null,
      sourceTitle: titles.get(row.sourceId) ?? null,
    }));
  }

  /** One translation query for every cited source, not one per citation. */
  private async sourceTitles(
    sourceIds: string[],
    locale: string,
  ): Promise<Map<string, string>> {
    const rows = await this.prisma.translation.findMany({
      where: {
        deletedAt: null,
        entityType: EntityType.source,
        entityId: { in: sourceIds },
      },
      select: { entityId: true, locale: true, field: true, value: true },
    });

    const grouped = groupByEntity(rows);
    const titles = new Map<string, string>();
    for (const sourceId of sourceIds) {
      const picked = pickLocaleValue(grouped.get(sourceId) ?? [], 'title', locale);
      if (picked) titles.set(sourceId, picked.value);
    }
    return titles;
  }

  private async loadEdgeChips(
    kind: PublicEntityKind,
    id: string,
    locale: string,
  ): Promise<EdgeChip[]> {
    const edges = await this.prisma.edge.findMany({
      where: { deletedAt: null, OR: [{ fromId: id }, { toId: id }] },
      orderBy: { createdAt: 'asc' },
    });

    const candidates = edges
      .map((edge) => ({
        edge,
        related: relatedKindForEdge(
          edge.type,
          kind,
          edge.fromId,
          edge.toId,
          id,
        ),
      }))
      .filter(
        (c): c is { edge: (typeof edges)[number]; related: RelatedRef } =>
          c.related !== null,
      );
    if (candidates.length === 0) return [];

    const published = await this.publishedIds(candidates.map((c) => c.related));
    const visible = candidates.filter((c) =>
      published.has(refKey(c.related.relatedEntityType, c.related.relatedId)),
    );
    if (visible.length === 0) return [];

    const labels = await this.relatedLabels(
      visible.map((c) => c.related),
      locale,
    );

    return visible.map(({ edge, related }) => ({
      id: edge.id,
      type: edge.type as EdgeType,
      relatedEntityType: related.relatedEntityType,
      relatedId: related.relatedId,
      label:
        labels.get(refKey(related.relatedEntityType, related.relatedId)) ??
        related.relatedId,
      citationId: edge.citationId,
      note: edge.note,
    }));
  }

  /** At most one query per entity kind present, never one per edge. */
  private async publishedIds(refs: RelatedRef[]): Promise<Set<string>> {
    const byKind = new Map<PublicEntityKind, string[]>();
    for (const ref of refs) {
      const bucket = byKind.get(ref.relatedEntityType);
      if (bucket) bucket.push(ref.relatedId);
      else byKind.set(ref.relatedEntityType, [ref.relatedId]);
    }

    const found = new Set<string>();
    for (const [kind, ids] of byKind) {
      const where = {
        id: { in: [...new Set(ids)] },
        status: PublishStatus.published,
        deletedAt: null,
      };
      const rows =
        kind === 'saint'
          ? await this.prisma.saint.findMany({ where, select: { id: true } })
          : kind === 'miracle'
            ? await this.prisma.miracle.findMany({ where, select: { id: true } })
            : await this.prisma.source.findMany({ where, select: { id: true } });
      for (const row of rows) found.add(refKey(kind, row.id));
    }
    return found;
  }

  /** One translation query for every related entity, not one per edge. */
  private async relatedLabels(
    refs: RelatedRef[],
    locale: string,
  ): Promise<Map<string, string>> {
    const rows = await this.prisma.translation.findMany({
      where: {
        deletedAt: null,
        OR: refs.map((ref) => ({
          entityType: ref.relatedEntityType as EntityType,
          entityId: ref.relatedId,
        })),
      },
      select: {
        entityType: true,
        entityId: true,
        locale: true,
        field: true,
        value: true,
      },
    });

    const grouped = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.entityType}:${row.entityId}`;
      const bucket = grouped.get(key);
      if (bucket) bucket.push(row);
      else grouped.set(key, [row]);
    }

    const labels = new Map<string, string>();
    for (const ref of refs) {
      const key = refKey(ref.relatedEntityType, ref.relatedId);
      const picked = pickLocaleValue(
        grouped.get(key) ?? [],
        LABEL_FIELD[ref.relatedEntityType],
        locale,
      );
      if (picked) labels.set(key, picked.value);
    }
    return labels;
  }
}
