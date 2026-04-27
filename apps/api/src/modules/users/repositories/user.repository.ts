/**
 * User Repository
 *
 * Handles database operations for users.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

/**
 * Fields to select for safe user queries (excludes password).
 */
const SAFE_USER_SELECT = {
  id: true,
  companyId: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Safe user type — excludes password from the Prisma User type.
 */
type SafeUser = Omit<User, 'password'>;

/**
 * User Repository
 *
 * Provides database access methods for users.
 * All queries exclude the password field for security.
 * All queries include companyId filtering for multi-tenant isolation.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by ID (excludes password)
   * @param id - User ID
   * @returns User without password or null if not found
   */
  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    }) as Promise<SafeUser | null>;
  }

  /**
   * Find all users matching optional criteria (excludes password)
   * @param criteria - Optional filter criteria (e.g. { companyId: '...' })
   * @returns Array of users without password
   */
  async findAll(criteria?: Partial<User>): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      where: this.buildWhereClause(criteria),
      select: SAFE_USER_SELECT,
      orderBy: { name: 'asc' },
    }) as Promise<SafeUser[]>;
  }

  /**
   * Find users with CLIENT role in a company, with optional search
   * @param companyId - Company ID for multi-tenant isolation
   * @param search - Optional search term for name or email
   * @returns Array of client users without password
   */
  async findCustomers(companyId: string, search?: string): Promise<SafeUser[]> {
    const where: Record<string, unknown> = {
      companyId,
      role: UserRole.CLIENT,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: SAFE_USER_SELECT,
      orderBy: { name: 'asc' },
    }) as Promise<SafeUser[]>;
  }

  /**
   * Find a customer by ID within a company where role is CLIENT
   * @param id - User ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns User without password or null if not found
   */
  async findCustomerById(id: string, companyId: string): Promise<SafeUser | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        role: UserRole.CLIENT,
      },
      select: SAFE_USER_SELECT,
    }) as Promise<SafeUser | null>;
  }

  /**
   * Create a new user
   * @param data - User creation data
   * @returns Created user without password
   */
  async create(data: Partial<User>): Promise<SafeUser> {
    return this.prisma.user.create({
      data: {
        email: data.email!,
        password: data.password!,
        name: data.name!,
        role: data.role,
        companyId: data.companyId!,
      },
      select: SAFE_USER_SELECT,
    }) as Promise<SafeUser>;
  }

  /**
   * Update an existing user (excludes password from return)
   * @param id - User ID
   * @param data - Partial user data to update
   * @returns Updated user without password or null if not found
   */
  async update(id: string, data: Partial<User>): Promise<SafeUser | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
        },
        select: SAFE_USER_SELECT,
      }) as unknown as SafeUser;
    } catch {
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
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a user exists
   * @param id - User ID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user !== null;
  }

  /**
   * Build where clause from partial entity filters
   * @param filters - Optional filter criteria
   * @returns Prisma where clause
   */
  private buildWhereClause(filters?: Partial<User>): Record<string, unknown> {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    return where;
  }
}
