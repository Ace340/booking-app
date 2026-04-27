/**
 * Service Repository
 *
 * Handles database operations for services.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Prisma, Service } from '@prisma/client';
import { CreateServiceData, UpdateServiceData } from '../types/service.types';

/**
 * Service Repository
 *
 * Provides database access methods for services.
 * All methods include companyId filtering for multi-tenant isolation.
 */
@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a service by ID
   * @param id - Service ID
   * @returns Service or null if not found
   */
  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  /**
   * Find all services matching optional criteria
   * @param criteria - Optional filter criteria
   * @returns Array of services
   */
  async findAll(criteria?: Partial<Service>): Promise<Service[]> {
    return this.prisma.service.findMany({
      where: this.buildWhereClause(criteria),
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a service by ID within a specific company
   * @param id - Service ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Service or null if not found
   */
  async findByIdAndCompany(id: string, companyId: string): Promise<Service | null> {
    return this.prisma.service.findFirst({
      where: { id, companyId },
    });
  }

  /**
   * Find all services for a specific company
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Array of services
   */
  async findByCompanyId(companyId: string): Promise<Service[]> {
    return this.prisma.service.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new service
   * @param data - Service creation data
   * @returns Created service
   */
  async create(data: CreateServiceData): Promise<Service> {
    return this.prisma.service.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        duration: data.duration,
        price: data.price,
      },
    });
  }

  /**
   * Update an existing service
   * @param id - Service ID
   * @param data - Partial service data
   * @returns Updated service or null if not found
   */
  async update(id: string, data: UpdateServiceData): Promise<Service | null> {
    try {
      return await this.prisma.service.update({
        where: { id },
        data: data as Prisma.ServiceUpdateInput,
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete a service
   * @param id - Service ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.service.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a service exists
   * @param id - Service ID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    return service !== null;
  }

  /**
   * Build where clause from partial entity filters
   * @param filters - Optional filter criteria
   * @returns Prisma where clause
   */
  private buildWhereClause(filters?: Partial<Service>): Record<string, unknown> {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }

    return where;
  }
}
