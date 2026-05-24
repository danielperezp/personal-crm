export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export abstract class ApplicationError extends Error {
  abstract readonly statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApplicationError {
  readonly statusCode = 404;
}

export class ConflictError extends ApplicationError {
  readonly statusCode = 409;
}

export class UnauthorizedError extends ApplicationError {
  readonly statusCode = 401;
}

export class ForbiddenError extends ApplicationError {
  readonly statusCode = 403;
}

export class ConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}
