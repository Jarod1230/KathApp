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

/** Extensible edge relationship kinds (Contract-v1 starter set). */
export type EdgeType =
  | 'related_to'
  | 'attributed_to'
  | 'documented_by'
  | 'cites'
  | 'part_of'
  | (string & {});

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

export interface Saint extends Timestamps {
  id: string;
  slug: string;
  /** Canonical non-localized key/label placeholder — localized via Translation */
  canonicalName: string;
}

export interface Miracle extends Timestamps {
  id: string;
  slug: string;
  canonicalTitle: string;
}

export interface Source extends Timestamps {
  id: string;
  slug: string;
  title: string;
  kind?: string | null;
  url?: string | null;
  bibliographicRef?: string | null;
}

export interface Citation extends Timestamps {
  id: string;
  sourceId: string;
  locator?: string | null;
  note?: string | null;
  entityType?: EntityType | null;
  entityId?: string | null;
}

export interface Edge extends Timestamps {
  id: string;
  type: EdgeType;
  fromEntityType: EntityType;
  fromEntityId: string;
  toEntityType: EntityType;
  toEntityId: string;
  metadata?: Record<string, unknown> | null;
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
