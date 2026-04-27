/**
 * Service Types
 *
 * Type definitions for the services module.
 */

/**
 * Service Filters
 *
 * Query parameters for filtering services.
 * companyId is always required for multi-tenant isolation.
 */
export interface ServiceFilters {
  companyId: string;
  name?: string;
}

/**
 * Create Service Data
 *
 * Internal data structure for creating a service.
 * Used to pass validated data from service to repository.
 */
export interface CreateServiceData {
  companyId: string;
  name: string;
  duration: number;
  price: number;
}

/**
 * Update Service Data
 *
 * Internal data structure for updating a service.
 * All fields are optional — only provided fields will be updated.
 */
export interface UpdateServiceData {
  name?: string;
  duration?: number;
  price?: number;
}
