/**
 * Register DTO
 *
 * Data Transfer Object for user registration.
 */

import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Company ID must be a string' })
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  @IsOptional()
  role?: UserRole;
}
