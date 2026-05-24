import type { Firestore, Query, CollectionReference } from 'firebase-admin/firestore';
import type {
  IReadModelRepository,
  QueryFilter,
  Pagination,
  OrderBy,
  PaginatedResult,
} from '../../application/ports/IReadModelRepository.js';

export class FirestoreReadModelRepo implements IReadModelRepository {
  constructor(private readonly db: Firestore) {}

  async upsert<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    data: T,
  ): Promise<void> {
    await this.db.collection(collection).doc(id).set(data, { merge: false });
  }

  async update<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    partial: Partial<T>,
  ): Promise<void> {
    await this.db.collection(collection).doc(id).update(partial as Record<string, unknown>);
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const doc = await this.db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as T;
  }

  async findMany<T>(
    collection: string,
    filters?: QueryFilter[],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<PaginatedResult<T>> {
    let query: Query | CollectionReference = this.db.collection(collection);

    if (filters) {
      for (const f of filters) {
        // @ts-expect-error Firestore WhereFilterOp is compatible
        query = (query as Query).where(f.field, f.operator, f.value);
      }
    }

    if (orderBy) {
      query = (query as Query).orderBy(orderBy.field, orderBy.direction);
    }

    // Get total count
    const countSnap = await (query as Query).count().get();
    const total = countSnap.data().count;

    // Apply pagination
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const dataSnap = await (query as Query).offset(offset).limit(limit).get();
    const data = dataSnap.docs.map(d => d.data() as T);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.db.collection(collection).doc(id).delete();
  }
}
