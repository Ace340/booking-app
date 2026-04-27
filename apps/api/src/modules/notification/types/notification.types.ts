/**
 * Notification Types
 *
 * Type definitions for the notification module.
 * All types are pure — no runtime logic.
 */

import { NotificationType, NotificationStatus } from '@prisma/client';

/**
 * Notification Filters
 *
 * Query parameters for filtering notifications.
 * companyId is always required for multi-tenant isolation.
 */
export interface NotificationFilters {
  companyId: string;
  userId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  unreadOnly?: boolean;
}

/**
 * Create Notification Data
 *
 * Internal data structure for creating a notification.
 * Passed from event processor to repository.
 */
export interface CreateNotificationData {
  companyId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification Payload
 *
 * Event payload emitted by domain services (e.g., BookingService).
 * Contains everything needed to build and dispatch a notification.
 */
export interface NotificationPayload {
  companyId: string;
  userId: string;
  type: NotificationType;
  appointmentId: string;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, unknown>;
}

/**
 * Provider Result
 *
 * Result returned by a notification provider after attempting delivery.
 */
export interface ProviderResult {
  provider: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}
