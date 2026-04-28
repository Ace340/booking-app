/**
 * useStaff Hook
 *
 * Fetches the list of staff members with optional filters.
 * Obtains a Clerk session token internally via `useAuth()`.
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { staffService } from '@/services'
import type { StaffFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const STAFF_KEY = 'staff'

/**
 * @param filters - Optional query filters (name)
 */
export function useStaff(filters: StaffFilters) {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: [STAFF_KEY, filters],
    queryFn: async () => {
      const token = await getToken()
      return staffService.getStaff(filters, token!)
    },
    enabled: !!isSignedIn,
  })
}
