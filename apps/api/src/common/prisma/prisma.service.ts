/**
 * Prisma Service
 *
 * Provides Prisma Client for database operations.
 * Singleton pattern ensures only one instance is created.
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service
 *
 * Wraps Prisma Client for NestJS dependency injection.
 * Handles connection lifecycle automatically.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Initialize Prisma Client connection
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Clean up Prisma Client connection
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
