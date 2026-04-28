/**
 * Clerk Webhook Controller
 *
 * Handles webhooks from Clerk to keep local users in sync.
 *
 * Supported events:
 * - user.created  → Create a local User record
 * - user.updated  → Update the local User record
 * - user.deleted  → Delete the local User record
 *
 * Webhook verification uses Svix signatures (Clerk's standard).
 */

import {
  Controller,
  Post,
  Req,
  Res,
  Logger,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import {
  ClerkWebhookEvent,
  ClerkWebhookUser,
  UserSyncData,
} from '../types/auth.types';
import { AuthRepository } from '../repositories/auth.repository';
import { UserRole } from '@prisma/client';

@Controller('webhooks/clerk')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {}

  /**
   * Handle Clerk webhook events.
   * Verifies the Svix signature then processes the event.
   */
  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ): Promise<void> {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('CLERK_WEBHOOK_SECRET not configured');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Webhook not configured' });
      return;
    }

    // Verify Svix signature
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Missing Svix headers' });
      return;
    }

    const payload = (req.rawBody ?? req.body) as string;
    const body = typeof payload === 'object' ? JSON.stringify(payload) : payload;

    let evt: ClerkWebhookEvent;

    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as unknown as ClerkWebhookEvent;
    } catch (err) {
      this.logger.warn(`Webhook verification failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Invalid signature' });
      return;
    }

    // Dispatch to handler
    try {
      switch (evt.type) {
        case 'user.created':
          await this.handleUserCreated(evt.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(evt.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(evt.data);
          break;
        default:
          this.logger.log(`Unhandled event type: ${evt.type}`);
      }

      res.status(HttpStatus.OK).json({ received: true });
    } catch (err) {
      this.logger.error(`Webhook processing failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Processing failed' });
    }
  }

  /**
   * Create a local user when a Clerk user is created.
   * Reads role from Clerk publicMetadata (defaults to CLIENT).
   * Company assignment happens on first booking or via admin setup.
   */
  private async handleUserCreated(data: ClerkWebhookUser): Promise<void> {
    const email = this.getPrimaryEmail(data);
    const name = this.buildName(data);
    const role = this.extractRole(data);

    const syncData: UserSyncData = {
      clerkId: data.id,
      email,
      name,
      role,
    };

    // Check if user already exists (e.g., created manually)
    const existing = await this.authRepository.findByClerkId(data.id);
    if (existing) {
      this.logger.log(`User already exists for clerkId=${data.id}, skipping creation`);
      return;
    }

    // For now, users without a company get a placeholder.
    // In production, you'd create a default company or require onboarding.
    if (!syncData.companyId) {
      this.logger.log(`User ${data.id} created without company — needs onboarding`);
    }

    await this.authRepository.createFromClerk(syncData);
    this.logger.log(`Created local user for clerkId=${data.id}`);
  }

  /**
   * Update local user when Clerk user is updated.
   */
  private async handleUserUpdated(data: ClerkWebhookUser): Promise<void> {
    const email = this.getPrimaryEmail(data);
    const name = this.buildName(data);
    const role = this.extractRole(data);

    await this.authRepository.updateByClerkId(data.id, { email, name, role });
    this.logger.log(`Updated local user for clerkId=${data.id}`);
  }

  /**
   * Delete local user when Clerk user is deleted.
   */
  private async handleUserDeleted(data: ClerkWebhookUser): Promise<void> {
    await this.authRepository.deleteByClerkId(data.id);
    this.logger.log(`Deleted local user for clerkId=${data.id}`);
  }

  /**
   * Extract primary email from Clerk user data.
   */
  private getPrimaryEmail(data: ClerkWebhookUser): string {
    const primary = data.email_addresses?.find(
      (e) => e.verification?.status === 'verified',
    );
    return primary?.email_address ?? data.email_addresses?.[0]?.email_address ?? '';
  }

  /**
   * Build display name from Clerk user data.
   */
  private buildName(data: ClerkWebhookUser): string {
    const parts = [data.first_name, data.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'User';
  }

  /**
   * Extract role from Clerk publicMetadata.
   * Stored as { role: 'ADMIN' | 'STAFF' | 'CLIENT' }.
   */
  private extractRole(data: ClerkWebhookUser): UserRole {
    const metadata = data.public_metadata ?? {};
    const role = metadata.role as string | undefined;
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    return UserRole.CLIENT;
  }
}
