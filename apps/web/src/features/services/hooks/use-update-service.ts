/**
 * useUpdateService Hook
 *
 * Updates an existing service and auto-invalidates the services list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { serviceService } from '@/services'
import type { UpdateServiceDto, Service } from '@booking-app/types'
import { SERVICES_KEY } from './use-services'

interface UpdateServiceVariables {
  id: string
  data: UpdateServiceDto
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Service, Error, UpdateServiceVariables>({
    mutationFn: async ({ id, data }) => {
      const token = await getToken()
      return serviceService.updateService(id, data, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] })
    },
  })
}
