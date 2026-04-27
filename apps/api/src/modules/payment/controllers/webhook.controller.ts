/**
 * Webhook Controller
 *
 * Handles incoming Stripe webhook events on a dedicated route.
 * Separated from PaymentController because it needs:
 * - express.raw() body parser (not express.json() — breaks signature verification)
 * - StripeSignatureGuard instead of JWT auth (webhooks come from Stripe, not users)
 * - @Public() to bypass any global JWT guard
 *
 * Endpoint:
 *   POST /webhooks/stripe — Receive and process Stripe events
 */

import {
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { StripeSignatureGuard } from '../guards/stripe-signature.guard';
import { Public } from '../../auth';
import {
  StripeWebhookRequest,
  WebhookEventContext,
} from '../types/payment.types';

@Controller('webhooks/stripe')
@UseGuards(StripeSignatureGuard)
@Public()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Receive and process a Stripe webhook event.
   *
   * The StripeSignatureGuard has already verified the signature and
   * attached the parsed event as req.stripeEvent (typed via StripeWebhookRequest).
   *
   * Processing is AWAITED — if it fails we return 500 so Stripe retries.
   * If it succeeds we return 200 and Stripe considers delivery complete.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: StripeWebhookRequest) {
    const event = req.stripeEvent;

    const context: WebhookEventContext = {
      stripeEventId: event.id,
      type: event.type,
      companyId: this.extractCompanyId(event),
      paymentIntentId: this.extractPaymentIntentId(event),
      payload: event.data.object as Record<string, unknown>,
    };

    try {
      await this.webhookService.processEvent(context);
    } catch {
      // WebhookService already logged and marked as FAILED.
      // Return 500 so Stripe retries the delivery.
      throw new InternalServerErrorException('Webhook processing failed');
    }

    return { received: true };
  }

  /** Extract company ID from event metadata if present */
  private extractCompanyId(event: { data: { object: Record<string, unknown> } }): string | undefined {
    const metadata = event.data.object?.metadata as Record<string, string> | undefined;
    return metadata?.companyId;
  }

  /** Extract PaymentIntent ID from event data if the object is a payment_intent */
  private extractPaymentIntentId(event: { data: { object: Record<string, unknown> } }): string | undefined {
    const obj = event.data.object;
    if (obj?.object === 'payment_intent') {
      return obj.id as string;
    }
    return undefined;
  }
}
