/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup.
 * Uses a plain-object schema — no external validation library needed.
 * The application will refuse to start if any required variable is missing
 * or has an invalid value.
 */

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface EnvConfig {
  NODE_ENV: Environment;
  PORT: number;
  API_PREFIX: string;

  // Database
  DATABASE_URL: string;

  // Auth (Clerk)
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_JWT_KEY?: string;
  CLERK_AUTHORIZED_PARTIES?: string;
  CLERK_WEBHOOK_SECRET?: string;

  // CORS
  CORS_ORIGINS: string;

  // Logging
  LOG_LEVEL: 'verbose' | 'debug' | 'log' | 'warn' | 'error';

  // Stripe (optional in dev)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

interface SchemaField {
  required: boolean;
  type: 'string' | 'number' | 'enum';
  enumValues?: string[];
  default?: string;
}

/**
 * Lightweight env validation schema.
 * Each entry describes expectations for a single variable.
 */
const ENV_SCHEMA: Record<string, SchemaField> = {
  NODE_ENV: {
    required: false,
    type: 'enum',
    enumValues: ['development', 'staging', 'production', 'test'],
    default: 'development',
  },
  PORT: {
    required: false,
    type: 'number',
    default: '3001',
  },
  API_PREFIX: {
    required: false,
    type: 'string',
    default: 'v1',
  },
  DATABASE_URL: {
    required: true,
    type: 'string',
  },
  CLERK_SECRET_KEY: {
    required: true,
    type: 'string',
  },
  CLERK_PUBLISHABLE_KEY: {
    required: false,
    type: 'string',
  },
  CLERK_JWT_KEY: {
    required: false,
    type: 'string',
  },
  CLERK_AUTHORIZED_PARTIES: {
    required: false,
    type: 'string',
    default: 'http://localhost:3000',
  },
  CLERK_WEBHOOK_SECRET: {
    required: false,
    type: 'string',
  },
  CORS_ORIGINS: {
    required: false,
    type: 'string',
    default: 'http://localhost:3000',
  },
  LOG_LEVEL: {
    required: false,
    type: 'enum',
    enumValues: ['verbose', 'debug', 'log', 'warn', 'error'],
    default: 'log',
  },
  STRIPE_SECRET_KEY: {
    required: false,
    type: 'string',
  },
  STRIPE_WEBHOOK_SECRET: {
    required: false,
    type: 'string',
  },
};

/**
 * Validate and transform `process.env` against the schema.
 * Returns a typed, fully-populated config object.
 *
 * @throws Error on first missing/invalid required variable
 */
export function validate(raw: Record<string, string | undefined>): EnvConfig {
  const errors: string[] = [];
  const result: Record<string, string | number> = {};

  for (const [key, schema] of Object.entries(ENV_SCHEMA)) {
    const value = raw[key] ?? schema.default;

    if (value === undefined || value === '') {
      if (schema.required) {
        errors.push(`  ❌ ${key} is required but not set`);
      }
      continue;
    }

    // Enum check
    if (schema.type === 'enum' && schema.enumValues && !schema.enumValues.includes(value)) {
      errors.push(`  ❌ ${key} must be one of: ${schema.enumValues.join(', ')} (got "${value}")`);
      continue;
    }

    // Type coercion
    result[key] = schema.type === 'number' ? parseInt(value, 10) : value;
  }

  if (errors.length > 0) {
    throw new Error(`\nEnvironment validation failed:\n${errors.join('\n')}\n`);
  }

  return result as unknown as EnvConfig;
}

/**
 * Convenience: is the current environment production?
 */
export function isProduction(env: Environment): boolean {
  return env === 'production';
}
