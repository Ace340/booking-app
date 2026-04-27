/**
 * Base Repository Interface
 *
 * Defines the contract for all repository implementations.
 * Repositories handle data access and persistence.
 *
 * @template T - The entity type this repository manages
 */
export interface BaseRepositoryInterface<T> {
  /**
   * Find a single entity by ID
   * @param id - The entity identifier
   * @returns The entity or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities matching optional criteria
   * @param criteria - Optional filter criteria
   * @returns Array of entities
   */
  findAll(criteria?: Partial<T>): Promise<T[]>;

  /**
   * Create a new entity
   * @param data - The entity data to create
   * @returns The created entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The entity identifier
   * @param data - The data to update
   * @returns The updated entity or null if not found
   */
  update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity
   * @param id - The entity identifier
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if an entity exists
   * @param id - The entity identifier
   * @returns True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}
