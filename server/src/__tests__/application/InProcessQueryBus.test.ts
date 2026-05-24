import { describe, it, expect, vi } from 'vitest';
import { InProcessQueryBus } from '../../application/queries/bus/InProcessQueryBus.js';

describe('InProcessQueryBus', () => {
  it('dispatches and returns result', async () => {
    const bus = new InProcessQueryBus();
    const handler = { execute: vi.fn().mockResolvedValue({ data: [] }) };
    bus.register('GetThings', handler);
    const result = await bus.execute({ type: 'GetThings', payload: {} });
    expect(result).toEqual({ data: [] });
  });

  it('throws for unregistered query', async () => {
    const bus = new InProcessQueryBus();
    await expect(bus.execute({ type: 'Unknown', payload: {} })).rejects.toThrow('No handler registered for query: Unknown');
  });
});
