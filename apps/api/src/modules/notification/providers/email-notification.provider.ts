/**
 * Email Notification Provider
 *
 * Placeholder provider for email notifications.
 * Throws NotImplementedException until a real email service is integrated.
 *
 * To integrate:
 * 1. Install an email SDK (nodemailer, sendgrid, etc.)
 * 2. Replace the send() body with actual email delivery logic
 * 3. Add email configuration to environment variables
 */

import { Injectable, NotImplementedException, Logger } from '@nestjs/common';
import { INotificationProvider } from './notification-provider.interface';
import { NotificationPayload, ProviderResult } from '../types/notification.types';

@Injectable()
export class EmailNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(EmailNotificationProvider.name);
  readonly channel = 'email';

  /**
   * Send an email notification
   *
   * @param payload - The notification payload
   * @throws NotImplementedException — not yet integrated
   */
  async send(payload: NotificationPayload): Promise<ProviderResult> {
    this.logger.warn(
      `Email provider not integrated. Would send to: ${payload.recipientEmail}`,
    );

    throw new NotImplementedException(
      'Email notifications are not yet configured. ' +
      'Integrate an email service (e.g., Nodemailer, SendGrid) to enable this channel.',
    );
  }
}
