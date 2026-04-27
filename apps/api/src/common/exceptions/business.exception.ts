/**
 * Business Exception
 *
 * Base class for all domain-specific errors that should be returned
 * to the client with a specific HTTP status and machine-readable error code.
 *
 * Usage:
 *   throw new BusinessException('BOOKING_OVERLAP', 'Staff member already has a booking at this time', 409);
 *   throw new BusinessException('INSUFFICIENT_BALANCE', 'Not enough funds', 400, { balance: 50, required: 100 });
 *
 * The global exception filter will pick these up and format them into
 * the standard error envelope:
 *   {
 *     "error": {
 *       "code": "BOOKING_OVERLAP",
 *       "message": "Staff member already has a booking at this time",
 *       "details": [...]
 *     },
 *     "meta": { "timestamp": "...", "requestId": "..." }
 *   }
 */

import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  /** Machine-readable error code for the client to switch on */
  public readonly errorCode: string;

  /** Optional field-level detail array */
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    errorCode: string,
    message: string,
    status: number = HttpStatus.BAD_REQUEST,
    details?: Array<{ field?: string; message: string }>,
  ) {
    super(message, status);
    this.errorCode = errorCode;
    this.details = details;
  }
}

/**
 * Common business errors — import and throw directly.
 */
export class NotFoundBusinessException extends BusinessException {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} with id "${id}" not found` : `${resource} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictBusinessException extends BusinessException {
  constructor(message: string) {
    super('CONFLICT', message, HttpStatus.CONFLICT);
  }
}

export class ForbiddenBusinessException extends BusinessException {
  constructor(message: string = 'You are not authorized to perform this action') {
    super('FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationBusinessException extends BusinessException {
  constructor(message: string, details?: Array<{ field?: string; message: string }>) {
    super('VALIDATION_ERROR', message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}
