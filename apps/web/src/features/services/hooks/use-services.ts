/**
 * useServices Hook
 *
 * Fetches the list of services with optional filters.
 * Wraps React Query's `useQuery` — components only consume this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { serviceService } from '@/services'
import type { ServiceFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const SERVICES_KEY = 'services'

/**
 * @param filters - Optional query filters (name)
 * @param token   - JWT access token
 */
export function useServices(
  filters: ServiceFilters,
  token: string | null,
) {
  return useQuery({
    queryKey: [SERVICES_KEY, filters],
    queryFn: () => serviceService.getServices(filters, token!),
    enabled: Boolean(token),
  })
}
