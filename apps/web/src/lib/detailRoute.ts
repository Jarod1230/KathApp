import type { PublicEntityKind } from '@kathapp/shared';

/**
 * The router's route path per entity kind.
 *
 * Deliberately the literal paths rather than a segment string: TanStack Router
 * types `to` as a union of the routes that exist, so a path assembled at
 * runtime is rejected — which is the point. Adding an entity kind forces this
 * map to be updated alongside the route tree.
 */
export const DETAIL_ROUTE = {
  saint: '/$locale/saints/$id',
  miracle: '/$locale/miracles/$id',
  source: '/$locale/sources/$id',
} as const;

export type DetailRoute = (typeof DETAIL_ROUTE)[PublicEntityKind];

export function detailRoute(kind: PublicEntityKind): DetailRoute {
  return DETAIL_ROUTE[kind];
}
