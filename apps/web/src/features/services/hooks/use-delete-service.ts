/**
 * useDeleteService Hook
 *
 * Deletes a service and auto-invalidates the services list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { serviceService } from '@/services'
import { SERVICES_KEY } from './use-services'

export function useDeleteService() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = await getToken()
      return serviceService.deleteService(id, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] })
    },
  })
}
