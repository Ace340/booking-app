/**
 * Payment Repository
 *
 * Single source of truth for ALL database access in the payment module.
 * Follows project pattern: implements BaseRepositoryInterface, uses PrismaService.
 *
 * Includes cross-entity lookups (appointments, companies) needed by the
 * payment flow — services never access PrismaService directly.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Payment, PaymentStatus } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../common/interfaces/base-repository.interface';
import {
  CreatePaymentData,
  PaymentFilters,
  AppointmentWithService,
  CompanyStripeAccount,
} from '../types/payment.types';

@Injectable()
export class PaymentRepository implements BaseRepositoryInterface<Payment> {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Payment CRUD ───────────────────────────────────────────

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            service: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });
  }

  async findAll(criteria?: Partial<Payment>): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: criteria ?? {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFilters(filters: PaymentFilters): Promise<Payment[]> {
    const where: Record<string, unknown> = {
      companyId: filters.companyId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.appointmentId) where.appointmentId = filters.appointmentId;

    if (filters.dateFrom || filters.dateTo) {
      const range: Record<string, Date> = {};
      if (filters.dateFrom) range.gte = filters.dateFrom;
      if (filters.dateTo) range.lte = filters.dateTo;
      where.createdAt = range;
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        appointment: {
          select: {
            id: true,
            startTime: true,
            status: true,
            service: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<Payment | null> {
    // TODO: return this.prisma.payment.findUnique({ where: { stripePaymentIntentId } });
    throw new Error('Not implemented');
  }

  async findByAppointmentId(appointmentId: string): Promise<Payment | null> {
    // TODO: return this.prisma.payment.findUnique({ where: { appointmentId } });
    throw new Error('Not implemented');
  }

  async create(data: CreatePaymentData): Promise<Payment> {
    // TODO: return this.prisma.payment.create({ data: { ... } });
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
    try {
      // TODO: return await this.prisma.payment.update({ where: { id }, data });
      throw new Error('Not implemented');
    } catch {
      return null;
    }
  }

  async updateStatusByStripeId(
    stripePaymentIntentId: string,
    status: PaymentStatus,
    extra?: { receiptUrl?: string },
  ): Promise<Payment | null> {
    // TODO: return this.prisma.payment.update({
    //   where: { stripePaymentIntentId },
    //   data: { status, stripeReceiptUrl: extra?.receiptUrl },
    // });
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<boolean> {
    try {
      // TODO: await this.prisma.payment.delete({ where: { id } }); return true;
      throw new Error('Not implemented');
    } catch {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    // TODO: const p = await this.prisma.payment.findUnique({ where: { id } }); return p !== null;
    throw new Error('Not implemented');
  }

  // ─── Cross-Entity Lookups (payment flow) ────────────────────

  /**
   * Load an appointment with its service (including price).
   * Used by PaymentService to determine the amount server-side.
   */
  async findAppointmentWithService(
    appointmentId: string,
    companyId: string,
  ): Promise<AppointmentWithService | null> {
    // TODO: return this.prisma.appointment.findUnique({
    //   where: { id: appointmentId, companyId },
    //   include: { service: { select: { id: true, name: true, duration: true, price: true } } },
    // });
    throw new Error('Not implemented');
  }

  /**
   * Load a company's Stripe Connect fields.
   * Used by PaymentService to resolve the destination account.
   */
  async findCompanyStripeAccount(companyId: string): Promise<CompanyStripeAccount | null> {
    // TODO: return this.prisma.company.findUnique({
    //   where: { id: companyId },
    //   select: { id: true, stripeAccountId: true, stripeOnboardingComplete: true },
    // });
    throw new Error('Not implemented');
  }

  /**
   * Update a company's Stripe onboarding status.
   * Called by WebhookService when account.updated fires.
   */
  async updateCompanyOnboarding(
    stripeAccountId: string,
    isComplete: boolean,
  ): Promise<void> {
    // TODO: await this.prisma.company.updateMany({
    //   where: { stripeAccountId },
    //   data: { stripeOnboardingComplete: isComplete },
    // });
    throw new Error('Not implemented');
  }
}
