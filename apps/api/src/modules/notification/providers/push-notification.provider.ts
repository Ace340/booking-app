/**
 * Push Notification Provider
 *
 * Placeholder provider for push notifications (mobile + web).
 * Throws NotImplementedException until a real push service is integrated.
 *
 * To integrate:
 * 1. Install a push notification SDK (expo-push, firebase-admin, web-push)
 * 2. Replace the send() body with actual push delivery logic
 * 3. Add push configuration to environment variables
 * 4. Store device tokens in a new DeviceToken model
 */

import { Injectable, NotImplementedException, Logger } from '@nestjs/common';
import { INotificationProvider } from './notification-provider.interface';
import { NotificationPayload, ProviderResult } from '../types/notification.types';

@Injectable()
export class PushNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(PushNotificationProvider.name);
  readonly channel = 'push';

  /**
   * Send a push notification
   *
   * @param payload - The notification payload
   * @throws NotImplementedException — not yet integrated
   */
  async send(payload: NotificationPayload): Promise<ProviderResult> {
    this.logger.warn(
      `Push provider not integrated. Would push to user: ${payload.userId}`,
    );

    throw new NotImplementedException(
      'Push notifications are not yet configured. ' +
      'Integrate a push service (e.g., Expo Push, Firebase) to enable this channel.',
    );
  }
}
