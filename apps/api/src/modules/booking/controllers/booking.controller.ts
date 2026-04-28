/**
 * Booking Controller
 *
 * Handles HTTP requests for appointment bookings.
 * Follows clean architecture: only HTTP logic, no business logic.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto';
import {
  ClerkAuthGuard,
  RolesGuard,
  CurrentUser,
  AuthUser as AuthUserType,
} from '../../auth';
import { Appointment, AppointmentStatus } from '@prisma/client';

/**
 * Booking Controller
 *
 * Provides endpoints for managing appointment bookings.
 * All routes require JWT authentication.
 */
@Controller('bookings')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Create a new booking
   * @param createBookingDto - Booking data
   * @param user - Authenticated user
   * @returns Created appointment
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: AuthUserType,
  ): Promise<Appointment> {
    return this.bookingService.createBooking(createBookingDto, user);
  }

  /**
   * Get appointments with optional filters
   * @param user - Authenticated user
   * @param staffId - Filter by staff member
   * @param status - Filter by appointment status
   * @param dateFrom - Filter by start date (inclusive)
   * @param dateTo - Filter by end date (inclusive)
   * @returns Array of appointments
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: AuthUserType,
    @Query('staffId') staffId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<Appointment[]> {
    return this.bookingService.getBookings(user, {
      staffId,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  /**
   * Cancel an appointment
   * @param id - Appointment ID
   * @param user - Authenticated user
   * @returns Updated appointment with CANCELLED status
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<Appointment> {
    return this.bookingService.cancelBooking(id, user);
  }
}
