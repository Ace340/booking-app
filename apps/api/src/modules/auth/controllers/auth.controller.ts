/**
 * Auth Controller
 *
 * Provides endpoints related to the current authenticated user.
 * Registration and login are handled by Clerk — this controller
 * focuses on reading the current user's profile from our DB.
 *
 * All routes require Clerk authentication.
 */

import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUser } from '../decorators/auth-user.decorator';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../types/auth.types';

@Controller('auth')
@UseGuards(ClerkAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get current authenticated user's profile (from local DB).
   * If user doesn't exist in DB yet, auto-creates from Clerk data.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return user;
  }
}
