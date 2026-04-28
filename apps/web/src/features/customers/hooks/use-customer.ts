/**
 * useCustomer Hook
 *
 * Fetches a single customer by id.
 * Obtains a Clerk session token internally via `useAuth()`.
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { customerService } from '@/services'
import { CUSTOMERS_KEY } from './use-customers'

/**
 * @param id - Customer id to fetch
 *
 * @example
 * ```tsx
 * const { data: customer, isLoading, error } = useCustomer('123')
 * ```
 */
export function useCustomer(id: string) {
  const { getToken, isSignedIn } = useAuth()

  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: async () => {
      const token = await getToken()
      return customerService.getCustomer(id, token!)
    },
    enabled: !!isSignedIn && !!id,
  })
}
