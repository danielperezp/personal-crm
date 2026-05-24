import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firestore
const mockSet = vi.fn().mockResolvedValue(undefined);
const mockDoc = vi.fn().mockReturnValue({ set: mockSet });
const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc });
const mockDb = { collection: mockCollection } as unknown as import('firebase-admin/firestore').Firestore;

const { ProjectionEngine } = await import('../../infrastructure/projections/ProjectionEngine.js');

const mockEvent = {
  eventId: 'e1', aggregateId: 'a1', aggregateType: 'Test', eventType: 'ThingHappened',
  version: 1, payload: {}, metadata: { userId: 'u1', correlationId: 'c1', causationId: 'c1', timestamp: 1000 },
};

describe('ProjectionEngine', () => {
  let engine: InstanceType<typeof ProjectionEngine>;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new ProjectionEngine(mockDb);
  });

  it('dispatches to matching projection', async () => {
    const handler = { name: 'TestProjection', subscribedEvents: ['ThingHappened'], handle: vi.fn().mockResolvedValue(undefined) };
    engine.register(handler);
    await engine.dispatch(mockEvent);
    expect(handler.handle).toHaveBeenCalledWith(mockEvent);
  });

  it('does not dispatch to non-matching projection', async () => {
    const handler = { name: 'OtherProjection', subscribedEvents: ['OtherEvent'], handle: vi.fn() };
    engine.register(handler);
    await engine.dispatch(mockEvent);
    expect(handler.handle).not.toHaveBeenCalled();
  });

  it('writes checkpoint after successful dispatch', async () => {
    const handler = { name: 'TestProjection', subscribedEvents: ['ThingHappened'], handle: vi.fn().mockResolvedValue(undefined) };
    engine.register(handler);
    await engine.dispatch(mockEvent);
    expect(mockSet).toHaveBeenCalledWith({ lastTimestamp: 1000 }, { merge: true });
  });

  it('isolates errors between projections', async () => {
    const good = { name: 'GoodProjection', subscribedEvents: ['ThingHappened'], handle: vi.fn().mockResolvedValue(undefined) };
    const bad = { name: 'BadProjection', subscribedEvents: ['ThingHappened'], handle: vi.fn().mockRejectedValue(new Error('boom')) };
    engine.register(good);
    engine.register(bad);
    // Should not throw
    await expect(engine.dispatch(mockEvent)).resolves.not.toThrow();
    expect(good.handle).toHaveBeenCalled();
  });
});
