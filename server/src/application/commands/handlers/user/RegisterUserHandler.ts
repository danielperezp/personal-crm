import type { ICommandHandler } from '../../bus/ICommandBus.js';
import type { RegisterUserCommand } from '../../user/RegisterUserCommand.js';
import type { IEventStore } from '../../../ports/IEventStore.js';
import type { IBootstrapRepository } from '../../../ports/IBootstrapRepository.js';
import { User } from '../../../../domain/user/User.js';
import { createId } from '../../../../domain/shared/types/branded.js';
import type { UserId } from '../../../../domain/shared/types/branded.js';

export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly eventStore: IEventStore,
    private readonly bootstrapRepo: IBootstrapRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const userId = createId<'UserId'>('UserId', 'usr') as UserId;

    let role = command.payload.role ?? 'Viewer';
    const { isFirst } = await this.bootstrapRepo.claimIfFirst(userId);
    if (isFirst) {
      role = 'Owner';
    }

    const user = User.register({
      userId,
      firebaseUid: command.payload.firebaseUid,
      email: command.payload.email,
      displayName: command.payload.displayName,
      role,
    });

    await this.eventStore.save(
      userId,
      'User',
      user.getUncommittedEvents(),
      0,
    );
  }
}
