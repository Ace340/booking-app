/**
 * useCreateAppointment Hook
 *
 * Creates a new appointment and auto-invalidates the appointments list
 * so React Query refetches fresh data.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services'
import type { CreateAppointmentDto, Appointment } from '@booking-app/types'
import { APPOINTMENTS_KEY } from './use-appointments'

/**
 * @param token - JWT access token
 *
 * @example
 * ```tsx
 * const { mutate: createAppointment, isPending } = useCreateAppointment(token)
 *
 * createAppointment({ staffId, serviceId, startTime })
 * ```
 */
export function useCreateAppointment(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: (data) => bookingService.createAppointment(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}
