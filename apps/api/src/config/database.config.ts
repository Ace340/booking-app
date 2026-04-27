/**
 * Database Configuration Factory
 *
 * Provides typed config for Prisma / PostgreSQL.
 */

import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG = 'database';

export interface DatabaseConfig {
  url: string;
}

export const databaseConfig = registerAs<DatabaseConfig>(DATABASE_CONFIG, () => ({
  url: process.env.DATABASE_URL!,
}));
