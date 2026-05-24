import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { type ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Request body validation failed',
        details: result.error.flatten(),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
