/**
 * User Service
 *
 * Contains business logic for user operations.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UpdateProfileDto } from '../dto';
import { AuthUser } from '../../auth/types/auth.types';

/**
 * User Service
 *
 * Handles user business logic including:
 * - Profile retrieval and updates
 * - Customer listing with search
 * - Admin user management
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Get the current user's profile
   *
   * @param userId - Authenticated user's ID
   * @returns User profile without password
   * @throws NotFoundException if user not found
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * List customers (users with CLIENT role) in the same company
   *
   * Optionally filters by name or email search term.
   *
   * @param companyId - Company ID for multi-tenant isolation
   * @param search - Optional search term for name/email
   * @returns Array of customer users
   */
  async listCustomers(companyId: string, search?: string) {
    return this.userRepository.findCustomers(companyId, search);
  }

  /**
   * Get a single customer by ID, scoped to company and CLIENT role
   *
   * @param id - Customer user ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Customer user without password
   * @throws NotFoundException if customer not found
   */
  async getCustomer(id: string, companyId: string) {
    const customer = await this.userRepository.findCustomerById(id, companyId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  /**
   * Update the current user's profile (name and/or email)
   *
   * @param userId - Authenticated user's ID
   * @param dto - Update data (name and/or email)
   * @returns Updated user without password
   * @throws NotFoundException if user not found
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.userRepository.update(userId, {
      name: dto.name,
      email: dto.email,
    });
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  /**
   * List all users in the company (admin only)
   *
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Array of all users in company without passwords
   */
  async findAll(companyId: string) {
    return this.userRepository.findAll({ companyId });
  }
}
