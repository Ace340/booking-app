/**
 * Payment Service
 *
 * Core business logic for payment processing.
 * Orchestrates Stripe API calls via StripeService and ALL persistence
 * via PaymentRepository — never touches PrismaService directly.
 *
 * Security rules:
 * - Amount is ALWAYS determined server-side from the service price
 * - No card data ever touches our server (Stripe Elements on client)
 * - PaymentIntent client_secret is returned to client for confirmation
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from '../dto';
import {
  CreatePaymentData,
  PaymentFilters,
  PaymentIntentResult,
  AppointmentWithService,
  CompanyStripeAccount,
} from '../types/payment.types';
import { AuthUser } from '../../auth';
import { Payment } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Create a payment intent for an appointment.
   *
   * Returns a client_secret for Stripe.js confirmation on the client.
   * No card data passes through our server.
   */
  async createPaymentIntent(
    dto: CreatePaymentIntentDto,
    user: AuthUser,
  ): Promise<PaymentIntentResult> {
    // Step 1: Validate appointment ownership and company scope
    const appointment = await this.validateAppointment(dto.appointmentId, user);

    // Step 2: Prevent duplicate payments
    await this.validateNoDuplicatePayment(dto.appointmentId);

    // Step 3: Resolve company's Stripe Connect account
    const stripeAccount = await this.resolveStripeAccount(user.companyId);

    // Step 4: Determine amount server-side from service price
    const amount = this.convertToCents(appointment.service.price);
    const platformFee = this.calculatePlatformFee(amount);

    // Step 5: Create Stripe PaymentIntent
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount,
      currency: 'usd',
      connectedAccountId: stripeAccount.stripeAccountId,
      applicationFeeAmount: platformFee,
      metadata: {
        appointmentId: appointment.id,
        companyId: user.companyId,
        userId: user.id,
        serviceId: appointment.serviceId,
      },
    });

    // Step 6: Persist local Payment record
    const payment = await this.paymentRepository.create({
      companyId: user.companyId,
      appointmentId: appointment.id,
      userId: user.id,
      amount,
      currency: 'usd',
      platformFee,
      stripePaymentIntentId: paymentIntent.id,
      metadata: {
        appointmentId: appointment.id,
        serviceId: appointment.serviceId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentId: payment.id,
      amount,
      currency: payment.currency,
    };
  }

  /** Get payments with optional filters (company-scoped, role-filtered). */
  async getPayments(
    user: AuthUser,
    filters?: Omit<PaymentFilters, 'companyId'>,
  ): Promise<Payment[]> {
    return this.paymentRepository.findByFilters({
      companyId: user.companyId,
      ...filters,
      ...(user.role === 'CLIENT' ? { userId: user.id } : {}),
    });
  }

  /** Get a single payment by ID (company-scoped, ownership-checked). */
  async getPayment(id: string, user: AuthUser): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment || payment.companyId !== user.companyId) {
      throw new NotFoundException('Payment not found');
    }

    if (user.role === 'CLIENT' && payment.userId !== user.id) {
      throw new ForbiddenException('Not authorized to view this payment');
    }

    return payment;
  }

  // ─── Private Helpers ────────────────────────────────────────

  /**
   * Validate appointment exists, belongs to company, and user can pay.
   * @throws NotFoundException, ForbiddenException
   */
  private async validateAppointment(
    appointmentId: string,
    user: AuthUser,
  ): Promise<AppointmentWithService> {
    const appointment = await this.paymentRepository.findAppointmentWithService(
      appointmentId,
      user.companyId,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not authorized to pay for this appointment');
    }

    return appointment;
  }

  /**
   * Ensure no payment already exists for this appointment.
   * @throws BadRequestException on duplicate
   */
  private async validateNoDuplicatePayment(appointmentId: string): Promise<void> {
    const existing = await this.paymentRepository.findByAppointmentId(appointmentId);
    if (existing) {
      throw new BadRequestException('Payment already exists for this appointment');
    }
  }

  /**
   * Load company Stripe account and validate onboarding is complete.
   * Returns a narrowed type where stripeAccountId is guaranteed non-null.
   * @throws BadRequestException if not configured
   */
  private async resolveStripeAccount(
    companyId: string,
  ): Promise<CompanyStripeAccount & { stripeAccountId: string }> {
    const company = await this.paymentRepository.findCompanyStripeAccount(companyId);

    if (!company?.stripeAccountId) {
      throw new BadRequestException('Company Stripe account not configured');
    }

    if (!company.stripeOnboardingComplete) {
      throw new BadRequestException('Company Stripe onboarding not complete');
    }

    return company as CompanyStripeAccount & { stripeAccountId: string };
  }

  /**
   * Convert Decimal price to cents (smallest currency unit).
   * Stripe requires amounts in the smallest currency unit.
   */
  private convertToCents(decimalPrice: { toNumber: () => number }): number {
    // TODO: return Math.round(decimalPrice.toNumber() * 100);
    throw new Error('Not implemented');
  }

  /** Calculate the platform fee from the payment amount. */
  private calculatePlatformFee(amountCents: number): number {
    // TODO: return Math.round(amountCents * 0.05);
    throw new Error('Not implemented');
  }
}
