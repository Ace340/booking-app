/**
 * Users Controller
 *
 * Handles HTTP requests for user operations.
 * Follows clean architecture: only HTTP logic, no business logic.
 */

import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateProfileDto } from '../dto';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  Roles,
  AuthUser as AuthUserType,
} from '../../auth';
import { UserRole } from '@prisma/client';

/**
 * Users Controller
 *
 * Provides endpoints for user profile and customer management.
 * All routes require JWT authentication.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user's profile
   * @param user - Authenticated user
   * @returns User profile (id, email, name, role, companyId)
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: AuthUserType) {
    return this.userService.getProfile(user.id);
  }

  /**
   * List customers (CLIENT role) in the same company
   * @param user - Authenticated user
   * @param search - Optional search term for name/email
   * @returns Array of customer users
   */
  @Get('customers')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async listCustomers(
    @CurrentUser() user: AuthUserType,
    @Query('search') search?: string,
  ) {
    return this.userService.listCustomers(user.companyId, search);
  }

  /**
   * Get a single customer by ID, scoped to company
   * @param id - Customer user ID
   * @param user - Authenticated user
   * @returns Customer user profile
   */
  @Get('customers/:id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  async getCustomer(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ) {
    return this.userService.getCustomer(id, user.companyId);
  }

  /**
   * Update current user's profile (name and/or email)
   * @param dto - Update data
   * @param user - Authenticated user
   * @returns Updated user profile
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AuthUserType,
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  /**
   * List all users in the company (admin only)
   * @param user - Authenticated admin user
   * @returns Array of all users in company
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: AuthUserType) {
    return this.userService.findAll(user.companyId);
  }
}
