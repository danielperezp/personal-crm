import type { ICommandHandler, Command } from '../../bus/ICommandBus.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import type { IReadModelRepository } from '../../../ports/IReadModelRepository.js';
import { User } from '../../../../domain/user/User.js';

interface SuspendUserPayload { userId: string; reason?: string; }
interface SuspendUserCommand extends Command { type: 'SuspendUser'; payload: SuspendUserPayload; }

export class SuspendUserHandler implements ICommandHandler<SuspendUserCommand> {
  constructor(
    private readonly eventStore: IEventStore,
    private readonly readModelRepo: IReadModelRepository,
  ) {}

  async execute(command: SuspendUserCommand): Promise<void> {
    const events = await this.eventStore.load(command.payload.userId);
    const user = User.reconstitute(events);

    let isLastOwner = false;
    if (user.role === 'Owner') {
      const result = await this.readModelRepo.findMany<{ role: string }>('rm_users', [{ field: 'role', operator: '==', value: 'Owner' }]);
      isLastOwner = result.total <= 1;
    }

    user.suspend(command.payload.reason, command.metadata.userId, isLastOwner);
    await this.eventStore.save(command.payload.userId, 'User', user.getUncommittedEvents(), user.version - 1);
  }
}
