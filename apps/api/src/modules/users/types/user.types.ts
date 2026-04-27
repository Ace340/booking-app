/**
 * User Types
 *
 * Type definitions for the users module.
 */

/**
 * User Filters
 *
 * Query parameters for filtering users.
 * companyId is always required for multi-tenant isolation.
 */
export interface UserFilters {
  companyId: string;
  role?: string;
  search?: string;
}

/**
 * Safe User
 *
 * User representation without sensitive fields (e.g. password).
 * Used as the return type for all user queries.
 */
export interface SafeUser {
  id: string;
  companyId: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
