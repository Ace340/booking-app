/**
 * All Exceptions Filter
 *
 * Last-resort catch-all for errors that are NOT HttpException subclasses
 * (e.g., raw Prisma errors, unhandled promise rejections, type errors).
 *
 * Maps known Prisma error codes to HTTP status codes and returns the same
 * standard error envelope as HttpExceptionFilter.
 *
 * In production the internal error message is hidden from the client;
 * a generic "Internal server error" is returned instead.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
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

/**
 * Map Prisma error codes to HTTP status + user-friendly messages.
 * See: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const PRISMA_ERROR_MAP: Record<
  string,
  { status: number; code: string; message: string }
> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    code: 'CONFLICT',
    message: 'A record with this value already exists',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    code: 'NOT_FOUND',
    message: 'Record not found',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    code: 'FOREIGN_KEY_ERROR',
    message: 'Related record not found',
  },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('AllExceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId || 'n/a';
    const isProd = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    // Prisma error mapping
    if (this.isPrismaError(exception)) {
      const prismaCode = (exception as any).code as string;
      const mapped = PRISMA_ERROR_MAP[prismaCode];
      if (mapped) {
        status = mapped.status;
        code = mapped.code;
        message = mapped.message;
      }
    }

    // Always log the real error internally
    this.logger.error(
      `Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`,
      {
        requestId,
        path: request.url,
        method: request.method,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
    );

    const body: ErrorEnvelope = {
      error: {
        code,
        // Hide internal details in production
        message: isProd && status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'An unexpected error occurred'
          : (exception instanceof Error ? exception.message : String(exception)),
      },
      meta: { timestamp: new Date().toISOString(), requestId },
    };

    response.status(status).json(body);
  }

  private isPrismaError(err: unknown): boolean {
    return (
      err !== null &&
      typeof err === 'object' &&
      'code' in (err as any) &&
      typeof (err as any).code === 'string' &&
      (err as any).code.startsWith('P')
    );
  }
}
