/**
 * useDeleteStaff Hook
 *
 * Deletes a staff member and auto-invalidates the staff list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '@/services'
import { STAFF_KEY } from './use-staff'

/**
 * @param token - JWT access token
 */
export function useDeleteStaff(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => staffService.deleteStaff(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
    },
  })
}
