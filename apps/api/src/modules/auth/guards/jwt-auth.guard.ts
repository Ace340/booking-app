/**
 * JWT Auth Guard
 *
 * Guard to protect routes that require authentication.
 * Validates JWT token from Authorization header.
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Auth Guard
 *
 * Extends NestJS AuthGuard with JWT strategy.
 * Allows public routes via @Public() decorator.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Check if route is public
   * @param context - Execution context
   * @returns True if route is public, false otherwise
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
