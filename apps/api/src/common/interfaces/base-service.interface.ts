/**
 * Base Service Interface
 *
 * Defines the contract for all service implementations.
 * Services contain business logic and orchestrate operations.
 *
 * @template T - The entity type this service manages
 * @template CreateDto - DTO type for creating entities
 * @template UpdateDto - DTO type for updating entities
 */
export interface BaseServiceInterface<T, CreateDto, UpdateDto> {
  /**
   * Get a single entity by ID
   * @param id - The entity identifier
   * @returns The entity or null if not found
   */
  findOne(id: string): Promise<T | null>;

  /**
   * Get all entities with optional filtering
   * @param filters - Optional filter criteria
   * @returns Array of entities
   */
  findAll(filters?: Record<string, unknown>): Promise<T[]>;

  /**
   * Create a new entity
   * @param createDto - Data for creating the entity
   * @returns The created entity
   */
  create(createDto: CreateDto): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The entity identifier
   * @param updateDto - Data for updating the entity
   * @returns The updated entity or null if not found
   */
  update(id: string, updateDto: UpdateDto): Promise<T | null>;

  /**
   * Delete an entity
   * @param id - The entity identifier
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Validate if an entity exists
   * @param id - The entity identifier
   * @returns True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}
