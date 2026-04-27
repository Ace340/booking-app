/**
 * HTTP Exception Filter
 *
 * Catches NestJS `HttpException` instances (including our `BusinessException`)
 * and formats them into a consistent error envelope:
 *
 *   {
 *     "error": {
 *       "code": "VALIDATION_ERROR",
 *       "message": "Human-readable message",
 *       "details": [...]
 *     },
 *     "meta": {
 *       "timestamp": "...",
 *       "requestId": "..."
 *     }
 *   }
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { AppLogger } from '../logger/logger.service';

interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const requestId = (request as any).requestId || 'n/a';

    // Build the error body
    const exceptionResponse = exception.getResponse();
    let code: string;
    let message: string;
    let details: Array<{ field?: string; message: string }> | undefined;

    if (exception instanceof BusinessException) {
      // Our domain exceptions carry a machine-readable code
      code = exception.errorCode;
      message = exception.message;
      details = exception.details;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, any>;

      // NestJS ValidationPipe produces { message: [...], error: "Bad Request" }
      if (Array.isArray(resp.message)) {
        code = 'VALIDATION_ERROR';
        message = 'Request validation failed';
        details = resp.message.map((m: string | { field?: string; message: string }) =>
          typeof m === 'string' ? { message: m } : m,
        );
      } else {
        code = resp.error || exception.name.toUpperCase().replace('EXCEPTION', '');
        message = resp.message || exception.message;
      }
    } else {
      code = exception.name;
      message = String(exceptionResponse);
    }

    const body: ErrorEnvelope = {
      error: { code, message, ...(details ? { details } : {}) },
      meta: { timestamp: new Date().toISOString(), requestId },
    };

    // Log at appropriate level
    if (status >= 500) {
      this.logger.error(`HTTP ${status} ${code}: ${message}`, { requestId, path: request.url });
    } else {
      this.logger.warn(`HTTP ${status} ${code}: ${message}`, { requestId, path: request.url });
    }

    response.status(status).json(body);
  }
}
