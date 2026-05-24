export interface Query {
  type: string;
  payload: unknown;
}

export interface IQueryHandler<TQuery extends Query, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

export interface IQueryBus {
  execute<TQuery extends Query, TResult>(query: TQuery): Promise<TResult>;
  register<TQuery extends Query, TResult>(queryType: string, handler: IQueryHandler<TQuery, TResult>): void;
}
