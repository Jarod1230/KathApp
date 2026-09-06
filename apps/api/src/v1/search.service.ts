import { Injectable } from '@nestjs/common';
import {
  PUBLIC_ENTITY_KINDS,
  type PublicEntityKind,
  type SearchHit,
  type SearchResponse,
} from '@kathapp/shared';
import { EntityType, PublishStatus } from '@prisma/client';
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

function parseType(raw: string | undefined): PublicEntityKind | null {
  if (!raw) return null;
  return (PUBLIC_ENTITY_KINDS as readonly string[]).includes(raw)
    ? (raw as PublicEntityKind)
    : null;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    qRaw: string | undefined,
    localeRaw: string | undefined,
    typeRaw: string | undefined,
  ): Promise<SearchResponse> {
    const q = (qRaw ?? '').trim();
    const locale = normalizeContentLocale(localeRaw);
    const type = parseType(typeRaw);

    if (!q) {
      return { q: '', locale, type, items: [], total: 0 };
    }

    const kinds: PublicEntityKind[] = type
      ? [type]
      : [...PUBLIC_ENTITY_KINDS];
    const entityTypes = kinds.map((k) => k as EntityType);

    const matches = await this.prisma.translation.findMany({
      where: {
        deletedAt: null,
        entityType: { in: entityTypes },
        locale: { in: ['de', 'en'] },
        value: { contains: q, mode: 'insensitive' },
      },
      select: {
        entityType: true,
        entityId: true,
      },
      take: 200,
    });

    const seen = new Set<string>();
    const candidates: { entityType: PublicEntityKind; entityId: string }[] =
      [];
    for (const row of matches) {
      if (
        row.entityType !== EntityType.saint &&
        row.entityType !== EntityType.miracle &&
        row.entityType !== EntityType.source
      ) {
        continue;
      }
      const kind = row.entityType as PublicEntityKind;
      const key = `${kind}:${row.entityId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ entityType: kind, entityId: row.entityId });
    }

    const items: SearchHit[] = [];
    for (const candidate of candidates) {
      const published = await this.isPublished(
        candidate.entityType,
        candidate.entityId,
      );
      if (!published) continue;

      const translations = await this.prisma.translation.findMany({
        where: {
          deletedAt: null,
          entityType: candidate.entityType as EntityType,
          entityId: candidate.entityId,
        },
        select: { locale: true, field: true, value: true },
      });

      const labelField = LABEL_FIELD[candidate.entityType];
      const snippetField = SNIPPET_FIELD[candidate.entityType];
      const label =
        pickLocaleValue(translations, labelField, locale)?.value ??
        candidate.entityId;
      const snippet =
        pickLocaleValue(translations, snippetField, locale)?.value ?? null;

      items.push({
        entityType: candidate.entityType,
        id: candidate.entityId,
        label,
        snippet,
      });

      if (items.length >= 50) break;
    }

    return {
      q,
      locale,
      type,
      items,
      total: items.length,
    };
  }

  private async isPublished(
    kind: PublicEntityKind,
    id: string,
  ): Promise<boolean> {
    const where = {
      id,
      status: PublishStatus.published,
      deletedAt: null,
    };
    if (kind === 'saint') {
      return (await this.prisma.saint.count({ where })) > 0;
    }
    if (kind === 'miracle') {
      return (await this.prisma.miracle.count({ where })) > 0;
    }
    return (await this.prisma.source.count({ where })) > 0;
  }
}
