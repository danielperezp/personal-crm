import type { ICommandHandler } from '../../bus/ICommandBus.js';
import type { Command } from '../../bus/ICommandBus.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import { User } from '../../../../domain/user/User.js';

interface UpdateUserPayload { userId: string; changes: { displayName?: string; avatarUrl?: string }; }
interface UpdateUserCommand extends Command { type: 'UpdateUser'; payload: UpdateUserPayload; }

export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly eventStore: IEventStore) {}
  async execute(command: UpdateUserCommand): Promise<void> {
    const events = await this.eventStore.load(command.payload.userId);
    const user = User.reconstitute(events);
    user.update(command.payload.changes, command.metadata.userId);
    await this.eventStore.save(command.payload.userId, 'User', user.getUncommittedEvents(), user.version - 1);
  }
}
