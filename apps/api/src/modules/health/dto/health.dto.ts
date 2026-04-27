import { IsString, IsOptional, IsEnum } from 'class-validator';

/**
 * Health status enumeration
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
}

/**
 * Health check response DTO
 */
export class HealthResponseDto {
  @IsString()
  status: HealthStatus;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  uptime?: number;

  @IsOptional()
  database?: HealthStatus;

  @IsOptional()
  services?: Record<string, HealthStatus>;
}

/**
 * Detailed health check response with system metrics
 */
export class DetailedHealthResponseDto extends HealthResponseDto {
  @IsOptional()
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };

  @IsOptional()
  cpu?: {
    usage: number;
  };
}
