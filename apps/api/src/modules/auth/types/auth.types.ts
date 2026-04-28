/**
 * Auth Types
 *
 * Type definitions for Clerk-based authentication and authorization.
 */

import { UserRole } from '@prisma/client';

/**
 * Clerk JWT Token Claims
 *
 * Claims extracted from a verified Clerk session token.
 */
export interface ClerkTokenClaims {
  sub: string;        // Clerk User ID (user_...)
  sid?: string;       // Clerk Session ID (sess_...)
  azp?: string;       // Authorized party (origin)
  exp?: number;       // Expiration time
  iat?: number;       // Issued at
  iss?: string;       // Issuer
  nbf?: number;       // Not before
}

/**
 * Authenticated User
 *
 * User information attached to the request after Clerk verification.
 * Combines Clerk data with local DB data.
 */
export interface AuthUser {
  id: string;         // Our internal DB user ID
  clerkId: string;    // Clerk user ID
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
}

/**
 * Clerk Request Context
 *
 * Attached to request by the Clerk auth guard.
 */
export interface ClerkRequestContext {
  userId: string;              // Clerk user ID
  sessionId?: string;          // Clerk session ID
  token: ClerkTokenClaims;    // Verified token claims
  dbUser: AuthUser | null;    // Local DB user (null if not synced yet)
}

/**
 * Clerk Webhook Payload
 *
 * Payload sent by Clerk webhooks for user events.
 */
export interface ClerkWebhookUser {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name?: string;
  last_name?: string;
  image_url?: string;
  public_metadata?: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

export interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification?: {
    status: string;
  };
}

export interface ClerkWebhookEvent {
  object: string;
  type: string;
  data: ClerkWebhookUser;
}

/**
 * User Sync Data
 *
 * Data used to create/update a local user from Clerk data.
 */
export interface UserSyncData {
  clerkId: string;
  email: string;
  name: string;
  role?: UserRole;
  companyId?: string;
}
