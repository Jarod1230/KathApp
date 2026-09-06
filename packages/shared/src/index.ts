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

/** Public browseable entity kinds for search + detail. */
export type PublicEntityKind = 'saint' | 'miracle' | 'source';

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

/** Search hit for GET /v1/search (public, published only). */
export interface SearchHit {
  entityType: PublicEntityKind;
  id: string;
  /** Localized label (name/title) for the requested content locale. */
  label: string;
  /** Optional short bio / summary snippet. */
  snippet?: string | null;
}

export interface SearchResponse {
  q: string;
  locale: ContentLocale;
  type?: PublicEntityKind | null;
  items: SearchHit[];
  /**
   * All published entities matching the query, independent of limit/offset.
   * See ADR 0004.
   */
  total: number;
  /** The limit the server actually applied, after clamping. */
  limit: number;
  /** The offset the server actually applied, after clamping. */
  offset: number;
}

/** Search paging bounds (ADR 0004). */
export const SEARCH_DEFAULT_LIMIT = 20;
export const SEARCH_MAX_LIMIT = 100;

/** Citation payload on entity detail (includes optional source chip data). */
export interface CitationView extends Citation {
  source?: Pick<
    Source,
    'id' | 'language' | 'author' | 'year' | 'shelfmark' | 'url' | 'status'
  > | null;
  sourceTitle?: string | null;
}

/** Edge as chip data for entity detail relations slot. */
export interface EdgeChip {
  id: string;
  type: EdgeType;
  relatedEntityType: PublicEntityKind;
  relatedId: string;
  label: string;
  citationId?: string | null;
  note?: string | null;
}

/** Resolved translation field for a single locale (after fallback). */
export interface ResolvedTranslationField {
  field: string;
  value: string;
  locale: ContentLocale;
}

/** GET /v1/{saints|miracles|sources}/:id response. */
export interface EntityDetailResponse {
  entityType: PublicEntityKind;
  id: string;
  locale: ContentLocale;
  status: PublishStatus;
  label: string;
  body?: string | null;
  saint?: Omit<Saint, keyof Timestamps> & Timestamps;
  miracle?: Omit<Miracle, keyof Timestamps> & Timestamps;
  source?: Omit<Source, keyof Timestamps> & Timestamps;
  translations: ResolvedTranslationField[];
  citations: CitationView[];
  edges: EdgeChip[];
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

export const PUBLIC_ENTITY_KINDS: readonly PublicEntityKind[] = [
  'saint',
  'miracle',
  'source',
] as const;

export const API_VERSION_PREFIX = '/v1' as const;


// ---------------------------------------------------------------------------
// Auth + Suggestions (ADR 0003 / vertical slice)
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface DevLoginRequest {
  email: string;
  /** Defaults to contributor when omitted. */
  role?: Role;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export type SuggestionPayloadKind = 'entity' | 'edge';

/** Translation row proposed in a suggestion payload (schemaVersion 1). */
export interface SuggestionTranslationInputV1 {
  locale: string;
  field: string;
  value: string;
}

/** Citation row proposed against the target entity. */
export interface SuggestionCitationInputV1 {
  sourceId: string;
  locus: string;
  excerpt?: string | null;
  excerptLatin?: string | null;
}

/**
 * Edge attached to an entity suggestion.
 * `relatedId` is the other node; `direction` defaults by EdgeType convention
 * (saint_miracle: saint→miracle, etc.).
 */
export interface SuggestionEdgeInputV1 {
  type: EdgeType;
  relatedId: string;
  /** If `from`, target entity is fromId; if `to`, target is toId. */
  direction?: 'from' | 'to';
  citationId?: string | null;
  note?: string | null;
}

/** Entity create/update proposal (Contract-v1 scalars + related graph bits). */
export interface SuggestionEntityPayloadV1 {
  kind: 'entity';
  /** Defaults: create when no entityId, else update. */
  op?: 'create' | 'update';
  entityType: PublicEntityKind;
  entityId?: string | null;
  /** Scalar fields for Saint | Miracle | Source (no invented domain content). */
  fields?: {
    status?: PublishStatus;
    slug?: string | null;
    feastNote?: string | null;
    deathYear?: number | null;
    deathYearApprox?: boolean | null;
    approxDate?: string | null;
    language?: string;
    author?: string | null;
    year?: number | null;
    shelfmark?: string | null;
    url?: string | null;
  };
  translations?: SuggestionTranslationInputV1[];
  citations?: SuggestionCitationInputV1[];
  edges?: SuggestionEdgeInputV1[];
}

/** Standalone edge insert proposal. */
export interface SuggestionEdgePayloadV1 {
  kind: 'edge';
  type: EdgeType;
  fromId: string;
  toId: string;
  citationId?: string | null;
  note?: string | null;
}

export type SuggestionPayloadV1 =
  | SuggestionEntityPayloadV1
  | SuggestionEdgePayloadV1;

export interface SuggestionCreateRequest {
  schemaVersion: number;
  payload: SuggestionPayloadV1;
}

/** API view of a Suggestion row (ISO timestamps). */
export type SuggestionView = Suggestion;

export interface SuggestionRejectRequest {
  reviewNote?: string;
}

/** Publish-gate failure codes (HTTP 400 body `{ gates, message }`). */
export type PublishGateCode =
  | 'translation_required'
  | 'citation_required'
  | 'saint_miracle_edge_required';

export const PUBLISH_GATE_CODES: readonly PublishGateCode[] = [
  'translation_required',
  'citation_required',
  'saint_miracle_edge_required',
] as const;
