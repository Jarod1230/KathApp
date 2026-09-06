import { SetMetadata } from '@nestjs/common';
import type { Role } from '@kathapp/shared';

export const ROLES_KEY = 'roles';

/** Require at least one of the listed minimum roles (hierarchy applied in RolesGuard). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
