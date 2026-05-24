import { DomainError } from '../shared/DomainError.js';

export class LastOwnerError extends DomainError {
  constructor() {
    super('Cannot remove or demote the last Owner. At least one Owner must remain.');
  }
}

export class UserNotActiveError extends DomainError {
  constructor() {
    super('Operation requires an Active user.');
  }
}

export class UserAlreadyActiveError extends DomainError {
  constructor() {
    super('User is already active.');
  }
}

export class UserNotSuspendedError extends DomainError {
  constructor() {
    super('User is not suspended.');
  }
}

export class UserAlreadySuspendedError extends DomainError {
  constructor() {
    super('User is already suspended.');
  }
}

export class UserAlreadyDeactivatedError extends DomainError {
  constructor() {
    super('User is already deactivated.');
  }
}

export class CannotChangeSelfRoleError extends DomainError {
  constructor() {
    super('Cannot change your own role.');
  }
}
