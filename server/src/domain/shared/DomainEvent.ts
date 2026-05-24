export interface DomainEventMetadata {
  userId: string;
  correlationId: string;
  causationId: string;
  timestamp: number; // Unix ms
}

export interface DomainEvent<TPayload = unknown> {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  payload: TPayload;
  metadata: DomainEventMetadata;
}

export type EventEnvelope<T extends string, P> = DomainEvent<P> & {
  eventType: T;
};
