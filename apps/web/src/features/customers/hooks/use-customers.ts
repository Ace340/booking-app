/**
 * useCustomers Hook
 *
 * Fetches the list of customers with optional search filters.
 * Wraps React Query's `useQuery` — components only consume this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/services'
import type { CustomerFilters } from '@booking-app/types'

/** Unique key for React Query cache identification. */
export const CUSTOMERS_KEY = 'customers'

/**
 * @param filters - Optional query filters (search)
 * @param token   - JWT access token
 */
export function useCustomers(
  filters: CustomerFilters,
  token: string | null,
) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, filters],
    queryFn: () => customerService.getCustomers(filters, token!),
    enabled: Boolean(token),
  })
}
