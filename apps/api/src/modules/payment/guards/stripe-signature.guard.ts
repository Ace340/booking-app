/**
 * Stripe Signature Guard
 *
 * Verifies the Stripe webhook signature on incoming requests.
 * Used exclusively on the webhook endpoint — replaces JWT auth
 * since webhooks come from Stripe, not our users.
 *
 * After verification, attaches the parsed event as req.stripeEvent
 * using the typed StripeWebhookRequest interface.
 *
 * IMPORTANT: The webhook route must use express.raw() for the body
 *            parser — express.json() breaks signature verification.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import { StripeWebhookRequest } from '../types/payment.types';

@Injectable()
export class StripeSignatureGuard implements CanActivate {
  private readonly logger = new Logger(StripeSignatureGuard.name);

  constructor(private readonly stripeService: StripeService) {}

  /**
   * Verify the Stripe webhook signature and attach the parsed event.
   *
   * @returns True if signature is valid
   * @throws UnauthorizedException if signature is missing or invalid
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<StripeWebhookRequest>();
    const signature = request.headers['stripe-signature'] as string | undefined;

    if (!signature) {
      this.logger.warn('Webhook received without stripe-signature header');
      throw new UnauthorizedException('Missing stripe-signature header');
    }

    try {
      // Verify signature and attach parsed event to the typed request
      request.stripeEvent = this.stripeService.constructWebhookEvent(
        request.body,
        signature,
      );

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Webhook signature verification failed: ${message}`);
      throw new UnauthorizedException(`Invalid signature: ${message}`);
    }
  }
}
