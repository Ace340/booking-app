/**
 * Update Profile DTO
 *
 * Data Transfer Object for updating user profile.
 * Validates incoming request data before processing.
 */

import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
