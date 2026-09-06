/**
 * Contract-v1 shared types for KathApp.
 * Do not invent domain facts; these are structural DTOs only.
 */

export type Role = 'viewer' | 'contributor' | 'reviewer' | 'admin';

export type UiLocale = 'de' | 'en';

/** Content locale is independent of UI locale. */
export type ContentLocale = string;

export type EntityType =
  | 'saint'
  | 'miracle'
  | 'source'
  | 'citation'
  | 'edge'
  | 'translation'
  | 'suggestion';

/** Publish lifecycle for Saint, Miracle, Source (Contract-v1). */
export type PublishStatus = 'draft' | 'published';

/**
 * Typed graph edges (Contract-v1).
 * Convention: fromId is the left entity in the type name, toId the right
 * (e.g. saint_miracle → fromId=Saint, toId=Miracle).
 */
export type EdgeType =
  | 'saint_miracle'
  | 'miracle_source'
  | 'saint_source';

export type SuggestionStatus =
  | 'submitted'
  | 'in_review'
  | 'accepted'
  | 'rejected';

export interface Timestamps {
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  deletedAt?: string | null;
}

/** Canonical name / shortBio via Translation (fields: name, shortBio). */
export interface Saint extends Timestamps {
  id: string;
  status: PublishStatus;
  /** Optional URL-friendly key; not a display name. */
  slug?: string | null;
  feastNote?: string | null;
  deathYear?: number | null;
  deathYearApprox?: boolean | null;
}

/** Title / summary via Translation (fields: title, summary). */
export interface Miracle extends Timestamps {
  id: string;
  status: PublishStatus;
  approxDate?: string | null;
}

/** Title / notes via Translation (fields: title, notes). */
export interface Source extends Timestamps {
  id: string;
  status: PublishStatus;
  language: string;
  author?: string | null;
  year?: number | null;
  shelfmark?: string | null;
  url?: string | null;
}

export interface Citation extends Timestamps {
  id: string;
  sourceId: string;
  /** Page, folio, section, or other locus within the Source. */
  locus: string;
  /** Locale-facing excerpt (not Latin). */
  excerpt?: string | null;
  /** Latin excerpt, separate from locale excerpt. */
  excerptLatin?: string | null;
  /** Optional polymorphic link to a cited entity. */
  entityType?: EntityType | null;
  entityId?: string | null;
}

export interface Edge extends Timestamps {
  id: string;
  type: EdgeType;
  fromId: string;
  toId: string;
  citationId?: string | null;
  note?: string | null;
}

export interface Translation extends Timestamps {
  id: string;
  entityType: EntityType;
  entityId: string;
  locale: ContentLocale;
  field: string;
  value: string;
}

export interface Suggestion extends Timestamps {
  id: string;
  entityType: EntityType;
  entityId?: string | null;
  status: SuggestionStatus;
  schemaVersion: number;
  payload: Record<string, unknown>;
  submittedByUserId: string;
  reviewedByUserId?: string | null;
  reviewNote?: string | null;
}

export const PUBLISH_STATUSES: readonly PublishStatus[] = [
  'draft',
  'published',
] as const;

export const EDGE_TYPES: readonly EdgeType[] = [
  'saint_miracle',
  'miracle_source',
  'saint_source',
] as const;

export const SUGGESTION_STATUSES: readonly SuggestionStatus[] = [
  'submitted',
  'in_review',
  'accepted',
  'rejected',
] as const;

export const ROLES: readonly Role[] = [
  'viewer',
  'contributor',
  'reviewer',
  'admin',
] as const;

export const API_VERSION_PREFIX = '/v1' as const;
