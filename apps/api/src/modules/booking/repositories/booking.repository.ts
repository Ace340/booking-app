/**
 * Booking Repository
 *
 * Handles database operations for bookings (appointments).
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Appointment, AppointmentStatus } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import { BookingFilters, CreateBookingData } from '../types/booking.types';

/**
 * Booking Repository
 *
 * Provides database access methods for appointment bookings.
 * All methods are pure functions with explicit dependencies.
 */
@Injectable()
export class BookingRepository implements BaseRepositoryInterface<Appointment> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find an appointment by ID
   * @param id - Appointment ID
   * @returns Appointment with related entities or null if not found
   */
  async findById(id: string): Promise<Appointment | null> {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
    });
  }

  /**
   * Find all appointments matching optional filters
   * @param filters - Optional filter criteria
   * @returns Array of appointments
   */
  async findAll(filters?: Partial<Appointment>): Promise<Appointment[]> {
    return this.prisma.appointment.findMany({
      where: this.buildWhereClause(filters),
      include: {
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Find appointments by booking filters (typed filter object)
   * @param filters - BookingFilters object
   * @returns Array of appointments with related entities
   */
  async findByFilters(filters: BookingFilters): Promise<Appointment[]> {
    const where: Record<string, unknown> = {
      companyId: filters.companyId,
    };

    if (filters.staffId) {
      where.staffId = filters.staffId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      const startTimeRange: Record<string, Date> = {};
      if (filters.dateFrom) {
        startTimeRange.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        startTimeRange.lte = filters.dateTo;
      }
      where.startTime = startTimeRange;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Find overlapping appointments for a staff member.
   *
   * An overlap exists when:
   *   existing.startTime < newEndTime AND existing.endTime > newStartTime
   *
   * Only checks SCHEDULED appointments (not cancelled/completed).
   *
   * @param staffId - Staff member ID
   * @param startTime - New appointment start time
   * @param endTime - New appointment end time
   * @param companyId - Company ID for multi-tenant isolation
   * @param excludeId - Optional appointment ID to exclude (for updates)
   * @returns Array of overlapping appointments
   */
  async findOverlapping(
    staffId: string,
    startTime: Date,
    endTime: Date,
    companyId: string,
    excludeId?: string,
  ): Promise<Appointment[]> {
    const where: Record<string, unknown> = {
      staffId,
      companyId,
      status: AppointmentStatus.SCHEDULED,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return this.prisma.appointment.findMany({ where });
  }

  /**
   * Create a new appointment
   * @param data - Booking creation data
   * @returns Created appointment with related entities
   */
  async create(data: CreateBookingData): Promise<Appointment> {
    return this.prisma.appointment.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        staffId: data.staffId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
    });
  }

  /**
   * Update an existing appointment
   * @param id - Appointment ID
   * @param data - Partial appointment data
   * @returns Updated appointment or null if not found
   */
  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    try {
      return await this.prisma.appointment.update({
        where: { id },
        data,
        include: {
          user: { select: { id: true, name: true, email: true } },
          staff: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true, duration: true, price: true } },
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete an appointment
   * @param id - Appointment ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.appointment.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an appointment exists
   * @param id - Appointment ID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    return appointment !== null;
  }

  /**
   * Find a staff member by ID within a company
   * @param staffId - Staff ID
   * @param companyId - Company ID for multi-tenant check
   * @returns Staff record or null
   */
  async findStaffById(
    staffId: string,
    companyId: string,
  ): Promise<{ id: string; name: string } | null> {
    return this.prisma.staff.findFirst({
      where: { id: staffId, companyId },
      select: { id: true, name: true },
    });
  }

  /**
   * Find a service by ID within a company
   * @param serviceId - Service ID
   * @param companyId - Company ID for multi-tenant check
   * @returns Service record with duration or null
   */
  async findServiceById(
    serviceId: string,
    companyId: string,
  ): Promise<{ id: string; name: string; duration: number } | null> {
    return this.prisma.service.findFirst({
      where: { id: serviceId, companyId },
      select: { id: true, name: true, duration: true },
    });
  }

  /**
   * Build where clause from partial entity filters
   * @param filters - Optional filter criteria
   * @returns Prisma where clause
   */
  private buildWhereClause(filters?: Partial<Appointment>): Record<string, unknown> {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.staffId) {
      where.staffId = filters.staffId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}
