/**
 * Application Configuration Factory
 *
 * Provides typed, namespaced config for app-wide settings:
 * port, API prefix, CORS origins, and the current environment.
 */

import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

export const APP_CONFIG = 'app';

export interface AppConfig {
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  nodeEnv: string;
  isProduction: boolean;
}

export const appConfig = registerAs<AppConfig>(APP_CONFIG, () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map((s) => s.trim()),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
}));

/**
 * Helper — read `AppConfig` from DI without injecting the whole ConfigService.
 */
export function getAppConfig(configService: ConfigService): AppConfig {
  return configService.get<AppConfig>(APP_CONFIG)!;
}
