/**
 * useCreateAppointment Hook (Mobile)
 *
 * Creates an appointment and auto-invalidates the appointments cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '../services'
import type { CreateAppointmentDto, Appointment } from '@booking-app/types'
import { APPOINTMENTS_KEY } from './use-appointments'

export function useCreateAppointment(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation<Appointment, Error, CreateAppointmentDto>({
    mutationFn: (data) => bookingService.createAppointment(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] })
    },
  })
}
