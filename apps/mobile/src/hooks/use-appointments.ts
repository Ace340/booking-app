/**
 * useAppointments Hook (Mobile)
 *
 * Fetches appointments list with optional filters.
 * Wraps React Query's useQuery — components consume only this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { bookingService } from '../services'
import type { AppointmentFilters } from '@booking-app/types'

export const APPOINTMENTS_KEY = 'appointments'

export function useAppointments(
  filters: AppointmentFilters,
  token: string | null,
) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, filters],
    queryFn: () => bookingService.getAppointments(filters, token!),
    enabled: Boolean(token),
  })
}
