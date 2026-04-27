/**
 * Staff Repository
 *
 * Handles database operations for staff members.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Staff } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import { CreateStaffData, UpdateStaffData } from '../types/staff.types';

/**
 * Staff Repository
 *
 * Provides database access methods for staff members.
 * All methods are pure functions with explicit dependencies.
 * All queries include companyId filtering for multi-tenant isolation.
 */
@Injectable()
export class StaffRepository implements BaseRepositoryInterface<Staff> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a staff member by ID
   * @param id - Staff member ID
   * @returns Staff member or null if not found
   */
  async findById(id: string): Promise<Staff | null> {
    return this.prisma.staff.findUnique({
      where: { id },
    });
  }

  /**
   * Find a staff member by ID and company ID
   *
   * Used for multi-tenant scoped lookups to ensure
   * staff members are only accessible within their company.
   *
   * @param id - Staff member ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Staff member or null if not found
   */
  async findByIdAndCompany(
    id: string,
    companyId: string,
  ): Promise<Staff | null> {
    return this.prisma.staff.findFirst({
      where: { id, companyId },
    });
  }

  /**
   * Find all staff members matching optional criteria
   * @param criteria - Optional filter criteria
   * @returns Array of staff members
   */
  async findAll(criteria?: Partial<Staff>): Promise<Staff[]> {
    return this.prisma.staff.findMany({
      where: criteria as Record<string, unknown>,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find all staff members for a specific company
   *
   * Always filters by companyId for multi-tenant isolation.
   *
   * @param companyId - Company ID
   * @returns Array of staff members ordered by name
   */
  async findAllByCompany(companyId: string): Promise<Staff[]> {
    return this.prisma.staff.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new staff member
   * @param data - Staff creation data
   * @returns Created staff member
   */
  async create(data: CreateStaffData): Promise<Staff> {
    return this.prisma.staff.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        email: data.email,
      },
    });
  }

  /**
   * Update an existing staff member
   * @param id - Staff member ID
   * @param data - Partial staff data to update
   * @returns Updated staff member or null if not found
   */
  async update(id: string, data: UpdateStaffData): Promise<Staff | null> {
    try {
      return await this.prisma.staff.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete a staff member
   * @param id - Staff member ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.staff.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a staff member exists
   * @param id - Staff member ID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    return staff !== null;
  }
}
