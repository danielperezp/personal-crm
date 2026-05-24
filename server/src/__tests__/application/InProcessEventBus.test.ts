import { describe, it, expect, vi } from 'vitest';
import { InProcessEventBus } from '../../application/events/bus/InProcessEventBus.js';

const mockEvent = {
  eventId: 'e1', aggregateId: 'a1', aggregateType: 'Test', eventType: 'ThingHappened',
  version: 1, payload: {}, metadata: { userId: 'u1', correlationId: 'c1', causationId: 'c1', timestamp: Date.now() },
};

describe('InProcessEventBus', () => {
  it('delivers event to subscriber', async () => {
    const bus = new InProcessEventBus();
    const handler = { handle: vi.fn().mockResolvedValue(undefined) };
    bus.subscribe('ThingHappened', handler);
    await bus.publish(mockEvent);
    await new Promise(r => setTimeout(r, 10));
    expect(handler.handle).toHaveBeenCalledWith(mockEvent);
  });

  it('delivers to multiple subscribers', async () => {
    const bus = new InProcessEventBus();
    const h1 = { handle: vi.fn().mockResolvedValue(undefined) };
    const h2 = { handle: vi.fn().mockResolvedValue(undefined) };
    bus.subscribe('ThingHappened', h1);
    bus.subscribe('ThingHappened', h2);
    await bus.publish(mockEvent);
    await new Promise(r => setTimeout(r, 10));
    expect(h1.handle).toHaveBeenCalledOnce();
    expect(h2.handle).toHaveBeenCalledOnce();
  });
});
