/**
 * Booking Service (Mobile)
 *
 * API calls for appointment bookings using the shared api-client.
 * Unwraps ApiResponse envelope so hooks receive clean data.
 * Consumed by hooks — never by components directly.
 */

import { apiService } from './api-client'
import type {
  Appointment,
  AppointmentFilters,
  CreateAppointmentDto,
} from '@booking-app/types'

const ENDPOINTS = {
  list: '/bookings',
  create: '/bookings',
  cancel: (id: string) => `/bookings/${id}/cancel`,
} as const

function buildQueryString(filters: AppointmentFilters): string {
  const params = new URLSearchParams()

  if (filters.staffId) params.set('staffId', filters.staffId)
  if (filters.status) params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const bookingService = {
  getAppointments: async (
    filters: AppointmentFilters,
    token: string,
  ): Promise<Appointment[]> => {
    const qs = buildQueryString(filters)
    const response = await apiService.get<Appointment[]>(
      `${ENDPOINTS.list}${qs}`,
      token,
    )
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to fetch appointments')
    }
    return response.data
  },

  createAppointment: async (
    data: CreateAppointmentDto,
    token: string,
  ): Promise<Appointment> => {
    const response = await apiService.post<Appointment>(
      ENDPOINTS.create,
      data,
      token,
    )
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to create appointment')
    }
    return response.data
  },

  cancelAppointment: async (
    id: string,
    token: string,
  ): Promise<Appointment> => {
    const response = await apiService.patch<Appointment>(
      ENDPOINTS.cancel(id),
      undefined,
      token,
    )
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Failed to cancel appointment')
    }
    return response.data
  },
}
