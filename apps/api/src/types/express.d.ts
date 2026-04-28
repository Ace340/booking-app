/**
 * Express Request augmentation
 *
 * Extends the Express Request type with custom properties
 * set by middleware and guards.
 */

import { ClerkRequestContext } from '../modules/auth/types/auth.types';

interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

declare namespace Express {
  interface Request {
    /** Unique request ID set by RequestIdMiddleware */
    requestId: string;

    /** Clerk context set by ClerkAuthGuard (token claims + DB user) */
    clerk?: ClerkRequestContext;

    /** Authenticated user set by ClerkAuthGuard (for RolesGuard compatibility) */
    user?: AuthUser;
  }
}
