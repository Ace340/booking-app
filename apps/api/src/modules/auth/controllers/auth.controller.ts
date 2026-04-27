/**
 * Auth Controller
 *
 * Handles HTTP requests for authentication.
 * Follows clean architecture: only HTTP logic, no business logic.
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dto';
import { AuthResponse } from '../types/auth.types';

/**
 * Auth Controller
 *
 * Provides endpoints for user authentication.
 * All routes are public by default (marked with @Public()).
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @returns Auth response with access token and user data
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * @param loginDto - Login data
   * @returns Auth response with access token and user data
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }
}
