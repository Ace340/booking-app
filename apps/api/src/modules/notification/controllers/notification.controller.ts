/**
 * Notification Controller
 *
 * Handles HTTP requests for notifications.
 * Follows clean architecture: only HTTP logic, no business logic.
 */

import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { NotificationFiltersDto } from '../dto';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  AuthUser as AuthUserType,
} from '../../auth';
import { Notification } from '@prisma/client';

/**
 * Notification Controller
 *
 * Provides endpoints for managing notifications.
 * All routes require JWT authentication.
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get notifications with optional filters
   * @param user - Authenticated user
   * @param filters - Query filters (userId, type, status, unreadOnly)
   * @returns Array of notifications
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: AuthUserType,
    @Query() filters: NotificationFiltersDto,
  ): Promise<Notification[]> {
    return this.notificationService.getNotifications(user, {
      userId: filters.userId,
      type: filters.type as any,
      status: filters.status as any,
      unreadOnly: filters.unreadOnly,
    });
  }

  /**
   * Get unread notification count
   * @param user - Authenticated user
   * @returns Object with unread count
   */
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount(
    @CurrentUser() user: AuthUserType,
  ): Promise<{ count: number }> {
    return this.notificationService.getUnreadCount(user);
  }

  /**
   * Get a single notification by ID
   * @param id - Notification ID
   * @param user - Authenticated user
   * @returns The notification
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<Notification> {
    return this.notificationService.getNotification(id, user);
  }

  /**
   * Mark a notification as read
   * @param id - Notification ID
   * @param user - Authenticated user
   * @returns Updated notification
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<Notification> {
    return this.notificationService.markAsRead(id, user);
  }

  /**
   * Mark all notifications as read for the authenticated user
   * @param user - Authenticated user
   * @returns Object with count of updated notifications
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(
    @CurrentUser() user: AuthUserType,
  ): Promise<{ count: number }> {
    return this.notificationService.markAllAsRead(user);
  }

  /**
   * Delete a notification
   * @param id - Notification ID
   * @param user - Authenticated user
   * @returns True if deleted
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.notificationService.deleteNotification(id, user);
    return { deleted };
  }
}
