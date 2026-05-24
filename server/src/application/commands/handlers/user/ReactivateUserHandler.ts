import type { ICommandHandler, Command } from '../../bus/ICommandBus.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import { User } from '../../../../domain/user/User.js';

interface ReactivateUserPayload { userId: string; }
interface ReactivateUserCommand extends Command { type: 'ReactivateUser'; payload: ReactivateUserPayload; }

export class ReactivateUserHandler implements ICommandHandler<ReactivateUserCommand> {
  constructor(private readonly eventStore: IEventStore) {}
  async execute(command: ReactivateUserCommand): Promise<void> {
    const events = await this.eventStore.load(command.payload.userId);
    const user = User.reconstitute(events);
    user.reactivate(command.metadata.userId);
    await this.eventStore.save(command.payload.userId, 'User', user.getUncommittedEvents(), user.version - 1);
  }
}
