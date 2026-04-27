/**
 * Create Staff DTO
 *
 * Data Transfer Object for creating a new staff member.
 * Validates incoming request data before processing.
 */

import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}
