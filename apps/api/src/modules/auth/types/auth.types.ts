/**
 * Auth Types
 *
 * Type definitions for authentication and authorization.
 */

import { UserRole } from '@prisma/client';

/**
 * JWT Payload
 *
 * Data stored in the JWT token.
 * iat and exp are automatically added by JWT service.
 */
export interface JwtPayload {
  sub: string;      // User ID
  email: string;    // User email
  role: UserRole;   // User role
  companyId: string; // Company ID
  iat?: number;     // Issued at (auto-generated)
  exp?: number;     // Expiration time (auto-generated)
}

/**
 * Authenticated User
 *
 * User information extracted from JWT token.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
}

/**
 * Register User Data
 *
 * Data required for user registration.
 */
export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  companyId: string;
  role?: UserRole;
}

/**
 * Login User Data
 *
 * Data required for user login.
 */
export interface LoginUserData {
  email: string;
  password: string;
}

/**
 * Auth Response
 *
 * Response data for successful authentication.
 */
export interface AuthResponse {
  accessToken: string;
  user: Omit<AuthUser, 'companyId'>;
}

/**
 * Token Validation Result
 *
 * Result of token validation.
 */
export interface TokenValidationResult {
  valid: boolean;
  user?: AuthUser;
  error?: string;
}
