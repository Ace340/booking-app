/**
 * Auth Repository
 *
 * Handles database operations for user authentication.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import { RegisterUserData } from '../types/auth.types';

/**
 * Auth Repository
 *
 * Provides database access methods for user authentication.
 * All methods are pure functions with explicit dependencies.
 */
@Injectable()
export class AuthRepository implements BaseRepositoryInterface<User> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find all users with optional filtering
   * @param filters - Optional filter criteria
   * @returns Array of users
   */
  async findAll(filters?: Record<string, unknown>): Promise<User[]> {
    const where = this.buildWhereClause(filters);
    return this.prisma.user.findMany({ where });
  }

  /**
   * Create a new user
   * @param data - User data
   * @returns Created user
   */
  async create(data: RegisterUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        companyId: data.companyId,
        role: data.role || UserRole.CLIENT,
      },
    });
  }

  /**
   * Update an existing user
   * @param id - User ID
   * @param data - Partial user data
   * @returns Updated user or null if not found
   */
  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete a user
   * @param id - User ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user exists
   * @param id - User ID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  /**
   * Check if email exists
   * @param email - User email
   * @returns True if email exists, false otherwise
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Build where clause from filters
   * @param filters - Optional filter criteria
   * @returns Prisma where clause
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
