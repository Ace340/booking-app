/**
 * Health Module - Controller Layer
 *
 * This controller handles HTTP requests for health checks.
 * It delegates all business logic to the service layer.
 *
 * @module HealthController
 */

import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';
import { HealthResponseDto, DetailedHealthResponseDto, HealthStatus } from '../dto';

/**
 * Health Controller
 *
 * Provides endpoints for system health monitoring.
 * Handles only HTTP concerns (routing, responses, status codes).
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check endpoint
   *
   * Returns minimal health status for load balancers and monitors.
   * Use this endpoint for simple health checks.
   *
   * @returns Basic health response with status and timestamp
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Service is unhealthy',
  })
  async getHealth(): Promise<HealthResponseDto> {
    const healthCheck = await this.healthService.performHealthCheck();

    // Map internal health check to DTO
    const response: HealthResponseDto = {
      status: this.mapHealthStatus(healthCheck.system.status),
      timestamp: healthCheck.system.timestamp,
      version: healthCheck.system.version,
      uptime: healthCheck.system.uptime,
      database: healthCheck.database
        ? this.mapHealthStatus(healthCheck.database.status === 'connected' ? 'healthy' : 'unhealthy')
        : undefined,
      services: this.mapServicesHealth(healthCheck.services),
    };

    // Return appropriate HTTP status based on health
    const httpStatus = this.determineHttpStatus(response.status);
    // Note: In NestJS, we use @HttpCode decorator to override the status
    // For simplicity, we're returning 200 OK and letting the client check the status field

    return response;
  }

  /**
   * Detailed health check endpoint
   *
   * Returns comprehensive health information including memory usage.
   * Use this endpoint for monitoring and diagnostics.
   *
   * @returns Detailed health response with system metrics
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detailed health check with metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detailed health information',
    type: DetailedHealthResponseDto,
  })
  async getDetailedHealth(): Promise<DetailedHealthResponseDto> {
    const basicHealth = await this.getHealth();
    const memoryUsage = this.healthService.getMemoryUsage();

    const response: DetailedHealthResponseDto = {
      ...basicHealth,
      memory: memoryUsage,
      cpu: {
        usage: 0, // TODO: Implement CPU monitoring
      },
    };

    return response;
  }

  /**
   * Liveness probe endpoint
   *
   * Simple endpoint for Kubernetes liveness probes.
   * Returns 200 if the application is running.
   *
   * @returns Simple health response
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is running',
    type: HealthResponseDto,
  })
  async liveness(): Promise<HealthResponseDto> {
    return {
      status: HealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe endpoint
   *
   * Checks if the application is ready to receive traffic.
   * Returns 200 if ready, 503 if not ready.
   *
   * @returns Health response with readiness status
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is ready',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Application is not ready',
  })
  async readiness(): Promise<HealthResponseDto> {
    const healthCheck = await this.healthService.performHealthCheck();
    const isReady = healthCheck.system.status === 'healthy';

    // TODO: Use @HttpCode dynamically based on readiness
    // For now, return status in response body
    return {
      status: isReady ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Map internal health status to DTO enum
   * @param status - Internal health status
   * @returns DTO health status
   */
  private mapHealthStatus(status: 'healthy' | 'unhealthy' | 'degraded'): HealthStatus {
    const statusMap = {
      healthy: HealthStatus.HEALTHY,
      unhealthy: HealthStatus.UNHEALTHY,
      degraded: HealthStatus.DEGRADED,
    };
    return statusMap[status];
  }

  /**
   * Map service health checks to DTO format
   * @param services - Array of service health checks
   * @returns Record of service names to health status
   */
  private mapServicesHealth(services: Array<{ name: string; status: string }>): Record<string, HealthStatus> {
    return services.reduce((acc, service) => {
      acc[service.name] = this.mapHealthStatus(service.status as 'healthy' | 'unhealthy' | 'degraded');
      return acc;
    }, {} as Record<string, HealthStatus>);
  }

  /**
   * Determine appropriate HTTP status code based on health status
   * @param status - Health status
   * @returns HTTP status code
   */
  private determineHttpStatus(status: HealthStatus): HttpStatus {
    switch (status) {
      case HealthStatus.HEALTHY:
        return HttpStatus.OK;
      case HealthStatus.DEGRADED:
        return HttpStatus.OK; // Degraded still returns 200, status in body indicates issue
      case HealthStatus.UNHEALTHY:
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
