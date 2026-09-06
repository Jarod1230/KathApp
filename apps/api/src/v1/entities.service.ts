import { Injectable, NotFoundException } from '@nestjs/common';
import {
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

function relatedKindForEdge(
  edgeType: PrismaEdgeType,
  selfKind: PublicEntityKind,
  fromId: string,
  toId: string,
  selfId: string,
): { relatedEntityType: PublicEntityKind; relatedId: string } | null {
  if (edgeType === PrismaEdgeType.saint_miracle) {
    if (selfKind === 'saint' && fromId === selfId) {
      return { relatedEntityType: 'miracle', relatedId: toId };
    }
    if (selfKind === 'miracle' && toId === selfId) {
      return { relatedEntityType: 'saint', relatedId: fromId };
    }
  }
  if (edgeType === PrismaEdgeType.miracle_source) {
    if (selfKind === 'miracle' && fromId === selfId) {
      return { relatedEntityType: 'source', relatedId: toId };
    }
    if (selfKind === 'source' && toId === selfId) {
      return { relatedEntityType: 'miracle', relatedId: fromId };
    }
  }
  if (edgeType === PrismaEdgeType.saint_source) {
    if (selfKind === 'saint' && fromId === selfId) {
      return { relatedEntityType: 'source', relatedId: toId };
    }
    if (selfKind === 'source' && toId === selfId) {
      return { relatedEntityType: 'saint', relatedId: fromId };
    }
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
        source: { deletedAt: null },
      },
      include: {
        source: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const views: CitationView[] = [];
    for (const row of rows) {
      let sourceTitle: string | null = null;
      if (row.source && !row.source.deletedAt) {
        const sourceTranslations = await this.prisma.translation.findMany({
          where: {
            deletedAt: null,
            entityType: EntityType.source,
            entityId: row.source.id,
          },
          select: { locale: true, field: true, value: true },
        });
        sourceTitle =
          pickLocaleValue(sourceTranslations, 'title', locale)?.value ?? null;
      }

      views.push({
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
        sourceTitle,
      });
    }
    return views;
  }

  private async loadEdgeChips(
    kind: PublicEntityKind,
    id: string,
    locale: string,
  ): Promise<EdgeChip[]> {
    const edges = await this.prisma.edge.findMany({
      where: {
        deletedAt: null,
        OR: [{ fromId: id }, { toId: id }],
      },
      orderBy: { createdAt: 'asc' },
    });

    const chips: EdgeChip[] = [];
    for (const edge of edges) {
      const related = relatedKindForEdge(
        edge.type,
        kind,
        edge.fromId,
        edge.toId,
        id,
      );
      if (!related) continue;

      const published = await this.loadPublished(
        related.relatedEntityType,
        related.relatedId,
      );
      if (!published) continue;

      const relatedTranslations = await this.prisma.translation.findMany({
        where: {
          deletedAt: null,
          entityType: related.relatedEntityType as EntityType,
          entityId: related.relatedId,
        },
        select: { locale: true, field: true, value: true },
      });
      const labelField = LABEL_FIELD[related.relatedEntityType];
      const label =
        pickLocaleValue(relatedTranslations, labelField, locale)?.value ??
        related.relatedId;

      chips.push({
        id: edge.id,
        type: edge.type as EdgeType,
        relatedEntityType: related.relatedEntityType,
        relatedId: related.relatedId,
        label,
        citationId: edge.citationId,
        note: edge.note,
      });
    }
    return chips;
  }
}
