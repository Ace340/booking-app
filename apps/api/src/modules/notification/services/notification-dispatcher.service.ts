/**
 * Notification Dispatcher Service
 *
 * Routes notification payloads to all registered providers.
 * Handles provider failures gracefully — one provider failing
 * does not prevent others from receiving the notification.
 *
 * Design:
 * - Collects all INotificationProvider implementations via DI
 * - Dispatches to each in parallel (fire-and-forget per provider)
 * - Logs failures without throwing (resilient)
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { INotificationProvider, NOTIFICATION_PROVIDER } from '../providers/notification-provider.interface';
import { NotificationPayload, ProviderResult } from '../types/notification.types';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);
  private readonly providers: INotificationProvider[];

  constructor(
    @Optional() @Inject(NOTIFICATION_PROVIDER) providers: INotificationProvider | INotificationProvider[],
  ) {
    // Handle both single and array injection
    this.providers = Array.isArray(providers) ? providers : providers ? [providers] : [];
  }

  /**
   * Dispatch a notification to all registered providers
   *
   * Each provider runs independently. Failures are logged
   * but do not affect other providers or the caller.
   *
   * @param payload - The notification to dispatch
   * @returns Array of results from all providers
   */
  async dispatch(payload: NotificationPayload): Promise<ProviderResult[]> {
    if (this.providers.length === 0) {
      this.logger.warn('No notification providers registered');
      return [];
    }

    const results = await Promise.all(
      this.providers.map((provider) => this.dispatchToProvider(provider, payload)),
    );

    return results;
  }

  /**
   * Dispatch to a single provider with error isolation
   *
   * Catches and logs any error, returning a failed ProviderResult
   * instead of throwing. This ensures one provider's failure
   * doesn't block others.
   *
   * @param provider - The provider to send to
   * @param payload - The notification payload
   * @returns Provider result (success or failure)
   */
  private async dispatchToProvider(
    provider: INotificationProvider,
    payload: NotificationPayload,
  ): Promise<ProviderResult> {
    try {
      return await provider.send(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Provider "${provider.channel}" failed for notification type "${payload.type}": ${message}`,
      );

      return {
        provider: provider.channel,
        success: false,
        error: message,
        timestamp: new Date(),
      };
    }
  }
}
