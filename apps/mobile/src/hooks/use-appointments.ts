/**
 * useAppointments Hook (Mobile)
 *
 * Fetches appointments list with optional filters.
 * The api-client auto-attaches Clerk tokens.
 * Wraps React Query's useQuery — components consume only this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { bookingService } from '../services'
import type { AppointmentFilters } from '@booking-app/types'

export const APPOINTMENTS_KEY = 'appointments'

export function useAppointments(filters: AppointmentFilters) {
  const { isSignedIn } = useAuth()

  return useQuery({
    queryKey: [APPOINTMENTS_KEY, filters],
    queryFn: () => bookingService.getAppointments(filters),
    enabled: !!isSignedIn,
  })
}
