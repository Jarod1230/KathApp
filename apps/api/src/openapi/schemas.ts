import type { ApiResponseOptions } from '@nestjs/swagger';
import {
  EDGE_TYPES,
  PUBLIC_ENTITY_KINDS,
  PUBLISH_STATUSES,
  ROLES,
  SUGGESTION_STATUSES,
} from '@kathapp/shared';

/**
 * Response shapes for the OpenAPI document.
 *
 * Written by hand rather than derived from the Contract-v1 interfaces, because
 * TypeScript types are erased and NestJS' Swagger needs something at runtime.
 * The obvious alternative — DTO classes in this app — would mean writing the
 * shared types a second time, and this repository has already been bitten twice
 * by the same rule living in two places.
 *
 * Hand-written means these can drift. They do not, because
 * `test/integration/openapi.contract.spec.ts` validates real HTTP responses
 * from the real app against exactly these schemas. If the API changes shape
 * and a schema does not, that test fails.
 *
 * Enum members come from the shared constants, so a new role or edge type is a
 * compile-time concern rather than something to remember.
 */

/** ISO-8601 timestamp as the API serialises it. */
const timestamp = { type: 'string', format: 'date-time' };
const nullableString = { type: ['string', 'null'] };
const nullableInteger = { type: ['integer', 'null'] };
const nullableBoolean = { type: ['boolean', 'null'] };

const timestamps = {
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: { ...nullableString, format: 'date-time' },
};

const searchHit = {
  type: 'object',
  required: ['entityType', 'id', 'label'],
  properties: {
    entityType: { type: 'string', enum: [...PUBLIC_ENTITY_KINDS] },
    id: { type: 'string' },
    label: { type: 'string' },
    snippet: nullableString,
  },
};

const citationView = {
  type: 'object',
  required: ['id', 'sourceId', 'locus', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string' },
    sourceId: { type: 'string' },
    locus: { type: 'string' },
    excerpt: nullableString,
    excerptLatin: nullableString,
    entityType: nullableString,
    entityId: nullableString,
    sourceTitle: nullableString,
    source: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'string' },
        language: { type: 'string' },
        author: nullableString,
        year: nullableInteger,
        shelfmark: nullableString,
        url: nullableString,
        status: { type: 'string', enum: [...PUBLISH_STATUSES] },
      },
    },
    ...timestamps,
  },
};

const edgeChip = {
  type: 'object',
  required: ['id', 'type', 'relatedEntityType', 'relatedId', 'label'],
  properties: {
    id: { type: 'string' },
    type: { type: 'string', enum: [...EDGE_TYPES] },
    relatedEntityType: { type: 'string', enum: [...PUBLIC_ENTITY_KINDS] },
    relatedId: { type: 'string' },
    label: { type: 'string' },
    citationId: nullableString,
    note: nullableString,
  },
};

const resolvedTranslationField = {
  type: 'object',
  required: ['field', 'value', 'locale'],
  properties: {
    field: { type: 'string' },
    value: { type: 'string' },
    locale: { type: 'string' },
  },
};

const authUser = {
  type: 'object',
  required: ['id', 'email', 'role'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: [...ROLES] },
  },
};

const suggestionView = {
  type: 'object',
  required: [
    'id',
    'entityType',
    'status',
    'schemaVersion',
    'payload',
    'submittedByUserId',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string' },
    entityType: { type: 'string' },
    entityId: nullableString,
    status: { type: 'string', enum: [...SUGGESTION_STATUSES] },
    schemaVersion: { type: 'integer' },
    payload: { type: 'object' },
    submittedByUserId: { type: 'string' },
    reviewedByUserId: nullableString,
    reviewNote: nullableString,
    ...timestamps,
  },
};

/**
 * The schema type Swagger's decorators accept, taken from their own public
 * signature rather than a deep import into the package's dist folder.
 */
type SwaggerSchema = NonNullable<
  Extract<ApiResponseOptions, { schema?: unknown }>['schema']
>;

const schemas = {
  Health: {
    type: 'object',
    required: ['status', 'service', 'timestamp'],
    properties: {
      status: { type: 'string', enum: ['ok'] },
      service: { type: 'string' },
      timestamp,
    },
  },

  Readiness: {
    type: 'object',
    required: ['status', 'database', 'timestamp'],
    properties: {
      status: { type: 'string', enum: ['ready'] },
      database: { type: 'string', enum: ['up'] },
      timestamp,
    },
  },

  ApiRoot: {
    type: 'object',
    required: ['contract', 'prefix', 'endpoints', 'entities'],
    properties: {
      contract: { type: 'string' },
      prefix: { type: 'string' },
      endpoints: { type: 'object' },
      entities: { type: 'array', items: { type: 'string' } },
      note: { type: 'string' },
    },
  },

  SearchResponse: {
    type: 'object',
    required: ['q', 'locale', 'items', 'total', 'limit', 'offset'],
    properties: {
      q: { type: 'string' },
      locale: { type: 'string' },
      type: { type: ['string', 'null'], enum: [...PUBLIC_ENTITY_KINDS, null] },
      items: { type: 'array', items: searchHit },
      total: { type: 'integer', minimum: 0 },
      limit: { type: 'integer', minimum: 1 },
      offset: { type: 'integer', minimum: 0 },
    },
  },

  EntityDetailResponse: {
    type: 'object',
    required: [
      'entityType',
      'id',
      'locale',
      'status',
      'label',
      'translations',
      'citations',
      'edges',
    ],
    properties: {
      entityType: { type: 'string', enum: [...PUBLIC_ENTITY_KINDS] },
      id: { type: 'string' },
      locale: { type: 'string' },
      // Only published entities are served, so the field is not a free enum.
      status: { type: 'string', enum: ['published'] },
      label: { type: 'string' },
      body: nullableString,
      saint: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: [...PUBLISH_STATUSES] },
          slug: nullableString,
          feastNote: nullableString,
          deathYear: nullableInteger,
          deathYearApprox: nullableBoolean,
          ...timestamps,
        },
      },
      miracle: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: [...PUBLISH_STATUSES] },
          approxDate: nullableString,
          ...timestamps,
        },
      },
      source: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: [...PUBLISH_STATUSES] },
          language: { type: 'string' },
          author: nullableString,
          year: nullableInteger,
          shelfmark: nullableString,
          url: nullableString,
          ...timestamps,
        },
      },
      translations: { type: 'array', items: resolvedTranslationField },
      citations: { type: 'array', items: citationView },
      edges: { type: 'array', items: edgeChip },
    },
  },

  AuthUser: authUser,

  AuthSession: {
    type: 'object',
    required: ['accessToken', 'user'],
    properties: {
      accessToken: { type: 'string' },
      user: authUser,
    },
  },

  SuggestionView: suggestionView,

  SuggestionList: { type: 'array', items: suggestionView },
} as const;

export type ResponseSchemaName = keyof typeof schemas;

/**
 * The cast is deliberate and narrow: these objects are data, and the readonly
 * inference from `as const` is what buys the exact key names above. What keeps
 * them honest is not the type system but
 * `test/integration/openapi.contract.spec.ts`, which validates real responses
 * against exactly these objects.
 */
export const RESPONSE_SCHEMAS = schemas as unknown as Record<
  ResponseSchemaName,
  SwaggerSchema
>;
