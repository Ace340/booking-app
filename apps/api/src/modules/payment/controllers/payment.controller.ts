/**
 * Payment Controller
 *
 * Handles HTTP requests for payment operations.
 * All routes require JWT authentication (webhook has its own controller).
 *
 * Endpoints:
 *   POST   /payments/intent   — Create a payment intent for an appointment
 *   GET    /payments          — List payments (company-scoped, filtered by role)
 *   GET    /payments/:id      — Get a single payment
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentIntentDto } from '../dto';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  AuthUser as AuthUserType,
} from '../../auth';
import { Payment, PaymentStatus } from '@prisma/client';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a payment intent for an appointment.
   * Returns client_secret for Stripe.js confirmation on the client.
   */
  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser() user: AuthUserType,
  ) {
    return this.paymentService.createPaymentIntent(dto, user);
  }

  /**
   * Get payments with optional filters.
   * Clients see only their own; staff/admin see all in company.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: AuthUserType,
    @Query('status') status?: PaymentStatus,
    @Query('appointmentId') appointmentId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<Payment[]> {
    return this.paymentService.getPayments(user, {
      status,
      appointmentId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  /** Get a single payment by ID (company-scoped). */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserType,
  ): Promise<Payment> {
    return this.paymentService.getPayment(id, user);
  }
}
