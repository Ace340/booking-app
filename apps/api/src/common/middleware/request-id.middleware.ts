/**
 * Request ID Middleware
 *
 * Assigns a unique correlation ID (`x-request-id`) to every incoming request.
 *
 * - If the client sends an `x-request-id` header it is preserved (useful for
 *   distributed tracing through API gateways).
 * - Otherwise a new UUID v4 is generated.
 * - The ID is stored on `req.requestId` and echoed in the response header
 *   so callers can reference it when reporting issues.
 *
 * Downstream filters, interceptors, and services can read `req.requestId`
 * to include it in log entries and error responses.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
