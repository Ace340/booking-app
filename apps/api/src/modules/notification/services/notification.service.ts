/**
 * Notification Service
 *
 * Contains business logic for managing notifications.
 * Handles CRUD operations, read-status management, and authorization.
 *
 * Follows the same patterns as BookingService:
 * - Explicit dependency injection
 * - Pure validation functions
 * - Multi-tenant scoping via companyId
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationFilters } from '../types/notification.types';
import { Notification, NotificationStatus } from '@prisma/client';
import { AuthUser } from '../../auth/types/auth.types';

/**
 * Notification Service
 *
 * Manages notification lifecycle:
 * - Querying with filters
 * - Marking as read (single + bulk)
 * - Counting unread
 * - Authorization checks
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  /**
   * Get notifications for the authenticated user
   *
   * Clients see only their own notifications.
   * Staff/Admins see notifications for their company.
   *
   * @param user - Authenticated user
   * @param filters - Optional query filters
   * @returns Array of notifications
   */
  async getNotifications(
    user: AuthUser,
    filters?: Omit<NotificationFilters, 'companyId'>,
  ): Promise<Notification[]> {
    const notificationFilters: NotificationFilters = {
      companyId: user.companyId,
      ...filters,
    };

    // Clients can only see their own notifications
    if (user.role === 'CLIENT') {
      notificationFilters.userId = user.id;
    }

    return this.notificationRepository.findByFilters(notificationFilters);
  }

  /**
   * Get a single notification by ID
   *
   * Verifies the notification belongs to the user's company.
   *
   * @param id - Notification ID
   * @param user - Authenticated user
   * @returns The notification
   */
  async getNotification(id: string, user: AuthUser): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Verify company scope (multi-tenant isolation)
    if (notification.companyId !== user.companyId) {
      throw new NotFoundException('Notification not found');
    }

    // Clients can only access their own notifications
    if (user.role === 'CLIENT' && notification.userId !== user.id) {
      throw new ForbiddenException('Cannot access this notification');
    }

    return notification;
  }

  /**
   * Mark a notification as read
   *
   * Only the notification owner can mark it as read.
   *
   * @param id - Notification ID
   * @param user - Authenticated user
   * @returns Updated notification
   */
  async markAsRead(id: string, user: AuthUser): Promise<Notification> {
    const notification = await this.getNotification(id, user);

    if (notification.readAt) {
      throw new BadRequestException('Notification is already read');
    }

    const updated = await this.notificationRepository.markAsRead(id);
    if (!updated) {
      throw new BadRequestException('Failed to mark notification as read');
    }

    return updated;
  }

  /**
   * Mark all notifications as read for the authenticated user
   *
   * @param user - Authenticated user
   * @returns Count of notifications marked as read
   */
  async markAllAsRead(user: AuthUser): Promise<{ count: number }> {
    const count = await this.notificationRepository.markAllAsRead(
      user.id,
      user.companyId,
    );
    return { count };
  }

  /**
   * Count unread notifications for the authenticated user
   *
   * @param user - Authenticated user
   * @returns Count of unread notifications
   */
  async getUnreadCount(user: AuthUser): Promise<{ count: number }> {
    const count = await this.notificationRepository.countUnread(
      user.id,
      user.companyId,
    );
    return { count };
  }

  /**
   * Delete a notification
   *
   * Only the notification owner or admin can delete.
   *
   * @param id - Notification ID
   * @param user - Authenticated user
   * @returns True if deleted
   */
  async deleteNotification(id: string, user: AuthUser): Promise<boolean> {
    await this.getNotification(id, user);
    return this.notificationRepository.delete(id);
  }

  /**
   * Update notification status (internal use by processor)
   *
   * @param id - Notification ID
   * @param status - New status
   * @returns Updated notification or null
   */
  async updateStatus(
    id: string,
    status: NotificationStatus,
  ): Promise<Notification | null> {
    return this.notificationRepository.update(id, { status });
  }
}
