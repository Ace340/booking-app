/**
 * Auth Configuration Factory
 *
 * Provides typed config for Clerk settings.
 */

import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG = 'auth';

export interface AuthConfig {
  clerkSecretKey: string;
  clerkPublishableKey: string;
  clerkJwtKey?: string;
  clerkAuthorizedParties: string[];
  clerkWebhookSecret: string;
}

export const authConfig = registerAs<AuthConfig>(AUTH_CONFIG, () => ({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  clerkJwtKey: process.env.CLERK_JWT_KEY,
  clerkAuthorizedParties: (
    process.env.CLERK_AUTHORIZED_PARTIES ||
    'http://localhost:3000,exp://192.168.*.*:19000'
  ).split(','),
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',
}));
