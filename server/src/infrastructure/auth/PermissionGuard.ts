import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../domain/shared/DomainError.js';

export function requirePermission(permission: string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Not authenticated'));
      return;
    }
    if (!req.user.permissions.includes(permission)) {
      next(new ForbiddenError(`Permission required: ${permission}`));
      return;
    }
    next();
  };
}
