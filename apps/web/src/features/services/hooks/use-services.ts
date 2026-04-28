/**
 * useServices Hook
 *
 * Fetches the list of services with optional filters.
 * Obtains a Clerk session token internally via `useAuth()`.
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { serviceService } from '@/services'
import type { ServiceFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const SERVICES_KEY = 'services'

/**
 * @param filters - Optional query filters (name)
 */
export function useServices(filters: ServiceFilters) {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: [SERVICES_KEY, filters],
    queryFn: async () => {
      const token = await getToken()
      return serviceService.getServices(filters, token!)
    },
    enabled: !!isSignedIn,
  })
}
