/**
 * Notification Events
 *
 * Event definitions for the notification system.
 * Domain services emit these events; the notification processor listens.
 *
 * Uses NestJS EventEmitter2 with typed event names.
 */

/**
 * Event names — constants prevent typos and enable refactor-safe code.
 */
export const NOTIFICATION_EVENTS = {
  BOOKING_CREATED: 'notification.booking.created',
  BOOKING_CANCELLED: 'notification.booking.cancelled',
  BOOKING_REMINDER: 'notification.booking.reminder',
} as const;

export type NotificationEventName =
  (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];

/**
 * Build a booking confirmation event payload.
 *
 * Pure function — same input always produces the same output.
 */
export const buildBookingCreatedPayload = (params: {
  companyId: string;
  userId: string;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  serviceName: string;
  staffName: string;
  startTime: string;
}): import('../types/notification.types').NotificationPayload => ({
  companyId: params.companyId,
  userId: params.userId,
  type: 'BOOKING_CONFIRMATION',
  appointmentId: params.appointmentId,
  recipientEmail: params.recipientEmail,
  recipientName: params.recipientName,
  data: {
    serviceName: params.serviceName,
    staffName: params.staffName,
    startTime: params.startTime,
  },
});

/**
 * Build a booking cancellation event payload.
 *
 * Pure function — same input always produces the same output.
 */
export const buildBookingCancelledPayload = (params: {
  companyId: string;
  userId: string;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  serviceName: string;
  staffName: string;
  startTime: string;
}): import('../types/notification.types').NotificationPayload => ({
  companyId: params.companyId,
  userId: params.userId,
  type: 'BOOKING_CANCELLATION',
  appointmentId: params.appointmentId,
  recipientEmail: params.recipientEmail,
  recipientName: params.recipientName,
  data: {
    serviceName: params.serviceName,
    staffName: params.staffName,
    startTime: params.startTime,
  },
});

/**
 * Build a booking reminder event payload.
 *
 * Pure function — same input always produces the same output.
 */
export const buildBookingReminderPayload = (params: {
  companyId: string;
  userId: string;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  serviceName: string;
  staffName: string;
  startTime: string;
}): import('../types/notification.types').NotificationPayload => ({
  companyId: params.companyId,
  userId: params.userId,
  type: 'BOOKING_REMINDER',
  appointmentId: params.appointmentId,
  recipientEmail: params.recipientEmail,
  recipientName: params.recipientName,
  data: {
    serviceName: params.serviceName,
    staffName: params.staffName,
    startTime: params.startTime,
  },
});

/**
 * Build the notification title from payload type.
 *
 * Pure function — maps type to human-readable title.
 */
export const buildNotificationTitle = (
  type: import('@prisma/client').NotificationType,
): string => {
  const titles: Record<string, string> = {
    BOOKING_CONFIRMATION: 'Booking Confirmed',
    BOOKING_REMINDER: 'Upcoming Appointment Reminder',
    BOOKING_CANCELLATION: 'Booking Cancelled',
  };
  return titles[type] ?? 'Notification';
};

/**
 * Build the notification message from payload.
 *
 * Pure function — generates a human-readable message.
 */
export const buildNotificationMessage = (
  type: import('@prisma/client').NotificationType,
  data: Record<string, unknown>,
): string => {
  const { serviceName, staffName, startTime } = data;
  const formattedTime = startTime
    ? new Date(startTime as string).toLocaleString()
    : 'N/A';

  const messages: Record<string, string> = {
    BOOKING_CONFIRMATION:
      `Your booking for ${serviceName} with ${staffName} on ${formattedTime} has been confirmed.`,
    BOOKING_REMINDER:
      `Reminder: You have an upcoming appointment for ${serviceName} with ${staffName} on ${formattedTime}.`,
    BOOKING_CANCELLATION:
      `Your booking for ${serviceName} with ${staffName} on ${formattedTime} has been cancelled.`,
  };

  return messages[type] ?? 'You have a new notification.';
};
