/**
 * Auth Service
 *
 * Handles user synchronization between Clerk and the local database.
 * Authentication (login/register/password) is managed by Clerk —
 * this service focuses on user sync and lookup.
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthUser, UserSyncData } from '../types/auth.types';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Find or create a local user from a Clerk user ID.
   * Useful when a verified Clerk user doesn't have a local record yet.
   *
   * @param clerkUserId - The Clerk user ID (user_...)
   * @returns AuthUser or null if Clerk user not found
   */
  async findOrCreateFromClerk(clerkUserId: string): Promise<AuthUser | null> {
    // Check local DB first
    const existing = await this.authRepository.findByClerkId(clerkUserId);
    if (existing) {
      return {
        id: existing.id,
        clerkId: existing.clerkId ?? clerkUserId,
        email: existing.email,
        name: existing.name,
        role: existing.role,
        companyId: existing.companyId,
      };
    }

    // Fetch from Clerk and create local record
    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      const clerkClient = createClerkClient({ secretKey });
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      const syncData: UserSyncData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress ?? '',
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User',
        role: (clerkUser.publicMetadata?.role as UserRole) || UserRole.CLIENT,
      };

      const user = await this.authRepository.createFromClerk(syncData);

      this.logger.log(`Auto-created local user for clerkId=${clerkUserId}`);

      return {
        id: user.id,
        clerkId: user.clerkId ?? clerkUserId,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch/create user from Clerk: ${error instanceof Error ? error.message : 'Unknown'}`);
      return null;
    }
  }

  /**
   * Get a local user by their internal ID.
   */
  async findById(id: string): Promise<AuthUser> {
    const user = await this.authRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User not found: ${id}`);
    }

    return {
      id: user.id,
      clerkId: user.clerkId ?? '',
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };
  }

  /**
   * Get a local user by their Clerk ID.
   */
  async findByClerkId(clerkId: string): Promise<AuthUser | null> {
    const user = await this.authRepository.findByClerkId(clerkId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      clerkId: user.clerkId ?? clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };
  }

  /**
   * Get the current authenticated user's profile.
   */
  async getProfile(clerkUserId: string): Promise<AuthUser> {
    const user = await this.findOrCreateFromClerk(clerkUserId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }
}
