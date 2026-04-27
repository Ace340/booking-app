/**
 * Notification Repository
 *
 * Handles database operations for notifications.
 * Follows clean architecture: pure data access, no business logic.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Notification, NotificationStatus, Prisma } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import { NotificationFilters, CreateNotificationData } from '../types/notification.types';

/**
 * Notification Repository
 *
 * Provides database access methods for notifications.
 * All methods are pure functions with explicit dependencies.
 */
@Injectable()
export class NotificationRepository implements BaseRepositoryInterface<Notification> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a notification by ID
   * @param id - Notification ID
   * @returns Notification with user relation or null
   */
  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Find all notifications matching optional criteria
   * @param criteria - Optional filter criteria
   * @returns Array of notifications
   */
  async findAll(criteria?: Partial<Notification>): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: this.buildWhereClause(criteria),
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find notifications by typed filters
   * @param filters - NotificationFilters object
   * @returns Array of notifications with user relation
   */
  async findByFilters(filters: NotificationFilters): Promise<Notification[]> {
    const where: Record<string, unknown> = {
      companyId: filters.companyId,
    };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.unreadOnly) {
      where.readAt = null;
    }

    return this.prisma.notification.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new notification (BaseRepositoryInterface compliance)
   * @param data - Partial notification data
   * @returns Created notification with user relation
   */
  async create(data: Partial<Notification>): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        companyId: data.companyId!,
        userId: data.userId!,
        type: data.type!,
        title: data.title!,
        message: data.message!,
        status: data.status ?? NotificationStatus.PENDING,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Create a notification from typed data (module-specific convenience)
   * @param data - Notification creation data
   * @returns Created notification with user relation
   */
  async createFromData(data: CreateNotificationData): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        status: NotificationStatus.PENDING,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Update an existing notification
   * @param id - Notification ID
   * @param data - Partial notification data
   * @returns Updated notification or null if not found
   */
  async update(id: string, data: Partial<Notification>): Promise<Notification | null> {
    try {
      const updateData: Prisma.NotificationUncheckedUpdateWithoutUserInput = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.readAt !== undefined) updateData.readAt = data.readAt;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.message !== undefined) updateData.message = data.message;
      if (data.metadata !== undefined) updateData.metadata = data.metadata as Prisma.InputJsonValue;

      return await this.prisma.notification.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Mark a notification as read
   * @param id - Notification ID
   * @returns Updated notification or null if not found
   */
  async markAsRead(id: string): Promise<Notification | null> {
    return this.update(id, {
      readAt: new Date(),
      status: NotificationStatus.READ,
    });
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Count of updated notifications
   */
  async markAllAsRead(userId: string, companyId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        companyId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });
    return result.count;
  }

  /**
   * Count unread notifications for a user
   * @param userId - User ID
   * @param companyId - Company ID for multi-tenant isolation
   * @returns Count of unread notifications
   */
  async countUnread(userId: string, companyId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        companyId,
        readAt: null,
      },
    });
  }

  /**
   * Delete a notification
   * @param id - Notification ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.notification.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a notification exists
   * @param id - Notification ID
   * @returns True if exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    return notification !== null;
  }

  /**
   * Build where clause from partial entity filters
   * @param filters - Optional filter criteria
   * @returns Prisma where clause
   */
  private buildWhereClause(filters?: Partial<Notification>): Record<string, unknown> {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }
}
