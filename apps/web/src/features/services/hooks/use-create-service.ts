/**
 * useCreateService Hook
 *
 * Creates a new service and auto-invalidates the services list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceService } from '@/services'
import type { CreateServiceDto, Service } from '@booking-app/types'
import { SERVICES_KEY } from './use-services'

/**
 * @param token - JWT access token
 */
export function useCreateService(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Service, Error, CreateServiceDto>({
    mutationFn: (data) => serviceService.createService(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] })
    },
  })
}
