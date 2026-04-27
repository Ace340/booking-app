/**
 * Notification Filters DTO
 *
 * Data Transfer Object for querying/filtering notifications.
 * Validates incoming query parameters.
 */

import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class NotificationFiltersDto {
  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  userId?: string;

  @IsString({ message: 'Notification type must be a string' })
  @IsOptional()
  type?: string;

  @IsString({ message: 'Notification status must be a string' })
  @IsOptional()
  status?: string;

  @IsBoolean({ message: 'unreadOnly must be a boolean' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  unreadOnly?: boolean;
}
