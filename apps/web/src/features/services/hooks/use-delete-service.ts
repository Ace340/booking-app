/**
 * useDeleteService Hook
 *
 * Deletes a service and auto-invalidates the services list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceService } from '@/services'
import { SERVICES_KEY } from './use-services'

/**
 * @param token - JWT access token
 */
export function useDeleteService(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => serviceService.deleteService(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] })
    },
  })
}
