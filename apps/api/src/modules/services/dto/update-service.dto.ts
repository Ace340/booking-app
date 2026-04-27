/**
 * Update Service DTO
 *
 * Data Transfer Object for updating an existing service.
 * All fields are optional — only provided fields will be updated.
 */

import { IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
