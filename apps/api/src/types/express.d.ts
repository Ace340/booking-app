/**
 * Express Request augmentation
 *
 * Extends the Express Request type with our custom `requestId` property
 * set by the RequestIdMiddleware.
 */

declare namespace Express {
  interface Request {
    requestId: string;
  }
}
