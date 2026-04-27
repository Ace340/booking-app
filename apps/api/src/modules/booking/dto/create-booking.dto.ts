/**
 * Create Booking DTO
 *
 * Data Transfer Object for creating a new booking.
 * Validates incoming request data before processing.
 */

import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString({ message: 'Staff ID must be a string' })
  @IsNotEmpty({ message: 'Staff ID is required' })
  staffId: string;

  @IsString({ message: 'Service ID must be a string' })
  @IsNotEmpty({ message: 'Service ID is required' })
  serviceId: string;

  @IsDateString({}, { message: 'Start time must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: string;
}
