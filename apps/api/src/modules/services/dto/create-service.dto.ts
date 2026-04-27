/**
 * Create Service DTO
 *
 * Data Transfer Object for creating a new service.
 * Validates incoming request data before processing.
 */

import { IsString, IsNotEmpty, IsInt, Min, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  duration: number; // in minutes

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0)
  price: number;
}
