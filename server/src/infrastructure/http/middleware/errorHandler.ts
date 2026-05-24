import type { Request, Response, NextFunction } from 'express';
import { DomainError, ApplicationError, ConcurrencyError } from '../../../domain/shared/DomainError.js';

export function errorHandlerMiddleware(
  err: Error & { type?: string; status?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const correlationId = req.correlationId;

  // Body parser SyntaxError (malformed JSON)
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'BadRequest', message: 'Invalid JSON body', correlationId });
  } else if (err instanceof ConcurrencyError) {
    res.status(409).json({ error: 'ConcurrencyConflict', message: err.message, correlationId });
  } else if (err instanceof DomainError) {
    res.status(422).json({ error: err.name, message: err.message, correlationId });
  } else if (err instanceof ApplicationError) {
    res.status(err.statusCode).json({ error: err.name, message: err.message, correlationId });
  } else {
    console.error({ err, correlationId }, 'Unhandled error');
    res.status(500).json({ error: 'InternalServerError', message: 'An unexpected error occurred', correlationId });
  }
}
