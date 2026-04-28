/**
 * useCreateService Hook
 *
 * Creates a new service and auto-invalidates the services list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { serviceService } from '@/services'
import type { CreateServiceDto, Service } from '@booking-app/types'
import { SERVICES_KEY } from './use-services'

export function useCreateService() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation<Service, Error, CreateServiceDto>({
    mutationFn: async (data) => {
      const token = await getToken()
      return serviceService.createService(data, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] })
    },
  })
}
