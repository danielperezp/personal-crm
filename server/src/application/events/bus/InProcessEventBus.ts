import { EventEmitter } from 'events';
import type { DomainEvent } from '../../../domain/shared/DomainEvent.js';
import type { IEventBus, IEventHandler } from './IEventBus.js';

export class InProcessEventBus implements IEventBus {
  private readonly emitter = new EventEmitter();

  subscribe(eventType: string, handler: IEventHandler): void {
    this.emitter.on(eventType, (event: DomainEvent) => {
      handler.handle(event).catch(err => {
        console.error(`EventBus handler error for ${eventType}:`, err);
      });
    });
  }

  async publish(event: DomainEvent): Promise<void> {
    this.emitter.emit(event.eventType, event);
  }
}
