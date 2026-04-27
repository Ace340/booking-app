/**
 * Booking Service
 *
 * API calls for appointment bookings.
 * Consumed by React Query hooks — never by components directly.
 */

import { apiClient, API_CONFIG } from '@/lib/api'
import type {
  Appointment,
  AppointmentFilters,
  CreateAppointmentDto,
} from '@booking-app/types'

/**
 * Build query string from filter params, omitting undefined values.
 */
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
  /**
   * Fetch appointments with optional filters.
   */
  getAppointments: (filters: AppointmentFilters, token: string) => {
    const qs = buildQueryString(filters)
    return apiClient.get<Appointment[]>(
      `${API_CONFIG.endpoints.bookings.list}${qs}`,
      token,
    )
  },

  /**
   * Create a new appointment.
   */
  createAppointment: (data: CreateAppointmentDto, token: string) =>
    apiClient.post<Appointment>(
      API_CONFIG.endpoints.bookings.create,
      data,
      token,
    ),

  /**
   * Cancel an existing appointment.
   */
  cancelAppointment: (id: string, token: string) =>
    apiClient.patch<Appointment>(
      API_CONFIG.endpoints.bookings.cancel(id),
      undefined,
      token,
    ),
}
