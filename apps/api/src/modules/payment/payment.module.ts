/**
 * Payment Module
 *
 * Provides Stripe Connect payment processing for the booking platform.
 *
 * Architecture:
 * - PaymentController  — Authenticated payment endpoints (JWT)
 * - WebhookController  — Stripe webhook endpoint (POST /webhooks/stripe)
 * - PaymentService     — Core payment business logic
 * - WebhookService     — Idempotent webhook event processing
 * - StripeService      — Stripe SDK wrapper (private client, typed methods)
 * - PaymentRepository  — ALL database access for the payment module
 * - WebhookEventRepository — Webhook idempotency tracking
 *
 * Clean architecture:
 * - Services NEVER access PrismaService directly — only via repositories
 * - PaymentRepository owns ALL cross-entity lookups (appointments, companies)
 * - StripeService wraps the SDK with a private client — consumers use typed methods
 * - Controllers contain zero business logic
 *
 * Security:
 * - Card data NEVER touches our server (Stripe Elements on client)
 * - Amount ALWAYS determined server-side
 * - Webhook signatures verified via StripeSignatureGuard
 * - Webhook route is @Public() (no JWT — requests come from Stripe)
 */

import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { PaymentService } from './services/payment.service';
import { WebhookService } from './services/webhook.service';
import { StripeService } from './services/stripe.service';
import { PaymentRepository } from './repositories/payment.repository';
import { WebhookEventRepository } from './repositories/webhook-event.repository';
import { StripeSignatureGuard } from './guards/stripe-signature.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [PaymentController, WebhookController],
  providers: [
    PrismaService,
    StripeService,
    PaymentRepository,
    WebhookEventRepository,
    PaymentService,
    WebhookService,
    StripeSignatureGuard,
  ],
  exports: [PaymentService, StripeService],
})
export class PaymentModule {}
