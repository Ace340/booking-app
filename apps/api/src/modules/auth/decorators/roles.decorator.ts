/**
 * Roles Decorator
 *
 * Specifies required role(s) for a route.
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Roles key for metadata
 */
export const ROLES_KEY = 'roles';

/**
 * Roles decorator
 *
 * Use this decorator to specify required role(s) for a route.
 * Example: @Roles(UserRole.ADMIN, UserRole.STAFF)
 *
 * @param roles - Array of required user roles
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
