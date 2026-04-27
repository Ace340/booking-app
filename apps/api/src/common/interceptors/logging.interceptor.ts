/**
 * Logging Interceptor
 *
 * Logs every HTTP request/response cycle with method, URL, status code,
 * response time, and the correlation request ID.
 *
 * Uses the structured AppLogger so output is JSON in production.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const requestId = (request as any).requestId || 'n/a';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          this.logger.info(`${method} ${originalUrl} → ${response.statusCode}`, {
            method,
            url: originalUrl,
            statusCode: response.statusCode,
            durationMs: duration,
            requestId,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.warn(`${method} ${originalUrl} → ${error.status ?? 500}`, {
            method,
            url: originalUrl,
            statusCode: error.status ?? 500,
            durationMs: duration,
            requestId,
            error: error.message,
          });
        },
      }),
    );
  }
}
