/**
 * Public Decorator
 *
 * Marks routes as public (no authentication required).
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Public key for metadata
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public decorator
 *
 * Use this decorator to mark routes that don't require authentication.
 * Example: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
