/**
 * Roles Guard
 *
 * Guard to protect routes based on user roles.
 * Checks if user has required role(s).
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 *
 * Validates that the authenticated user has the required role(s).
 * Use with @Roles() decorator to specify required roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Check if user has required role
   * @param context - Execution context
   * @returns True if user has required role, false otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user, deny access
    if (!user) {
      return false;
    }

    // Check if user has required role
    return requiredRoles.includes(user.role);
  }
}
