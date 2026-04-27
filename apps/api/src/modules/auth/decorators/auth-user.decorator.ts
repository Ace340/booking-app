/**
 * Current User Decorator
 *
 * Extracts authenticated user from request.
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types/auth.types';

/**
 * Current User decorator
 *
 * Use this decorator to access the authenticated user in controllers.
 * Example: @CurrentUser() user: AuthUser
 *
 * @param data - Optional data to extract from user
 * @param context - Execution context
 * @returns Auth user or specific property
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext): AuthUser | any => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      return null;
    }

    // Return specific property if data is provided
    if (data) {
      return user[data];
    }

    // Return full user object
    return user;
  },
);
