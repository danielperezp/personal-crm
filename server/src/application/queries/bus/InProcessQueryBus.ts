import type { Query, IQueryBus, IQueryHandler } from './IQueryBus.js';

export class InProcessQueryBus implements IQueryBus {
  private readonly handlers = new Map<string, IQueryHandler<Query, unknown>>();

  register<TQuery extends Query, TResult>(queryType: string, handler: IQueryHandler<TQuery, TResult>): void {
    this.handlers.set(queryType, handler as IQueryHandler<Query, unknown>);
  }

  async execute<TQuery extends Query, TResult>(query: TQuery): Promise<TResult> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.type}`);
    }
    return handler.execute(query) as Promise<TResult>;
  }
}
