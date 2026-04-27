/**
 * useCustomer Hook
 *
 * Fetches a single customer by id.
 * Wraps React Query's `useQuery` — components only consume this hook.
 */

import { useQuery } from '@tanstack/react-query'
import { customerService } from '@/services'
import { CUSTOMERS_KEY } from './use-customers'

/**
 * @param id    - Customer id to fetch
 * @param token - JWT access token
 *
 * @example
 * ```tsx
 * const { data: customer, isLoading, error } = useCustomer('123', token)
 * ```
 */
export function useCustomer(
  id: string,
  token: string | null,
) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: () => customerService.getCustomer(id, token!),
    enabled: Boolean(token) && Boolean(id),
  })
}
