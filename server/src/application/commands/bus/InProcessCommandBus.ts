import type { Command, ICommandBus, ICommandHandler } from './ICommandBus.js';

export class InProcessCommandBus implements ICommandBus {
  private readonly handlers = new Map<string, ICommandHandler<Command>>();

  register<TCommand extends Command>(commandType: string, handler: ICommandHandler<TCommand>): void {
    this.handlers.set(commandType, handler as ICommandHandler<Command>);
  }

  async execute<TCommand extends Command>(command: TCommand): Promise<void> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.type}`);
    }
    console.log(JSON.stringify({
      level: 'info',
      msg: 'command.execute',
      commandType: command.type,
      commandId: command.metadata.commandId,
      timestamp: command.metadata.timestamp,
    }));
    await handler.execute(command);
  }
}
