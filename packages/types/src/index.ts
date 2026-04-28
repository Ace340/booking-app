/**
 * Shared TypeScript Types for Booking App
 *
 * Aligned with the Prisma schema and NestJS backend.
 * Used across web, mobile, and API applications.
 *
 * Note: Authentication is handled by Clerk.
 * Login/register DTOs are intentionally omitted —
 * Clerk manages sign-up, sign-in, passwords, and sessions.
 */

// ─── Enums ───────────────────────────────────────────────

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
}

// ─── User Types ──────────────────────────────────────────

export interface User {
  id: string
  companyId: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UpdateUserDto {
  email?: string
  name?: string
}

// ─── Auth Types (Clerk-managed) ──────────────────────────

/**
 * User profile returned by our backend's /auth/me endpoint.
 * Combines Clerk identity with local DB fields.
 */
export interface UserProfile {
  id: string
  clerkId: string
  email: string
  name: string
  role: UserRole
  companyId: string
}

// ─── Service Types ───────────────────────────────────────

export interface Service {
  id: string
  companyId: string
  name: string
  duration: number
  price: number
  createdAt: string
  updatedAt: string
}

export interface CreateServiceDto {
  name: string
  duration: number
  price: number
}

export interface UpdateServiceDto {
  name?: string
  duration?: number
  price?: number
}

export interface ServiceFilters {
  name?: string
}

// ─── Staff Types ─────────────────────────────────────────

export interface Staff {
  id: string
  companyId: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface CreateStaffDto {
  name: string
  email: string
}

export interface UpdateStaffDto {
  name?: string
  email?: string
}

export interface StaffFilters {
  name?: string
}

// ─── Appointment Types ───────────────────────────────────

export interface Appointment {
  id: string
  companyId: string
  userId: string
  staffId: string
  serviceId: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentDto {
  staffId: string
  serviceId: string
  startTime: string
}

export interface AppointmentFilters {
  staffId?: string
  status?: AppointmentStatus
  dateFrom?: string
  dateTo?: string
}

export interface CustomerFilters {
  search?: string
}

// ─── API Response Types ──────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Utility Types ───────────────────────────────────────

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & { createdAt: string; updatedAt: string }
