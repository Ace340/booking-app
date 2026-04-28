/**
 * Clerk Auth Guard
 *
 * Protects routes by verifying Clerk session tokens.
 * Replaces the previous JwtAuthGuard.
 *
 * Flow:
 * 1. Extracts Bearer token from Authorization header
 * 2. Verifies token using @clerk/backend verifyToken()
 * 3. Looks up local DB user by clerkId
 * 4. Attaches ClerkRequestContext to request
 *
 * Supports @Public() decorator to skip authentication.
 */

import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken, createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ClerkTokenClaims, ClerkRequestContext, AuthUser } from '../types/auth.types';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      const jwtKey = this.configService.get<string>('CLERK_JWT_KEY');
      const parties = (
        this.configService.get<string>('CLERK_AUTHORIZED_PARTIES') ||
        'http://localhost:3000'
      ).split(',');

      // Verify the Clerk session token
      const verifiedToken = await verifyToken(token, {
        secretKey,
        jwtKey: jwtKey || undefined,
        authorizedParties: parties,
      }) as unknown as ClerkTokenClaims;

      // Look up local user by Clerk ID
      const dbUser = await this.authRepository.findByClerkId(verifiedToken.sub);

      const authUser: AuthUser | null = dbUser
        ? {
            id: dbUser.id,
            clerkId: dbUser.clerkId ?? verifiedToken.sub,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            companyId: dbUser.companyId,
          }
        : null;

      // Attach Clerk context to request for use in controllers
      request.clerk = {
        userId: verifiedToken.sub,
        sessionId: verifiedToken.sid,
        token: verifiedToken,
        dbUser: authUser,
      } satisfies ClerkRequestContext;

      // Also set request.user for backward compatibility with RolesGuard
      if (authUser) {
        request.user = authUser;
      }

      return true;
    } catch (error) {
      this.logger.warn(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extract Bearer token from Authorization header.
   */
  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '');
    }
    return null;
  }
}
