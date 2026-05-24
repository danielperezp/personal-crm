export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: unknown;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IReadModelRepository {
  upsert<T extends Record<string, unknown>>(collection: string, id: string, data: T): Promise<void>;
  update<T extends Record<string, unknown>>(collection: string, id: string, partial: Partial<T>): Promise<void>;
  findById<T>(collection: string, id: string): Promise<T | null>;
  findMany<T>(collection: string, filters?: QueryFilter[], pagination?: Pagination, orderBy?: OrderBy): Promise<PaginatedResult<T>>;
  delete(collection: string, id: string): Promise<void>;
}
