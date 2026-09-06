import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AuthUser,
  PublicEntityKind,
  SuggestionCreateRequest,
  SuggestionPayloadV1,
  SuggestionRejectRequest,
  SuggestionStatus,
  SuggestionView,
} from '@kathapp/shared';
import {
  EDGE_ENDPOINT_KINDS, PUBLIC_ENTITY_KINDS } from '@kathapp/shared';
import {
  EntityType,
  EdgeType as PrismaEdgeType,
  PublishStatus,
  SuggestionStatus as PrismaSuggestionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { roleAtLeast } from '../auth/role-rank';
import {
  evaluatePublishGates,
  loadEntityStatus,
} from './publish-gates';

function iso(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function toView(row: {
  id: string;
  entityType: EntityType;
  entityId: string | null;
  status: PrismaSuggestionStatus;
  schemaVersion: number;
  payload: Prisma.JsonValue;
  submittedByUserId: string;
  reviewedByUserId: string | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): SuggestionView {
  return {
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    status: row.status as SuggestionStatus,
    schemaVersion: row.schemaVersion,
    payload: (row.payload ?? {}) as Record<string, unknown>,
    submittedByUserId: row.submittedByUserId,
    reviewedByUserId: row.reviewedByUserId,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: iso(row.deletedAt),
  };
}

function isPublicKind(t: string): t is PublicEntityKind {
  return (PUBLIC_ENTITY_KINDS as readonly string[]).includes(t);
}

@Injectable()
export class SuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: AuthUser,
    body: SuggestionCreateRequest,
  ): Promise<SuggestionView> {
    if (!roleAtLeast(user.role, 'contributor')) {
      throw new ForbiddenException('contributor role required');
    }
    if (!body || typeof body.schemaVersion !== 'number') {
      throw new BadRequestException('schemaVersion required');
    }
    if (!body.payload || typeof body.payload !== 'object') {
      throw new BadRequestException('payload required');
    }

    const payload = body.payload as SuggestionPayloadV1;
    const { entityType, entityId } = this.resolveTarget(payload);

    const row = await this.prisma.suggestion.create({
      data: {
        entityType: entityType as EntityType,
        entityId: entityId ?? null,
        status: PrismaSuggestionStatus.submitted,
        schemaVersion: body.schemaVersion,
        payload: payload as unknown as Prisma.InputJsonValue,
        submittedByUserId: user.id,
      },
    });
    return toView(row);
  }

  async list(
    user: AuthUser,
    status?: string,
  ): Promise<SuggestionView[]> {
    if (!roleAtLeast(user.role, 'reviewer')) {
      throw new ForbiddenException('reviewer role required');
    }
    const where: Prisma.SuggestionWhereInput = { deletedAt: null };
    if (status) {
      if (
        !['submitted', 'in_review', 'accepted', 'rejected'].includes(status)
      ) {
        throw new BadRequestException('invalid status filter');
      }
      where.status = status as PrismaSuggestionStatus;
    }
    const rows = await this.prisma.suggestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toView);
  }

  async getOne(user: AuthUser, id: string): Promise<SuggestionView> {
    const row = await this.prisma.suggestion.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) {
      throw new NotFoundException('Suggestion not found');
    }
    const isOwner = row.submittedByUserId === user.id;
    const isReviewer = roleAtLeast(user.role, 'reviewer');
    if (!isOwner && !isReviewer) {
      throw new ForbiddenException('Not allowed to view this suggestion');
    }
    return toView(row);
  }

  async accept(user: AuthUser, id: string): Promise<SuggestionView> {
    if (!roleAtLeast(user.role, 'reviewer')) {
      throw new ForbiddenException('reviewer role required');
    }

    const existing = await this.prisma.suggestion.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Suggestion not found');
    }
    if (
      existing.status === PrismaSuggestionStatus.accepted ||
      existing.status === PrismaSuggestionStatus.rejected
    ) {
      throw new BadRequestException('Suggestion already resolved');
    }

    const payload = existing.payload as unknown as SuggestionPayloadV1;

    const updated = await this.prisma.$transaction(async (tx) => {
      const affected = await this.applyPayload(tx, payload, existing);

      // Publish-gates on resulting public entity graph when published.
      for (const target of affected) {
        const status = await loadEntityStatus(
          tx,
          target.entityType,
          target.entityId,
        );
        if (status === PublishStatus.published) {
          const gates = await evaluatePublishGates(
            tx,
            target.entityType,
            target.entityId,
          );
          if (gates.length > 0) {
            throw new BadRequestException({
              gates,
              message: 'Publish gates failed',
            });
          }
        }
      }

      return tx.suggestion.update({
        where: { id },
        data: {
          status: PrismaSuggestionStatus.accepted,
          reviewedByUserId: user.id,
          entityId: affected[0]?.entityId ?? existing.entityId,
        },
      });
    });
    return toView(updated);
  }

  async reject(
    user: AuthUser,
    id: string,
    body?: SuggestionRejectRequest,
  ): Promise<SuggestionView> {
    if (!roleAtLeast(user.role, 'reviewer')) {
      throw new ForbiddenException('reviewer role required');
    }
    const existing = await this.prisma.suggestion.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Suggestion not found');
    }
    if (
      existing.status === PrismaSuggestionStatus.accepted ||
      existing.status === PrismaSuggestionStatus.rejected
    ) {
      throw new BadRequestException('Suggestion already resolved');
    }

    const row = await this.prisma.suggestion.update({
      where: { id },
      data: {
        status: PrismaSuggestionStatus.rejected,
        reviewedByUserId: user.id,
        reviewNote: body?.reviewNote ?? null,
      },
    });
    return toView(row);
  }

  private resolveTarget(payload: SuggestionPayloadV1): {
    entityType: EntityType;
    entityId: string | null;
  } {
    if (payload.kind === 'edge') {
      return { entityType: EntityType.edge, entityId: null };
    }
    if (payload.kind === 'entity') {
      if (!isPublicKind(payload.entityType)) {
        throw new BadRequestException('payload.entityType must be saint|miracle|source');
      }
      return {
        entityType: payload.entityType as EntityType,
        entityId: payload.entityId ?? null,
      };
    }
    throw new BadRequestException('payload.kind must be entity|edge');
  }

  /**
   * Minimal Contract-v1 apply: entity create/update + related translations/citations/edges,
   * or edge insert. Soft-delete aware. No invented domain content.
   */
  private async applyPayload(
    tx: Prisma.TransactionClient,
    payload: SuggestionPayloadV1,
    suggestion: { entityId: string | null },
  ): Promise<Array<{ entityType: PublicEntityKind; entityId: string }>> {
    if (payload.kind === 'edge') {
      if (!payload.type || !payload.fromId || !payload.toId) {
        throw new BadRequestException('edge payload requires type, fromId, toId');
      }
      await this.assertEdgeEndpoints(
        tx,
        payload.type as PrismaEdgeType,
        payload.fromId,
        payload.toId,
      );
      await tx.edge.create({
        data: {
          type: payload.type as PrismaEdgeType,
          fromId: payload.fromId,
          toId: payload.toId,
          citationId: payload.citationId ?? null,
          note: payload.note ?? null,
        },
      });
      const affected: Array<{ entityType: PublicEntityKind; entityId: string }> =
        [];
      // Gate the miracle side of saint_miracle when present.
      if (payload.type === 'saint_miracle') {
        affected.push({ entityType: 'miracle', entityId: payload.toId });
      }
      return affected;
    }

    if (payload.kind !== 'entity') {
      throw new BadRequestException('unsupported payload kind');
    }
    if (!isPublicKind(payload.entityType)) {
      throw new BadRequestException('invalid entityType');
    }

    const op = payload.op ?? (payload.entityId || suggestion.entityId ? 'update' : 'create');
    let entityId = payload.entityId ?? suggestion.entityId ?? null;
    const fields = payload.fields ?? {};

    if (op === 'create' || !entityId) {
      entityId = await this.createEntity(tx, payload.entityType, fields);
    } else {
      const exists = await this.entityExists(tx, payload.entityType, entityId);
      if (!exists) {
        throw new BadRequestException('Target entity not found or soft-deleted');
      }
      await this.updateEntity(tx, payload.entityType, entityId, fields);
    }

    if (payload.translations?.length) {
      for (const t of payload.translations) {
        if (!t.locale || !t.field || t.value === undefined) {
          throw new BadRequestException('translation requires locale, field, value');
        }
        await tx.translation.upsert({
          where: {
            entityType_entityId_locale_field: {
              entityType: payload.entityType as EntityType,
              entityId,
              locale: t.locale,
              field: t.field,
            },
          },
          create: {
            entityType: payload.entityType as EntityType,
            entityId,
            locale: t.locale,
            field: t.field,
            value: t.value,
          },
          update: {
            value: t.value,
            deletedAt: null,
          },
        });
      }
    }

    if (payload.citations?.length) {
      for (const c of payload.citations) {
        if (!c.sourceId || !c.locus) {
          throw new BadRequestException('citation requires sourceId and locus');
        }
        const source = await tx.source.findFirst({
          where: { id: c.sourceId, deletedAt: null },
        });
        if (!source) {
          throw new BadRequestException('citation sourceId not found');
        }
        await tx.citation.create({
          data: {
            sourceId: c.sourceId,
            locus: c.locus,
            excerpt: c.excerpt ?? null,
            excerptLatin: c.excerptLatin ?? null,
            entityType: payload.entityType as EntityType,
            entityId,
          },
        });
      }
    }

    if (payload.edges?.length) {
      for (const e of payload.edges) {
        if (!e.type || !e.relatedId) {
          throw new BadRequestException('edge requires type and relatedId');
        }
        const direction = e.direction ?? 'from';
        let fromId: string;
        let toId: string;
        if (direction === 'from') {
          fromId = entityId;
          toId = e.relatedId;
        } else {
          fromId = e.relatedId;
          toId = entityId;
        }
        // Convention helpers for typed edges
        if (e.type === 'saint_miracle' && payload.entityType === 'miracle') {
          fromId = e.relatedId;
          toId = entityId;
        } else if (e.type === 'saint_miracle' && payload.entityType === 'saint') {
          fromId = entityId;
          toId = e.relatedId;
        }
        await this.assertEdgeEndpoints(
          tx,
          e.type as PrismaEdgeType,
          fromId,
          toId,
        );
        await tx.edge.create({
          data: {
            type: e.type as PrismaEdgeType,
            fromId,
            toId,
            citationId: e.citationId ?? null,
            note: e.note ?? null,
          },
        });
      }
    }

    return [{ entityType: payload.entityType, entityId }];
  }

  private async entityExists(
    tx: Prisma.TransactionClient,
    kind: PublicEntityKind,
    id: string,
  ): Promise<boolean> {
    const where = { id, deletedAt: null };
    if (kind === 'saint') {
      return !!(await tx.saint.findFirst({ where, select: { id: true } }));
    }
    if (kind === 'miracle') {
      return !!(await tx.miracle.findFirst({ where, select: { id: true } }));
    }
    return !!(await tx.source.findFirst({ where, select: { id: true } }));
  }

  private async createEntity(
    tx: Prisma.TransactionClient,
    kind: PublicEntityKind,
    fields: Record<string, unknown>,
  ): Promise<string> {
    const status =
      fields.status === 'published'
        ? PublishStatus.published
        : PublishStatus.draft;

    if (kind === 'saint') {
      const row = await tx.saint.create({
        data: {
          status,
          slug: (fields.slug as string | null | undefined) ?? null,
          feastNote: (fields.feastNote as string | null | undefined) ?? null,
          deathYear: (fields.deathYear as number | null | undefined) ?? null,
          deathYearApprox:
            (fields.deathYearApprox as boolean | null | undefined) ?? null,
        },
      });
      return row.id;
    }
    if (kind === 'miracle') {
      const row = await tx.miracle.create({
        data: {
          status,
          approxDate: (fields.approxDate as string | null | undefined) ?? null,
        },
      });
      return row.id;
    }
    const language = fields.language;
    if (typeof language !== 'string' || !language.trim()) {
      throw new BadRequestException('source create requires fields.language');
    }
    const row = await tx.source.create({
      data: {
        status,
        language,
        author: (fields.author as string | null | undefined) ?? null,
        year: (fields.year as number | null | undefined) ?? null,
        shelfmark: (fields.shelfmark as string | null | undefined) ?? null,
        url: (fields.url as string | null | undefined) ?? null,
      },
    });
    return row.id;
  }

  private async updateEntity(
    tx: Prisma.TransactionClient,
    kind: PublicEntityKind,
    id: string,
    fields: Record<string, unknown>,
  ): Promise<void> {
    const status =
      fields.status === 'published'
        ? PublishStatus.published
        : fields.status === 'draft'
          ? PublishStatus.draft
          : undefined;

    if (kind === 'saint') {
      await tx.saint.update({
        where: { id },
        data: {
          ...(status !== undefined ? { status } : {}),
          ...(fields.slug !== undefined
            ? { slug: fields.slug as string | null }
            : {}),
          ...(fields.feastNote !== undefined
            ? { feastNote: fields.feastNote as string | null }
            : {}),
          ...(fields.deathYear !== undefined
            ? { deathYear: fields.deathYear as number | null }
            : {}),
          ...(fields.deathYearApprox !== undefined
            ? { deathYearApprox: fields.deathYearApprox as boolean | null }
            : {}),
        },
      });
      return;
    }
    if (kind === 'miracle') {
      await tx.miracle.update({
        where: { id },
        data: {
          ...(status !== undefined ? { status } : {}),
          ...(fields.approxDate !== undefined
            ? { approxDate: fields.approxDate as string | null }
            : {}),
        },
      });
      return;
    }
    await tx.source.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(fields.language !== undefined
          ? { language: fields.language as string }
          : {}),
        ...(fields.author !== undefined
          ? { author: fields.author as string | null }
          : {}),
        ...(fields.year !== undefined
          ? { year: fields.year as number | null }
          : {}),
        ...(fields.shelfmark !== undefined
          ? { shelfmark: fields.shelfmark as string | null }
          : {}),
        ...(fields.url !== undefined
          ? { url: fields.url as string | null }
          : {}),
      },
    });
  }

  /**
   * An Edge stores its endpoints as bare ids, so the database cannot enforce
   * that they exist or that they are of the kind the edge type declares. The
   * read paths quietly drop rows that violate this, which means bad data would
   * accumulate invisibly. Check on write instead.
   */
  private async assertEdgeEndpoints(
    tx: Prisma.TransactionClient,
    type: PrismaEdgeType,
    fromId: string,
    toId: string,
  ): Promise<void> {
    const endpoints = EDGE_ENDPOINT_KINDS[type];
    if (!endpoints) {
      throw new BadRequestException(`unknown edge type: ${type}`);
    }
    await this.assertEndpointExists(tx, endpoints.from, fromId, 'fromId');
    await this.assertEndpointExists(tx, endpoints.to, toId, 'toId');
  }

  private async assertEndpointExists(
    tx: Prisma.TransactionClient,
    kind: PublicEntityKind,
    id: string,
    field: 'fromId' | 'toId',
  ): Promise<void> {
    const where = { id, deletedAt: null };
    const found =
      kind === 'saint'
        ? await tx.saint.count({ where })
        : kind === 'miracle'
          ? await tx.miracle.count({ where })
          : await tx.source.count({ where });
    if (found === 0) {
      throw new BadRequestException(
        `edge ${field} must reference an existing ${kind}`,
      );
    }
  }
}
