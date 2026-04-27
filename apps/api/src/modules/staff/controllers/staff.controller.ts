/**
 * Staff Controller
 *
 * Handles HTTP requests for staff management.
 * Follows clean architecture: only HTTP logic, no business logic.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto, UpdateStaffDto } from '../dto';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  AuthUser as AuthUserType,
} from '../../auth';
import { Staff } from '@prisma/client';

/**
 * Staff Controller
 *
 * Provides endpoints for managing staff members.
 * All routes require JWT authentication.
 */
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * Get all staff members for the current company
   * @param user - Authenticated user
   * @returns Array of staff members
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: AuthUserType): Promise<Staff[]> {
    return this.staffService.getAll(user.companyId);
  }

  /**
   * Get a single staff member by ID
   * @param id - Staff member ID
   * @param user - Authenticated user
   * @returns Staff member
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<Staff> {
    return this.staffService.getById(id, user.companyId);
  }

  /**
   * Create a new staff member
   * @param createStaffDto - Staff data
   * @param user - Authenticated user
   * @returns Created staff member
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createStaffDto: CreateStaffDto,
    @CurrentUser() user: AuthUserType,
  ): Promise<Staff> {
    return this.staffService.create(createStaffDto, user);
  }

  /**
   * Update an existing staff member
   * @param id - Staff member ID
   * @param updateStaffDto - Updated staff data
   * @param user - Authenticated user
   * @returns Updated staff member
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentUser() user: AuthUserType,
  ): Promise<Staff> {
    return this.staffService.update(id, updateStaffDto, user);
  }

  /**
   * Delete a staff member
   * @param id - Staff member ID
   * @param user - Authenticated user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<void> {
    return this.staffService.delete(id, user.companyId);
  }
}
