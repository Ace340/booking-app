/**
 * Transform Interceptor
 *
 * Wraps every successful controller return value in a standardised envelope:
 *
 *   {
 *     "data": <controller response>,
 *     "meta": {
 *       "timestamp": "2026-04-24T12:00:00.000Z",
 *       "requestId": "uuid"
 *     }
 *   }
 *
 * This guarantees a consistent shape for API consumers and makes it easy to
 * add pagination metadata later without changing existing contracts.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request as any).requestId || 'n/a';

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      })),
    );
  }
}
