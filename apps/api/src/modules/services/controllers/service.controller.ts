/**
 * Service Controller
 *
 * Handles HTTP requests for managing services.
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
import { ServiceService } from '../services/service.service';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import {
  ClerkAuthGuard,
  RolesGuard,
  CurrentUser,
  AuthUser as AuthUserType,
} from '../../auth';
import { Service } from '@prisma/client';

/**
 * Service Controller
 *
 * Provides endpoints for managing company services.
 * All routes require JWT authentication.
 */
@Controller('services')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  /**
   * Get all services for the authenticated user's company
   * @param user - Authenticated user
   * @returns Array of services
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: AuthUserType): Promise<Service[]> {
    return this.serviceService.getAll(user.companyId);
  }

  /**
   * Get a single service by ID
   * @param id - Service ID
   * @param user - Authenticated user
   * @returns Service
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<Service> {
    return this.serviceService.getById(id, user.companyId);
  }

  /**
   * Create a new service
   * @param createServiceDto - Service data
   * @param user - Authenticated user
   * @returns Created service
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser() user: AuthUserType,
  ): Promise<Service> {
    return this.serviceService.create(createServiceDto, user);
  }

  /**
   * Update an existing service
   * @param id - Service ID
   * @param updateServiceDto - Service data to update
   * @param user - Authenticated user
   * @returns Updated service
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: AuthUserType,
  ): Promise<Service> {
    return this.serviceService.update(id, updateServiceDto, user);
  }

  /**
   * Delete a service
   * @param id - Service ID
   * @param user - Authenticated user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<void> {
    return this.serviceService.delete(id, user.companyId);
  }
}
