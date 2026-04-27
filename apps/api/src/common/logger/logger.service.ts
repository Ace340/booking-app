/**
 * Structured Logger Service
 *
 * Wraps NestJS Logger to produce structured, machine-readable log entries.
 *
 * - In **production / staging**: outputs JSON objects (`{"level":"info","message":"…","timestamp":"…"}`).
 * - In **development / test**: uses NestJS's default human-readable formatter.
 *
 * Every log entry can carry a `context` (class/module name) and an optional
 * `meta` object for key-value pairs that show up in structured output.
 *
 * Usage:
 *   constructor(private readonly logger = new AppLogger(MyService.name)) {}
 *   this.logger.info('Booking created', { appointmentId: '...' })
 */

import { Logger, LogLevel } from '@nestjs/common';

export class AppLogger {
  private readonly logger: Logger;
  private readonly context: string;
  private readonly isProduction: boolean;

  constructor(context: string, isProduction?: boolean) {
    this.context = context;
    this.logger = new Logger(context);
    this.isProduction = isProduction ?? process.env.NODE_ENV === 'production';
  }

  // ─── Public API ───────────────────────────────────────────────

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(message, 'info', meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(message, 'warn', meta);
  }

  error(message: string, meta?: Record<string, unknown>, trace?: string): void {
    this.log(message, 'error', { ...meta, ...(trace ? { trace } : {}) });
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(message, 'debug', meta);
  }

  verbose(message: string, meta?: Record<string, unknown>): void {
    this.log(message, 'verbose', meta);
  }

  // ─── Internal ─────────────────────────────────────────────────

  private log(
    message: string,
    level: 'info' | 'warn' | 'error' | 'debug' | 'verbose',
    meta?: Record<string, unknown>,
  ): void {
    if (this.isProduction) {
      // Structured JSON — one object per line for log aggregators (Datadog, CloudWatch, etc.)
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        context: this.context,
        message,
        ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
      };
      // Use the appropriate console method so NestJS log-level filtering still works
      switch (level) {
        case 'error':
          this.logger.error(JSON.stringify(entry));
          break;
        case 'warn':
          this.logger.warn(JSON.stringify(entry));
          break;
        case 'debug':
          this.logger.debug(JSON.stringify(entry));
          break;
        case 'verbose':
          this.logger.verbose(JSON.stringify(entry));
          break;
        default:
          this.logger.log(JSON.stringify(entry));
      }
    } else {
      // Human-readable in dev
      const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
      switch (level) {
        case 'error':
          this.logger.error(`${message}${suffix}`);
          break;
        case 'warn':
          this.logger.warn(`${message}${suffix}`);
          break;
        case 'debug':
          this.logger.debug(`${message}${suffix}`);
          break;
        case 'verbose':
          this.logger.verbose(`${message}${suffix}`);
          break;
        default:
          this.logger.log(`${message}${suffix}`);
      }
    }
  }
}

/**
 * Resolve the NestJS log-level array from the LOG_LEVEL env var.
 * Falls back to ['log', 'warn', 'error'] in production and all levels otherwise.
 */
export function resolveLogLevels(): LogLevel[] {
  const raw = process.env.LOG_LEVEL;
  const map: Record<string, LogLevel[]> = {
    verbose: ['verbose', 'debug', 'log', 'warn', 'error'],
    debug: ['debug', 'log', 'warn', 'error'],
    log: ['log', 'warn', 'error'],
    warn: ['warn', 'error'],
    error: ['error'],
  };

  if (raw && map[raw]) return map[raw];
  return process.env.NODE_ENV === 'production' ? ['log', 'warn', 'error'] : map.verbose;
}
