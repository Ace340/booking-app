/**
 * Auth Module
 *
 * Encapsulates all authentication functionality.
 * Follows dependency injection and separation of concerns.
 *
 * Structure:
 * - Controller: Handles HTTP requests/responses only
 * - Service: Contains business logic
 * - Repository: Handles database access
 * - Strategy: JWT validation
 * - Guards: Route protection
 * - Decorators: Easy guard/parameter usage
 * - DTO: Data transfer objects for validation
 * - Types: Module-specific TypeScript types
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Auth Module
 *
 * Provides authentication and authorization functionality.
 * Exports guards and decorators for use in other modules.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthRepository,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
