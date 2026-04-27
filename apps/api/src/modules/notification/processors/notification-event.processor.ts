/**
 * Notification Event Processor
 *
 * Listens to domain events and processes them into notifications.
 * This is the async bridge between business actions and notification delivery.
 *
 * Flow:
 * 1. Domain service (e.g., BookingService) emits an event via EventEmitter2
 * 2. This processor catches the event
 * 3. Builds notification title/message from payload
 * 4. Persists the notification to the database
 * 5. Dispatches to all notification providers (console, email, push)
 * 6. Updates notification status based on dispatch results
 *
 * Error handling: failures are logged but do not throw — the domain
 * action (e.g., booking creation) should never fail due to notification issues.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationDispatcherService } from '../services/notification-dispatcher.service';
import { NotificationService } from '../services/notification.service';
import { NotificationPayload } from '../types/notification.types';
import { NotificationStatus } from '@prisma/client';
import {
  NOTIFICATION_EVENTS,
  buildNotificationTitle,
  buildNotificationMessage,
} from '../events/notification.events';

@Injectable()
export class NotificationEventProcessor {
  private readonly logger = new Logger(NotificationEventProcessor.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly dispatcherService: NotificationDispatcherService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Handle booking created event
   *
   * Creates a BOOKING_CONFIRMATION notification and dispatches it.
   */
  @OnEvent(NOTIFICATION_EVENTS.BOOKING_CREATED)
  async handleBookingCreated(payload: NotificationPayload): Promise<void> {
    await this.processNotification(payload);
  }

  /**
   * Handle booking cancelled event
   *
   * Creates a BOOKING_CANCELLATION notification and dispatches it.
   */
  @OnEvent(NOTIFICATION_EVENTS.BOOKING_CANCELLED)
  async handleBookingCancelled(payload: NotificationPayload): Promise<void> {
    await this.processNotification(payload);
  }

  /**
   * Handle booking reminder event
   *
   * Creates a BOOKING_REMINDER notification and dispatches it.
   */
  @OnEvent(NOTIFICATION_EVENTS.BOOKING_REMINDER)
  async handleBookingReminder(payload: NotificationPayload): Promise<void> {
    await this.processNotification(payload);
  }

  /**
   * Process a notification event
   *
   * Core pipeline: persist → dispatch → update status.
   * Wrapped in try/catch to prevent notification failures
   * from affecting the originating domain action.
   *
   * @param payload - The notification event payload
   */
  private async processNotification(payload: NotificationPayload): Promise<void> {
    try {
      // 1. Build notification content
      const title = buildNotificationTitle(payload.type);
      const message = buildNotificationMessage(payload.type, payload.data);

      // 2. Persist to database
      const notification = await this.notificationRepository.createFromData({
        companyId: payload.companyId,
        userId: payload.userId,
        type: payload.type,
        title,
        message,
        metadata: {
          appointmentId: payload.appointmentId,
          recipientEmail: payload.recipientEmail,
          recipientName: payload.recipientName,
          ...payload.data,
        },
      });

      this.logger.log(
        `Notification created: ${notification.id} [${payload.type}] for user ${payload.userId}`,
      );

      // 3. Dispatch to providers
      const results = await this.dispatcherService.dispatch(payload);

      // 4. Determine overall status from provider results
      const status = this.determineStatus(results);

      // 5. Update notification status
      await this.notificationService.updateStatus(notification.id, status);

      this.logger.log(
        `Notification ${notification.id} dispatched via ${results.length} provider(s). Status: ${status}`,
      );
    } catch (error) {
      // Log but never throw — notifications must not break domain actions
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process notification [${payload.type}] for user ${payload.userId}: ${message}`,
      );
    }
  }

  /**
   * Determine notification status from provider results
   *
   * If any provider succeeded → SENT
   * If all providers failed → FAILED
   *
   * @param results - Provider delivery results
   * @returns Final notification status
   */
  private determineStatus(
    results: { success: boolean }[],
  ): NotificationStatus {
    if (results.length === 0) {
      return NotificationStatus.PENDING;
    }

    const anySuccess = results.some((r) => r.success);
    return anySuccess ? NotificationStatus.SENT : NotificationStatus.FAILED;
  }
}
