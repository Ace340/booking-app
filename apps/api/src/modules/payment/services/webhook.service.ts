/**
 * Webhook Service
 *
 * Processes incoming Stripe webhook events with idempotency.
 * Routes events to the appropriate handler based on event type.
 *
 * ALL database access goes through repositories — never PrismaService.
 *
 * Key events handled:
 * - payment_intent.succeeded     → Mark payment as SUCCEEDED
 * - payment_intent.payment_failed → Mark payment as FAILED
 * - account.updated              → Update company Stripe onboarding status
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebhookEventRepository } from '../repositories/webhook-event.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { WebhookEventContext } from '../types/payment.types';
import { PaymentStatus, WebhookEventStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  /**
   * Process a verified webhook event.
   *
   * Flow:
   * 1. Idempotency check — skip if already PROCESSED
   * 2. Create event record (PENDING)
   * 3. Acquire processing lock (atomic PENDING → PROCESSING)
   * 4. Route to handler by event type
   * 5. Mark as PROCESSED on success, FAILED on error
   *
   * @throws Error on processing failure (controller returns 500 → Stripe retries)
   */
  async processEvent(context: WebhookEventContext): Promise<void> {
    // Step 1: Idempotency — skip if already processed
    const existing = await this.webhookEventRepository.findByStripeEventId(context.stripeEventId);
    if (existing?.status === WebhookEventStatus.PROCESSED) {
      this.logger.log(`Skipping already processed event: ${context.stripeEventId}`);
      return;
    }

    // Step 2: Create event record if new
    if (!existing) {
      await this.webhookEventRepository.create({
        stripeEventId: context.stripeEventId,
        type: context.type,
        companyId: context.companyId,
        payload: context.payload,
      });
    }

    // Step 3: Acquire processing lock
    const locked = await this.webhookEventRepository.markAsProcessing(context.stripeEventId);
    if (!locked) {
      this.logger.log(`Event already being processed: ${context.stripeEventId}`);
      return;
    }

    // Step 4: Route to handler
    try {
      await this.routeEvent(context);

      await this.webhookEventRepository.markAsProcessed(context.stripeEventId);
      this.logger.log(`Processed event: ${context.type} [${context.stripeEventId}]`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.webhookEventRepository.markAsFailed(context.stripeEventId, message);
      this.logger.error(`Failed to process event ${context.stripeEventId}: ${message}`);
      throw error;
    }
  }

  /** Route an event to the appropriate handler by type. */
  private async routeEvent(context: WebhookEventContext): Promise<void> {
    switch (context.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(context);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(context);
        break;

      case 'account.updated':
        await this.handleAccountUpdated(context);
        break;

      default:
        this.logger.warn(`Unhandled event type: ${context.type}`);
    }
  }

  /**
   * Handle payment_intent.succeeded
   * Authoritative payment confirmation — update status + store receipt.
   */
  private async handlePaymentSucceeded(context: WebhookEventContext): Promise<void> {
    const paymentIntent = context.payload as Stripe.PaymentIntent;

    await this.paymentRepository.updateStatusByStripeId(
      paymentIntent.id,
      PaymentStatus.SUCCEEDED,
      {
        receiptUrl: (paymentIntent as any).charges?.data?.[0]?.receipt_url ?? undefined,
      },
    );

    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
  }

  /** Handle payment_intent.payment_failed — mark payment as FAILED. */
  private async handlePaymentFailed(context: WebhookEventContext): Promise<void> {
    const paymentIntent = context.payload as Stripe.PaymentIntent;

    await this.paymentRepository.updateStatusByStripeId(
      paymentIntent.id,
      PaymentStatus.FAILED,
    );

    this.logger.warn(`Payment failed: ${paymentIntent.id}`);
  }

  /**
   * Handle account.updated (Stripe Connect)
   * Update Company.stripeOnboardingComplete via PaymentRepository.
   */
  private async handleAccountUpdated(context: WebhookEventContext): Promise<void> {
    const account = context.payload as Stripe.Account;
    const isComplete = account.charges_enabled && account.payouts_enabled;

    await this.paymentRepository.updateCompanyOnboarding(account.id, isComplete);

    this.logger.log(`Account updated: ${account.id} — onboarded: ${isComplete}`);
  }
}
