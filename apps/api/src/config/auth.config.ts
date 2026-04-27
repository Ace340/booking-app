/**
 * Auth Configuration Factory
 *
 * Provides typed config for JWT and bcrypt settings.
 */

import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG = 'auth';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

export const authConfig = registerAs<AuthConfig>(AUTH_CONFIG, () => ({
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
}));
