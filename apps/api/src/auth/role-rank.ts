import type { Role } from '@kathapp/shared';

const ROLE_RANK: Record<Role, number> = {
  viewer: 0,
  contributor: 1,
  reviewer: 2,
  admin: 3,
};

/** True when `actual` is at least as privileged as `required`. */
export function roleAtLeast(actual: Role, required: Role): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}
