/**
 * Configuration Module
 *
 * Centralised, validated configuration for the entire application.
 * All env-variable reads go through here — no scattered `process.env` calls.
 *
 * Usage:
 *   ConfigModule.forRoot({ validate: validateEnv })
 *   → every `ConfigService.get()` call returns a validated value.
 */

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { authConfig } from './auth.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (raw: Record<string, string | undefined>) => validate(raw),
      load: [appConfig, databaseConfig, authConfig],
    }),
  ],
})
export class AppConfigModule {}
