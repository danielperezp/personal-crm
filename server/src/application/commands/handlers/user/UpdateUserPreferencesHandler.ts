import type { ICommandHandler, Command } from '../../bus/ICommandBus.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import { User } from '../../../../domain/user/User.js';

interface UpdateUserPreferencesPayload { userId: string; changes: Record<string, unknown>; }
interface UpdateUserPreferencesCommand extends Command { type: 'UpdateUserPreferences'; payload: UpdateUserPreferencesPayload; }

export class UpdateUserPreferencesHandler implements ICommandHandler<UpdateUserPreferencesCommand> {
  constructor(private readonly eventStore: IEventStore) {}
  async execute(command: UpdateUserPreferencesCommand): Promise<void> {
    const events = await this.eventStore.load(command.payload.userId);
    const user = User.reconstitute(events);
    user.updatePreferences(command.payload.changes as Parameters<typeof user.updatePreferences>[0], command.metadata.userId);
    await this.eventStore.save(command.payload.userId, 'User', user.getUncommittedEvents(), user.version - 1);
  }
}
