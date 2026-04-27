/**
 * Booking Types
 *
 * Type definitions for the booking module.
 */

import { AppointmentStatus } from '@prisma/client';

/**
 * Booking Filters
 *
 * Query parameters for filtering appointments.
 * companyId is always required for multi-tenant isolation.
 */
export interface BookingFilters {
  companyId: string;
  staffId?: string;
  userId?: string;
  status?: AppointmentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Create Booking Data
 *
 * Internal data structure for creating a booking.
 * Used to pass validated data from service to repository.
 */
export interface CreateBookingData {
  companyId: string;
  userId: string;
  staffId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
}
