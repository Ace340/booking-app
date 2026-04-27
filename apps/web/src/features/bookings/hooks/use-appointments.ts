/**
 * useAppointments Hook
 *
 * Fetches the list of appointments with optional filters.
 * Wraps React Query's `useQuery` — components only consume this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/services'
import type { AppointmentFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const APPOINTMENTS_KEY = 'appointments'

/**
 * @param filters - Optional query filters (staffId, status, dateFrom, dateTo)
 * @param token   - JWT access token
 *
 * @example
 * ```tsx
 * const { data: appointments, isLoading, error } = useAppointments({}, token)
 * ```
 */
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
