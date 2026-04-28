/**
 * Mock Factories
 *
 * Reusable factory functions for creating test fixtures.
 * Pure functions — each call returns a fresh object to prevent shared state.
 *
 * Usage:
 *   const user = createMockAuthUser();
 *   const userWithRole = createMockAuthUser({ role: 'ADMIN' });
 */

import { AppointmentStatus, UserRole } from '@prisma/client';
import { AuthUser } from '../../src/modules/auth/types/auth.types';
import { CreateBookingData } from '../../src/modules/booking/types/booking.types';

/**
 * Create a mock authenticated user.
 * Overrides merge with defaults — only specify what differs.
 */
export const createMockAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'user-1',
  clerkId: 'user_clerk_1',
  email: 'client@example.com',
  name: 'Test Client',
  role: UserRole.CLIENT,
  companyId: 'company-1',
  ...overrides,
});

/**
 * Create a mock admin user.
 */
export const createMockAdminUser = (overrides: Partial<AuthUser> = {}): AuthUser =>
  createMockAuthUser({
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Test Admin',
    role: UserRole.ADMIN,
    ...overrides,
  });

/**
 * Create a mock staff user.
 */
export const createMockStaffUser = (overrides: Partial<AuthUser> = {}): AuthUser =>
  createMockAuthUser({
    id: 'staff-user-1',
    email: 'staff@example.com',
    name: 'Test Staff',
    role: UserRole.STAFF,
    ...overrides,
  });

/**
 * Create a mock appointment (Prisma Appointment model shape).
 */
export const createMockAppointment = (overrides: Record<string, unknown> = {}) => ({
  id: 'appt-1',
  companyId: 'company-1',
  userId: 'user-1',
  staffId: 'staff-1',
  serviceId: 'service-1',
  startTime: new Date('2026-06-01T10:00:00.000Z'),
  endTime: new Date('2026-06-01T11:00:00.000Z'),
  status: AppointmentStatus.SCHEDULED,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

/**
 * Create mock CreateBookingDto data.
 */
export const createMockCreateBookingDto = (overrides: Record<string, string> = {}) => ({
  staffId: 'staff-1',
  serviceId: 'service-1',
  startTime: '2026-06-01T10:00:00.000Z',
  ...overrides,
});

/**
 * Create mock CreateBookingData (internal service data).
 */
export const createMockBookingData = (overrides: Partial<CreateBookingData> = {}): CreateBookingData => ({
  companyId: 'company-1',
  userId: 'user-1',
  staffId: 'staff-1',
  serviceId: 'service-1',
  startTime: new Date('2026-06-01T10:00:00.000Z'),
  endTime: new Date('2026-06-01T11:00:00.000Z'),
  ...overrides,
});

/**
 * Create a mock staff record (from Prisma query).
 */
export const createMockStaff = (overrides: Record<string, unknown> = {}) => ({
  id: 'staff-1',
  name: 'John Barber',
  ...overrides,
});

/**
 * Create a mock service record (from Prisma query).
 */
export const createMockService = (overrides: Record<string, unknown> = {}) => ({
  id: 'service-1',
  name: 'Haircut',
  duration: 60,
  ...overrides,
});
