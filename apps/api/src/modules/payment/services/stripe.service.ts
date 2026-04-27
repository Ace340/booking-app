/**
 * Stripe Service
 *
 * Thin wrapper around the Stripe SDK. All Stripe API calls flow through
 * this service so the rest of the module stays testable and Stripe-agnostic.
 *
 * The raw Stripe client is PRIVATE — consumers use typed methods only.
 * This prevents bypassing the abstraction and coupling callers to Stripe's API shape.
 *
 * Security: Secret key loaded once at boot from env — never exposed to the client.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }
    this.webhookSecret = webhookSecret;
  }

  // ─── Payment Intents ────────────────────────────────────────

  /**
   * Create a PaymentIntent with destination charge (Stripe Connect).
   *
   * The platform is the merchant of record. Funds are automatically
   * transferred to the connected account on success, minus the
   * application fee.
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    connectedAccountId: string;
    applicationFeeAmount: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    // TODO: Implement
    // return this.stripe.paymentIntents.create({
    //   amount: params.amount,
    //   currency: params.currency,
    //   automatic_payment_methods: { enabled: true },
    //   application_fee_amount: params.applicationFeeAmount,
    //   transfer_data: { destination: params.connectedAccountId },
    //   metadata: params.metadata,
    // });
    throw new Error('Not implemented');
  }

  /** Retrieve a PaymentIntent by ID */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    // TODO: Implement
    // return this.stripe.paymentIntents.retrieve(paymentIntentId);
    throw new Error('Not implemented');
  }

  /** Cancel a PaymentIntent */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    // TODO: Implement
    // return this.stripe.paymentIntents.cancel(paymentIntentId);
    throw new Error('Not implemented');
  }

  // ─── Connect — Account Management ───────────────────────────

  /** Create a Stripe Express connected account for a company */
  async createConnectedAccount(params: {
    email: string;
    country?: string;
  }): Promise<Stripe.Account> {
    // TODO: Implement
    // return this.stripe.accounts.create({
    //   type: 'express',
    //   country: params.country ?? 'US',
    //   email: params.email,
    //   capabilities: {
    //     card_payments: { requested: true },
    //     transfers: { requested: true },
    //   },
    // });
    throw new Error('Not implemented');
  }

  /** Generate an Account Link for Stripe-hosted onboarding */
  async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<Stripe.AccountLink> {
    // TODO: Implement
    // return this.stripe.accountLinks.create({
    //   account: params.accountId,
    //   refresh_url: params.refreshUrl,
    //   return_url: params.returnUrl,
    //   type: 'account_onboarding',
    // });
    throw new Error('Not implemented');
  }

  /** Retrieve a connected account to check onboarding status */
  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    // TODO: Implement
    // return this.stripe.accounts.retrieve(accountId);
    throw new Error('Not implemented');
  }

  // ─── Webhooks ───────────────────────────────────────────────

  /**
   * Verify webhook signature and construct the event.
   *
   * Uses the cached webhook secret (loaded once in constructor).
   * MUST be called with the raw body — express.json() breaks verification.
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    // TODO: Implement
    // return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    throw new Error('Not implemented');
  }
}
