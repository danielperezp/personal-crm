import type { ICommandHandler, Command } from '../../bus/ICommandBus.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import type { IReadModelRepository } from '../../../ports/IReadModelRepository.js';
import { User } from '../../../../domain/user/User.js';
import type { UserRole } from '@nexus/shared';

interface ChangeUserRolePayload { userId: string; newRole: UserRole; }
interface ChangeUserRoleCommand extends Command { type: 'ChangeUserRole'; payload: ChangeUserRolePayload; }

export class ChangeUserRoleHandler implements ICommandHandler<ChangeUserRoleCommand> {
  constructor(
    private readonly eventStore: IEventStore,
    private readonly readModelRepo: IReadModelRepository,
  ) {}

  async execute(command: ChangeUserRoleCommand): Promise<void> {
    if (command.payload.userId === command.metadata.userId) {
      throw new Error('Cannot change your own role.');
    }
    const events = await this.eventStore.load(command.payload.userId);
    const user = User.reconstitute(events);

    let isLastOwner = false;
    if (user.role === 'Owner') {
      const ownerCount = await this.readModelRepo.findMany<{ role: string }>(
        'rm_users',
        [{ field: 'role', operator: '==', value: 'Owner' }],
      );
      isLastOwner = ownerCount.total <= 1;
    }

    user.changeRole(command.payload.newRole, command.metadata.userId, isLastOwner);
    await this.eventStore.save(command.payload.userId, 'User', user.getUncommittedEvents(), user.version - 1);
  }
}
