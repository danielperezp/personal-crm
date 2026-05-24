import type { DomainEvent } from '../../../domain/shared/DomainEvent.js';

export interface IEventHandler {
  handle(event: DomainEvent): Promise<void>;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: IEventHandler): void;
}
