/**
 * Health Module
 *
 * Demonstrates the modular architecture pattern:
 * - Controller: Handles HTTP requests/responses only
 * - Service: Contains business logic
 * - Repository: Handles database access
 * - DTO: Data transfer objects for validation
 * - Types: Module-specific TypeScript types
 *
 * This module provides health check endpoints for monitoring.
 */

import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { HealthRepository } from './repositories/health.repository';

/**
 * Health Module
 *
 * Encapsulates all health check functionality.
 * Follows dependency injection and separation of concerns.
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepository],
  exports: [HealthService],
})
export class HealthModule {}
