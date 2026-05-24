import { describe, it, expect } from 'vitest';
import { AggregateRoot } from '../../domain/shared/AggregateRoot.js';
import type { DomainEvent } from '../../domain/shared/DomainEvent.js';

class TestEvent implements DomainEvent {
  eventId = 'evt_1';
  aggregateId = 'agg_1';
  aggregateType = 'Test';
  eventType = 'TestHappened';
  version = 1;
  payload = { value: 42 };
  metadata = { userId: 'u1', correlationId: 'c1', causationId: 'c1', timestamp: Date.now() };
}

class TestAggregate extends AggregateRoot<string> {
  value = 0;

  static create(id: string): TestAggregate {
    const agg = new TestAggregate(id);
    agg.apply(new TestEvent());
    return agg;
  }

  protected when(event: DomainEvent): void {
    if (event.eventType === 'TestHappened') {
      this.value = (event.payload as { value: number }).value;
    }
  }
}

describe('AggregateRoot', () => {
  it('tracks uncommitted events after apply', () => {
    const agg = TestAggregate.create('agg_1');
    expect(agg.getUncommittedEvents()).toHaveLength(1);
    expect(agg.version).toBe(1);
  });

  it('clears uncommitted events', () => {
    const agg = TestAggregate.create('agg_1');
    agg.clearUncommittedEvents();
    expect(agg.getUncommittedEvents()).toHaveLength(0);
  });

  it('rehydrates from events without adding to uncommitted', () => {
    const agg = new (class extends TestAggregate {
      constructor() { super('agg_1'); }
      testRehydrate(events: DomainEvent[]) { this.rehydrate(events); }
    })();
    agg.testRehydrate([new TestEvent()]);
    expect(agg.getUncommittedEvents()).toHaveLength(0);
    expect(agg.version).toBe(1);
    expect(agg.value).toBe(42);
  });
});
