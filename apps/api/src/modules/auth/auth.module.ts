/**
 * Auth Module
 *
 * Encapsulates all Clerk-based authentication functionality.
 *
 * Structure:
 * - Guards:   ClerkAuthGuard (token verification), RolesGuard (role-based access)
 * - Controllers: ClerkWebhookController (user sync webhooks)
 * - Services: AuthService (user lookup/sync)
 * - Repository: AuthRepository (database access)
 * - Decorators: @Public(), @Roles(), @CurrentUser()
 * - Types: Module-specific TypeScript interfaces
 *
 * Clerk manages: signup, login, passwords, sessions, social auth
 * This module manages: user sync, route protection, role authorization
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ClerkWebhookController } from './controllers/clerk-webhook.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController, ClerkWebhookController],
  providers: [
    PrismaService,
    AuthRepository,
    AuthService,
    ClerkAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
