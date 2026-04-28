/**
 * useCustomers Hook
 *
 * Fetches the list of customers with optional search filters.
 * Obtains a Clerk session token internally via `useAuth()`.
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { customerService } from '@/services'
import type { CustomerFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const CUSTOMERS_KEY = 'customers'

/**
 * @param filters - Optional query filters (search)
 */
export function useCustomers(filters: CustomerFilters) {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: [CUSTOMERS_KEY, filters],
    queryFn: async () => {
      const token = await getToken()
      return customerService.getCustomers(filters, token!)
    },
    enabled: !!isSignedIn,
  })
}
