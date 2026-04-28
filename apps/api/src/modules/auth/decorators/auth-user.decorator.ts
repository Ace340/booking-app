/**
 * Current User Decorator
 *
 * Extracts authenticated user from request.
 * Works with ClerkAuthGuard which attaches user data to request.
 *
 * Reads from:
 * - request.user (set by ClerkAuthGuard for backward compat)
 * - request.clerk.dbUser (Clerk-specific context)
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types/auth.types';

/**
 * Current User decorator
 *
 * Use this decorator to access the authenticated user in controllers.
 * Example: @CurrentUser() user: AuthUser
 * Example: @CurrentUser('role') role: UserRole
 *
 * @param data - Optional property to extract from user
 * @param context - Execution context
 * @returns AuthUser or specific property
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext): AuthUser | any => {
    const request = context.switchToHttp().getRequest();

    // Prefer request.user (set by ClerkAuthGuard)
    const user = request.user as AuthUser | undefined;

    if (!user) {
      return null;
    }

    // Return specific property if data is provided
    if (data) {
      return user[data];
    }

    return user;
  },
);
