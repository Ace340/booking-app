/**
 * Service Service
 *
 * Contains business logic for managing services.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { AuthUser } from '../../auth/types/auth.types';
import { Service } from '@prisma/client';

/**
 * Service Service
 *
 * Handles service business logic including:
 * - CRUD operations for services
 * - Multi-tenant company scoping
 * - Ownership validation
 */
@Injectable()
export class ServiceService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  /**
   * Get all services for a company
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Array of services
   */
  async getAll(companyId: string): Promise<Service[]> {
    return this.serviceRepository.findByCompanyId(companyId);
  }

  /**
   * Get a service by ID within a company
   * @param id - Service ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Service
   * @throws NotFoundException if service not found
   */
  async getById(id: string, companyId: string): Promise<Service> {
    const service = await this.serviceRepository.findByIdAndCompany(id, companyId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  /**
   * Create a new service
   * @param dto - Validated service creation data
   * @param user - Authenticated user
   * @returns Created service
   */
  async create(dto: CreateServiceDto, user: AuthUser): Promise<Service> {
    return this.serviceRepository.create({
      companyId: user.companyId,
      name: dto.name,
      duration: dto.duration,
      price: dto.price,
    });
  }

  /**
   * Update an existing service
   * @param id - Service ID
   * @param dto - Validated service update data
   * @param user - Authenticated user
   * @returns Updated service
   * @throws NotFoundException if service not found or doesn't belong to company
   */
  async update(id: string, dto: UpdateServiceDto, user: AuthUser): Promise<Service> {
    // Verify ownership (companyId match)
    const existing = await this.serviceRepository.findByIdAndCompany(id, user.companyId);
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    const updated = await this.serviceRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Service not found');
    }

    return updated;
  }

  /**
   * Delete a service
   * @param id - Service ID
   * @param companyId - Company ID for multi-tenant isolation
   * @throws NotFoundException if service not found or doesn't belong to company
   */
  async delete(id: string, companyId: string): Promise<void> {
    // Verify exists and belongs to company
    const existing = await this.serviceRepository.findByIdAndCompany(id, companyId);
    if (!existing) {
      throw new NotFoundException('Service not found');
    }

    await this.serviceRepository.delete(id);
  }
}
