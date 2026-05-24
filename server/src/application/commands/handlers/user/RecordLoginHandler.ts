import type { ICommandHandler } from '../../bus/ICommandBus.js';
import type { RecordLoginCommand } from '../../user/RecordLoginCommand.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import { User } from '../../../../domain/user/User.js';
import type { UserId } from '../../../../domain/shared/types/branded.js';

export class RecordLoginHandler implements ICommandHandler<RecordLoginCommand> {
  constructor(private readonly eventStore: IEventStore) {}

  async execute(command: RecordLoginCommand): Promise<void> {
    const events = await this.eventStore.load(command.payload.userId);
    if (events.length === 0) return; // User not found — skip silently

    const user = User.reconstitute(events);
    user.recordLogin(command.payload.loginTimestamp);

    await this.eventStore.save(
      command.payload.userId,
      'User',
      user.getUncommittedEvents(),
      user.version - 1,
    );
  }
}
