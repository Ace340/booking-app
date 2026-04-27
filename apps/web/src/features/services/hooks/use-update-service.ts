/**
 * useUpdateService Hook
 *
 * Updates an existing service and auto-invalidates the services list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceService } from '@/services'
import type { UpdateServiceDto, Service } from '@booking-app/types'
import { SERVICES_KEY } from './use-services'

interface UpdateServiceVariables {
  id: string
  data: UpdateServiceDto
}

/**
 * @param token - JWT access token
 */
export function useUpdateService(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Service, Error, UpdateServiceVariables>({
    mutationFn: ({ id, data }) => serviceService.updateService(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] })
    },
  })
}
