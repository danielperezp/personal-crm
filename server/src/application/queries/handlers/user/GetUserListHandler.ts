import type { IQueryHandler, Query } from '../../bus/IQueryBus.js';
import type { IReadModelRepository, QueryFilter, PaginatedResult } from '../../../ports/IReadModelRepository.js';
import type { UserListDTO } from '../../../dto/UserDTO.js';

interface GetUserListPayload {
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface GetUserListQuery extends Query {
  type: 'GetUserList';
  payload: GetUserListPayload;
}

export class GetUserListHandler implements IQueryHandler<GetUserListQuery, PaginatedResult<UserListDTO>> {
  constructor(private readonly readModelRepo: IReadModelRepository) {}

  async execute(query: GetUserListQuery): Promise<PaginatedResult<UserListDTO>> {
    const { role, status, page = 1, limit = 20 } = query.payload;
    const filters: QueryFilter[] = [];
    if (role) filters.push({ field: 'role', operator: '==', value: role });
    if (status) filters.push({ field: 'status', operator: '==', value: status });

    return this.readModelRepo.findMany<UserListDTO>(
      'rm_users',
      filters,
      { page, limit },
      { field: 'createdAt', direction: 'asc' },
    );
  }
}
