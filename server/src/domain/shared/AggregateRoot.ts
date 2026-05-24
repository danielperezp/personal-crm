import type { DomainEvent } from './DomainEvent.js';

export abstract class AggregateRoot<TId> {
  private _uncommittedEvents: DomainEvent[] = [];
  private _version: number = 0;

  protected constructor(protected readonly _id: TId) {}

  get id(): TId { return this._id; }
  get version(): number { return this._version; }

  getUncommittedEvents(): ReadonlyArray<DomainEvent> {
    return [...this._uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  protected apply(event: DomainEvent): void {
    this.when(event);
    this._version++;
    this._uncommittedEvents.push(event);
  }

  protected rehydrate(events: DomainEvent[]): void {
    for (const event of events) {
      this.when(event);
      this._version++;
    }
  }

  protected abstract when(event: DomainEvent): void;
}
