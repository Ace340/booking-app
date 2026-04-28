/**
 * useAppointments Hook
 *
 * Fetches the list of appointments with optional filters.
 * Obtains a Clerk session token internally via `useAuth()`.
 * Components consume only this hook — never the service directly.
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { bookingService } from '@/services'
import type { AppointmentFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const APPOINTMENTS_KEY = 'appointments'

/**
 * @param filters - Optional query filters (staffId, status, dateFrom, dateTo)
 *
 * @example
 * ```tsx
 * const { data: appointments, isLoading, error } = useAppointments({})
 * ```
 */
export function useAppointments(filters: AppointmentFilters) {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: [APPOINTMENTS_KEY, filters],
    queryFn: async () => {
      const token = await getToken()
      return bookingService.getAppointments(filters, token!)
    },
    enabled: !!isSignedIn,
  })
}
