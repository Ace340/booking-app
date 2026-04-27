/**
 * Console Notification Provider
 *
 * Development provider that logs notifications to console.
 * Used as the default channel when no real providers are configured.
 *
 * Safe for production — just logs, no side effects beyond console output.
 */

import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider } from './notification-provider.interface';
import { NotificationPayload, ProviderResult } from '../types/notification.types';

@Injectable()
export class ConsoleNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(ConsoleNotificationProvider.name);
  readonly channel = 'console';

  /**
   * Send a notification by logging it to the console
   *
   * @param payload - The notification payload
   * @returns Provider result (always succeeds)
   */
  async send(payload: NotificationPayload): Promise<ProviderResult> {
    const timestamp = new Date();

    this.logger.log(
      [
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `  📬 NOTIFICATION [${payload.type}]`,
        `  To: ${payload.recipientName} <${payload.recipientEmail}>`,
        `  Company: ${payload.companyId}`,
        `  Appointment: ${payload.appointmentId}`,
        `  Data: ${JSON.stringify(payload.data, null, 2)}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ].join('\n'),
    );

    return {
      provider: this.channel,
      success: true,
      timestamp,
    };
  }
}
