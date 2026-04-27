/**
 * Notification Module
 *
 * Encapsulates all notification functionality.
 * Follows dependency injection and separation of concerns.
 *
 * Architecture:
 * - Controller: HTTP endpoints for reading/managing notifications
 * - Service: Business logic (authorization, read-status, filtering)
 * - Dispatcher: Routes to all registered providers
 * - Event Processor: Listens to domain events, persists + dispatches
 * - Repository: Database access (Prisma queries)
 * - Providers: Channel-specific delivery (console, email placeholder, push placeholder)
 *
 * Provider Registration:
 * Only the ConsoleNotificationProvider is active by default.
 * Email and push providers are registered but will throw NotImplementedException
 * until real integrations are added.
 *
 * To enable a real provider:
 * 1. Implement the provider's send() method
 * 2. Remove the NotImplementedException
 * 3. The dispatcher will automatically pick it up
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationDispatcherService } from './services/notification-dispatcher.service';
import { NotificationEventProcessor } from './processors/notification-event.processor';
import { NotificationRepository } from './repositories/notification.repository';
import { ConsoleNotificationProvider } from './providers/console-notification.provider';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { INotificationProvider, NOTIFICATION_PROVIDER } from './providers/notification-provider.interface';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Notification Module
 *
 * Provides notification management and delivery functionality.
 * Exports service for use in other modules if needed.
 */
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Use wildcard to support dot-notation event names
      wildcard: true,
      // Delimiter for wildcard events
      delimiter: '.',
      // Process events asynchronously
      maxListeners: 10,
    }),
  ],
  controllers: [NotificationController],
  providers: [
    PrismaService,
    NotificationRepository,
    // Register individual provider implementations
    ConsoleNotificationProvider,
    EmailNotificationProvider,
    PushNotificationProvider,
    // Collect all providers into the NOTIFICATION_PROVIDER token
    {
      provide: NOTIFICATION_PROVIDER,
      useFactory: (
        consoleProvider: ConsoleNotificationProvider,
        emailProvider: EmailNotificationProvider,
        pushProvider: PushNotificationProvider,
      ): INotificationProvider[] => [consoleProvider, emailProvider, pushProvider],
      inject: [ConsoleNotificationProvider, EmailNotificationProvider, PushNotificationProvider],
    },
    // Services and processor
    NotificationService,
    NotificationDispatcherService,
    NotificationEventProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
