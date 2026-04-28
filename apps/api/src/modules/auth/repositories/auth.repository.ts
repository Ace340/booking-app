/**
 * Auth Repository
 *
 * Handles database operations for user management.
 * Supports both Clerk-based (clerkId) and legacy lookups.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import { UserSyncData } from '../types/auth.types';

@Injectable()
export class AuthRepository implements BaseRepositoryInterface<User> {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by internal ID.
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Find user by email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Find user by Clerk ID.
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { clerkId } });
  }

  /**
   * Find all users with optional filtering.
   */
  async findAll(filters?: Record<string, unknown>): Promise<User[]> {
    const where = this.buildWhereClause(filters);
    return this.prisma.user.findMany({ where });
  }

  /**
   * Create a new user from Clerk data.
   * Assigns a default company if none provided.
   */
  async createFromClerk(data: UserSyncData): Promise<User> {
    return this.prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        role: data.role ?? UserRole.CLIENT,
        password: '',  // No password — Clerk handles auth
        ...(data.companyId ? { companyId: data.companyId } : { companyId: '' }),
      },
    });
  }

  /**
   * Update user by internal ID.
   */
  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch {
      return null;
    }
  }

  /**
   * Update user by Clerk ID.
   */
  async updateByClerkId(
    clerkId: string,
    data: { email?: string; name?: string; role?: UserRole },
  ): Promise<User | null> {
    try {
      return await this.prisma.user.updateMany({
        where: { clerkId },
        data,
      }).then(() => this.findByClerkId(clerkId));
    } catch {
      return null;
    }
  }

  /**
   * Delete user by internal ID.
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete user by Clerk ID.
   */
  async deleteByClerkId(clerkId: string): Promise<boolean> {
    try {
      const user = await this.findByClerkId(clerkId);
      if (!user) return false;
      await this.prisma.user.delete({ where: { id: user.id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user exists.
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  /**
   * Check if email exists.
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Build where clause from filters.
   */
  private buildWhereClause(filters?: Record<string, unknown>): Record<string, unknown> {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId as string;
    }

    if (filters.role) {
      where.role = filters.role as UserRole;
    }

    return where;
  }
}
