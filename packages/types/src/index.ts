/**
 * Shared TypeScript Types for Booking App
 *
 * Aligned with the Prisma schema and NestJS backend.
 * Used across web, mobile, and API applications.
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

export interface CreateUserDto {
  email: string
  name: string
  password: string
  companyId: string
  role?: UserRole
}

export interface UpdateUserDto {
  email?: string
  name?: string
}

// ─── Auth Types ──────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
  companyId: string
  role?: UserRole
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

// ─── Staff Types ─────────────────────────────────────────

export interface Staff {
  id: string
  companyId: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
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
