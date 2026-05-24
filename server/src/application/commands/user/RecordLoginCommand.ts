import type { Command } from '../../commands/bus/ICommandBus.js';

export interface RecordLoginPayload {
  userId: string;
  loginTimestamp: number;
}

export interface RecordLoginCommand extends Command {
  type: 'RecordLogin';
  payload: RecordLoginPayload;
}
