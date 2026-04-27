/**
 * Staff Service
 *
 * Contains business logic for staff management.
 * Follows clean architecture: pure functions, no side effects.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { StaffRepository } from '../repositories/staff.repository';
import { CreateStaffDto, UpdateStaffDto } from '../dto';
import { AuthUser } from '../../auth/types/auth.types';
import { CreateStaffData, UpdateStaffData } from '../types/staff.types';
import { Staff } from '@prisma/client';

/**
 * Staff Service
 *
 * Handles staff business logic including:
 * - Company-scoped staff retrieval
 * - Ownership validation for updates and deletes
 * - Multi-tenant isolation enforcement
 */
@Injectable()
export class StaffService {
  constructor(private readonly staffRepository: StaffRepository) {}

  /**
   * Get all staff members for a company
   *
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Array of staff members
   */
  async getAll(companyId: string): Promise<Staff[]> {
    return this.staffRepository.findAllByCompany(companyId);
  }

  /**
   * Get a single staff member by ID
   *
   * Validates that the staff member belongs to the user's company.
   *
   * @param id - Staff member ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Staff member
   * @throws NotFoundException if staff member not found or doesn't belong to company
   */
  async getById(id: string, companyId: string): Promise<Staff> {
    const staff = await this.staffRepository.findByIdAndCompany(id, companyId);
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  /**
   * Create a new staff member
   *
   * Associates the staff member with the authenticated user's company.
   *
   * @param createStaffDto - Staff data from client
   * @param user - Authenticated user
   * @returns Created staff member
   */
  async create(createStaffDto: CreateStaffDto, user: AuthUser): Promise<Staff> {
    const staffData: CreateStaffData = {
      companyId: user.companyId,
      name: createStaffDto.name,
      email: createStaffDto.email,
    };

    return this.staffRepository.create(staffData);
  }

  /**
   * Update an existing staff member
   *
   * Validates ownership before updating to prevent cross-company modifications.
   *
   * @param id - Staff member ID
   * @param updateStaffDto - Updated staff data
   * @param user - Authenticated user
   * @returns Updated staff member
   * @throws NotFoundException if staff member not found
   * @throws ForbiddenException if staff member doesn't belong to user's company
   */
  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    user: AuthUser,
  ): Promise<Staff> {
    // Verify staff exists and belongs to the company
    const existing = await this.staffRepository.findByIdAndCompany(
      id,
      user.companyId,
    );
    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    const updateData: UpdateStaffData = {};
    if (updateStaffDto.name !== undefined) {
      updateData.name = updateStaffDto.name;
    }
    if (updateStaffDto.email !== undefined) {
      updateData.email = updateStaffDto.email;
    }

    const updated = await this.staffRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('Staff member not found');
    }
    return updated;
  }

  /**
   * Delete a staff member
   *
   * Validates existence and company ownership before deletion.
   *
   * @param id - Staff member ID
   * @param companyId - Company ID for multi-tenant isolation
   * @throws NotFoundException if staff member not found or doesn't belong to company
   */
  async delete(id: string, companyId: string): Promise<void> {
    // Verify staff exists and belongs to the company
    const existing = await this.staffRepository.findByIdAndCompany(
      id,
      companyId,
    );
    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    await this.staffRepository.delete(id);
  }
}
