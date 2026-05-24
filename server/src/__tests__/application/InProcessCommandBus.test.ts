import { describe, it, expect, vi } from 'vitest';
import { InProcessCommandBus } from '../../application/commands/bus/InProcessCommandBus.js';
import type { Command } from '../../application/commands/bus/ICommandBus.js';

const meta = { commandId: 'c1', userId: 'u1', correlationId: 'r1', timestamp: Date.now() };

describe('InProcessCommandBus', () => {
  it('dispatches to registered handler', async () => {
    const bus = new InProcessCommandBus();
    const handler = { execute: vi.fn().mockResolvedValue(undefined) };
    bus.register('DoSomething', handler);
    await bus.execute({ type: 'DoSomething', payload: {}, metadata: meta });
    expect(handler.execute).toHaveBeenCalledOnce();
  });

  it('throws for unregistered command', async () => {
    const bus = new InProcessCommandBus();
    await expect(bus.execute({ type: 'Unknown', payload: {}, metadata: meta })).rejects.toThrow('No handler registered for command: Unknown');
  });
});
