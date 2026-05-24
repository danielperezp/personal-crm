export interface CommandMetadata {
  commandId: string;
  userId: string;
  correlationId: string;
  timestamp: number;
}

export interface Command {
  type: string;
  payload: unknown;
  metadata: CommandMetadata;
}

export interface ICommandHandler<TCommand extends Command> {
  execute(command: TCommand): Promise<void>;
}

export interface ICommandBus {
  execute<TCommand extends Command>(command: TCommand): Promise<void>;
  register<TCommand extends Command>(commandType: string, handler: ICommandHandler<TCommand>): void;
}
