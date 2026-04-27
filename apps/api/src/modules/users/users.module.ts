/**
 * Users Module
 *
 * Example module demonstrating auth integration.
 */

import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';

/**
 * Users Module
 *
 * Provides user-related endpoints.
 * Demonstrates authentication and authorization patterns.
 */
@Module({
  controllers: [UsersController],
  providers: [],
  exports: [],
})
export class UsersModule {}
