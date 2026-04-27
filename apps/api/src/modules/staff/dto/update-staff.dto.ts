/**
 * Update Staff DTO
 *
 * Data Transfer Object for updating an existing staff member.
 * All fields are optional — only provided fields will be updated.
 */

import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;
}
