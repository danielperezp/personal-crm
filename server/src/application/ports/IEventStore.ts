import type { DomainEvent } from '../../domain/shared/DomainEvent.js';

export interface IEventStore {
  save(
    aggregateId: string,
    aggregateType: string,
    events: ReadonlyArray<DomainEvent>,
    expectedVersion: number,
  ): Promise<void>;
  load(aggregateId: string): Promise<DomainEvent[]>;
  loadByType(aggregateType: string, fromTimestamp?: number): Promise<DomainEvent[]>;
}
