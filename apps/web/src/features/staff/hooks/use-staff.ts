/**
 * useStaff Hook
 *
 * Fetches the list of staff members with optional filters.
 * Wraps React Query's `useQuery` — components only consume this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { staffService } from '@/services'
import type { StaffFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const STAFF_KEY = 'staff'

/**
 * @param filters - Optional query filters (name)
 * @param token   - JWT access token
 */
export function useStaff(
  filters: StaffFilters,
  token: string | null,
) {
  return useQuery({
    queryKey: [STAFF_KEY, filters],
    queryFn: () => staffService.getStaff(filters, token!),
    enabled: Boolean(token),
  })
}
