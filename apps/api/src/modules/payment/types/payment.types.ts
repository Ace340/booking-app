/**
 * Payment Types
 *
 * Module-specific TypeScript types and interfaces for the payment module.
 * Runtime logic belongs in DTOs or services — this file is types only.
 */

import { Request } from 'express';
import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

// ─── Payment Data ──────────────────────────────────────────────

/** Data needed to create a payment linked to an appointment */
export interface CreatePaymentData {
  companyId: string;
  appointmentId: string;
  userId: string;
  amount: number;
  currency: string;
  platformFee: number;
  stripePaymentIntentId: string;
  metadata?: Record<string, string>;
}

/** Filters for querying payments */
export interface PaymentFilters {
  companyId: string;
  status?: PaymentStatus;
  userId?: string;
  appointmentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Result returned after creating a payment intent — sent to the client */
export interface PaymentIntentResult {
  clientSecret: string;
  paymentId: string;
  amount: number;
  currency: string;
}

// ─── Webhook Types ─────────────────────────────────────────────

/** Parsed webhook event context — extracted after signature verification */
export interface WebhookEventContext {
  stripeEventId: string;
  type: string;
  companyId?: string;
  paymentIntentId?: string;
  payload: Record<string, unknown>;
}

/**
 * Typed Express request for Stripe webhooks.
 *
 * After StripeSignatureGuard verifies the signature, it attaches
 * the parsed event here — eliminating (req as any) casting.
 */
export interface StripeWebhookRequest extends Request {
  stripeEvent: Stripe.Event;
}

// ─── Domain Types ──────────────────────────────────────────────

/** Appointment with service price — for payment amount resolution */
export interface AppointmentWithService {
  id: string;
  companyId: string;
  userId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  service: { id: string; name: string; duration: number; price: { toNumber(): number } };
}

/** Company Stripe Connect fields — minimal projection for payment logic */
export interface CompanyStripeAccount {
  id: string;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
}

/** Company Stripe Connect status */
export interface StripeConnectStatus {
  stripeAccountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}
