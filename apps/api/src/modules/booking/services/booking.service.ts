/**
 * Booking Service
 *
 * Contains business logic for appointment bookings.
 * Follows clean architecture: pure functions, no side effects.
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingRepository } from '../repositories/booking.repository';
import { CreateBookingDto } from '../dto';
import { AuthUser } from '../../auth/types/auth.types';
import { BookingFilters, CreateBookingData } from '../types/booking.types';
import { Appointment, AppointmentStatus } from '@prisma/client';
import {
  NOTIFICATION_EVENTS,
  buildBookingCreatedPayload,
  buildBookingCancelledPayload,
} from '../../notification/events/notification.events';

/**
 * Booking Service
 *
 * Handles booking business logic including:
 * - Overlap detection and prevention
 * - Staff availability validation
 * - Time range validation
 * - Authorization checks for cancellations
 */
@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new booking
   *
   * Validates staff availability, service existence,
   * prevents overlapping bookings, and auto-calculates end time.
   *
   * @param createBookingDto - Booking data from client
   * @param user - Authenticated user
   * @returns Created appointment with related entities
   */
  async createBooking(
    createBookingDto: CreateBookingDto,
    user: AuthUser,
  ): Promise<Appointment> {
    const { staffId, serviceId, startTime: startTimeStr } = createBookingDto;
    const startTime = new Date(startTimeStr);

    // Validate start time is in the future
    this.validateStartTime(startTime);

    // Validate staff exists and belongs to the company
    const staff = await this.bookingRepository.findStaffById(staffId, user.companyId);
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Validate service exists and get its duration
    const service = await this.bookingRepository.findServiceById(serviceId, user.companyId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Calculate end time from service duration
    const endTime = this.calculateEndTime(startTime, service.duration);

    // Check for overlapping appointments
    await this.validateNoOverlap(staffId, startTime, endTime, user.companyId);

    // Build and create booking
    const bookingData: CreateBookingData = {
      companyId: user.companyId,
      userId: user.id,
      staffId,
      serviceId,
      startTime,
      endTime,
    };

    const appointment = await this.bookingRepository.create(bookingData);

    // Emit booking created event (async — does not block the response)
    this.emitBookingCreatedEvent(appointment, staff, service, user);

    return appointment;
  }

  /**
   * Get appointments with optional filters
   *
   * Returns appointments scoped to the user's company.
   * Clients can only see their own bookings; staff and admins see all.
   *
   * @param user - Authenticated user
   * @param filters - Optional query filters
   * @returns Array of appointments
   */
  async getBookings(
    user: AuthUser,
    filters?: Omit<BookingFilters, 'companyId'>,
  ): Promise<Appointment[]> {
    const bookingFilters: BookingFilters = {
      companyId: user.companyId,
      ...filters,
    };

    // Clients can only see their own bookings
    if (user.role === 'CLIENT') {
      bookingFilters.userId = user.id;
    }

    return this.bookingRepository.findByFilters(bookingFilters);
  }

  /**
   * Cancel an appointment
   *
   * Validates ownership/role, ensures appointment is in a cancellable state.
   *
   * @param appointmentId - Appointment to cancel
   * @param user - Authenticated user
   * @returns Updated appointment with CANCELLED status
   */
  async cancelBooking(appointmentId: string, user: AuthUser): Promise<Appointment> {
    // Find the appointment
    const appointment = await this.bookingRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify company scope (multi-tenant isolation)
    if (appointment.companyId !== user.companyId) {
      throw new NotFoundException('Appointment not found');
    }

    // Verify cancellation authorization
    this.validateCancelAuthorization(appointment, user);

    // Verify appointment is still cancellable
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be cancelled');
    }

    // Update status to CANCELLED
    const cancelled = await this.bookingRepository.update(appointmentId, {
      status: AppointmentStatus.CANCELLED,
    });

    if (!cancelled) {
      throw new BadRequestException('Failed to cancel appointment');
    }

    // Emit booking cancelled event (async — does not block the response)
    this.emitBookingCancelledEvent(cancelled, user);

    return cancelled;
  }

  /**
   * Validate that start time is in the future
   * @param startTime - Proposed start time
   * @throws BadRequestException if start time is in the past
   */
  private validateStartTime(startTime: Date): void {
    if (startTime <= new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }
  }

  /**
   * Calculate end time based on start time and service duration
   * @param startTime - Appointment start time
   * @param durationMinutes - Service duration in minutes
   * @returns Calculated end time
   */
  private calculateEndTime(startTime: Date, durationMinutes: number): Date {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
  }

  /**
   * Validate no overlapping bookings exist for the staff member
   * @param staffId - Staff member ID
   * @param startTime - New booking start time
   * @param endTime - New booking end time
   * @param companyId - Company ID
   * @throws ConflictException if overlap detected
   */
  private async validateNoOverlap(
    staffId: string,
    startTime: Date,
    endTime: Date,
    companyId: string,
  ): Promise<void> {
    const overlapping = await this.bookingRepository.findOverlapping(
      staffId,
      startTime,
      endTime,
      companyId,
    );

    if (overlapping.length > 0) {
      throw new ConflictException('Staff member already has a booking at this time');
    }
  }

  /**
   * Validate that user is authorized to cancel the appointment
   * @param appointment - The appointment to cancel
   * @param user - Authenticated user
   * @throws ForbiddenException if not authorized
   */
  private validateCancelAuthorization(appointment: Appointment, user: AuthUser): void {
    const isOwner = appointment.userId === user.id;
    const isAssignedStaff = appointment.staffId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAssignedStaff && !isAdmin) {
      throw new ForbiddenException('You are not authorized to cancel this appointment');
    }
  }

  /**
   * Emit booking created notification event
   *
   * Fire-and-forget — notification failures must not affect booking creation.
   */
  private emitBookingCreatedEvent(
    appointment: Appointment,
    staff: { id: string; name: string },
    service: { id: string; name: string; duration: number },
    user: AuthUser,
  ): void {
    try {
      const payload = buildBookingCreatedPayload({
        companyId: appointment.companyId,
        userId: appointment.userId,
        appointmentId: appointment.id,
        recipientEmail: user.email,
        recipientName: user.name,
        serviceName: service.name,
        staffName: staff.name,
        startTime: appointment.startTime.toISOString(),
      });

      this.eventEmitter.emit(NOTIFICATION_EVENTS.BOOKING_CREATED, payload);
    } catch {
      // Intentionally swallow — notifications must not break bookings
    }
  }

  /**
   * Emit booking cancelled notification event
   *
   * Fire-and-forget — notification failures must not affect cancellation.
   */
  private emitBookingCancelledEvent(
    appointment: Appointment,
    user: AuthUser,
  ): void {
    try {
      // Appointment includes related entities from findById/update
      const staffName = (appointment as any).staff?.name ?? 'Staff';
      const serviceName = (appointment as any).service?.name ?? 'Service';

      const payload = buildBookingCancelledPayload({
        companyId: appointment.companyId,
        userId: appointment.userId,
        appointmentId: appointment.id,
        recipientEmail: user.email,
        recipientName: user.name,
        serviceName,
        staffName,
        startTime: appointment.startTime.toISOString(),
      });

      this.eventEmitter.emit(NOTIFICATION_EVENTS.BOOKING_CANCELLED, payload);
    } catch {
      // Intentionally swallow — notifications must not break cancellations
    }
  }
}
