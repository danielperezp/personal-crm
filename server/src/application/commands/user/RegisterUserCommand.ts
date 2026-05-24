import type { Command } from '../../commands/bus/ICommandBus.js';
import type { UserRole } from '@nexus/shared';

export interface RegisterUserPayload {
  firebaseUid: string;
  email: string;
  displayName: string;
  role?: UserRole;
}

export interface RegisterUserCommand extends Command {
  type: 'RegisterUser';
  payload: RegisterUserPayload;
}
