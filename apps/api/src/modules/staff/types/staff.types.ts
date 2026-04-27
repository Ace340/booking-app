/**
 * Staff Types
 *
 * Type definitions for the staff module.
 */

/**
 * Staff Filters
 *
 * Query parameters for filtering staff members.
 * companyId is always required for multi-tenant isolation.
 */
export interface StaffFilters {
  companyId: string;
  name?: string;
}

/**
 * Create Staff Data
 *
 * Internal data structure for creating a staff member.
 * Used to pass validated data from service to repository.
 */
export interface CreateStaffData {
  companyId: string;
  name: string;
  email: string;
}

/**
 * Update Staff Data
 *
 * Internal data structure for updating a staff member.
 * All fields are optional — only provided fields will be updated.
 */
export interface UpdateStaffData {
  name?: string;
  email?: string;
}
