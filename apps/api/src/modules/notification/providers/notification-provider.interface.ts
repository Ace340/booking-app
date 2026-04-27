/**
 * Notification Provider Interface
 *
 * Contract for all notification channel providers.
 * Each provider handles delivery through a specific channel (email, push, SMS, etc.).
 *
 * To add a new channel:
 * 1. Create a class implementing INotificationProvider
 * 2. Register it as a provider in NotificationModule
 * 3. The dispatcher will automatically pick it up
 */

import { NotificationPayload } from '../types/notification.types';
import { ProviderResult } from '../types/notification.types';

export const NOTIFICATION_PROVIDER = Symbol('NOTIFICATION_PROVIDER');

/**
 * Notification Provider Interface
 *
 * All notification channels must implement this interface.
 * Providers are stateless — they receive a payload and return a result.
 */
export interface INotificationProvider {
  /**
   * Unique channel identifier (e.g., 'email', 'push', 'sms')
   */
  readonly channel: string;

  /**
   * Send a notification through this channel
   *
   * @param payload - The notification payload to deliver
   * @returns Result indicating success/failure
   */
  send(payload: NotificationPayload): Promise<ProviderResult>;
}
