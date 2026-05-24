import type { IQueryHandler, Query } from '../../bus/IQueryBus.js';
import type { IReadModelRepository } from '../../../ports/IReadModelRepository.js';
import type { UserDetailDTO } from '../../../dto/UserDTO.js';
import { NotFoundError } from '../../../../domain/shared/DomainError.js';

interface GetUserDetailQuery extends Query {
  type: 'GetUserDetail';
  payload: { userId: string };
}

export class GetUserDetailHandler implements IQueryHandler<GetUserDetailQuery, UserDetailDTO> {
  constructor(private readonly readModelRepo: IReadModelRepository) {}

  async execute(query: GetUserDetailQuery): Promise<UserDetailDTO> {
    const user = await this.readModelRepo.findById<UserDetailDTO>('rm_users', query.payload.userId);
    if (!user) throw new NotFoundError(`User not found: ${query.payload.userId}`);
    return user;
  }
}
