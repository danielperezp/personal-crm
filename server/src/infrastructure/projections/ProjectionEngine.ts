import type { DomainEvent } from '../../domain/shared/DomainEvent.js';
import type { Firestore } from 'firebase-admin/firestore';

export interface IProjection {
  readonly name: string;
  readonly subscribedEvents: string[];
  handle(event: DomainEvent): Promise<void>;
}

export class ProjectionEngine {
  private readonly projections: Map<string, IProjection[]> = new Map();

  constructor(private readonly db: Firestore) {}

  register(projection: IProjection): void {
    for (const eventType of projection.subscribedEvents) {
      const existing = this.projections.get(eventType) ?? [];
      existing.push(projection);
      this.projections.set(eventType, existing);
    }
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.projections.get(event.eventType) ?? [];
    const results = await Promise.allSettled(
      handlers.map(p => p.handle(event)),
    );

    // Write checkpoint for each projection that handled this event
    for (let i = 0; i < handlers.length; i++) {
      if (results[i].status === 'fulfilled') {
        const projectionName = handlers[i].name;
        await this.db
          .collection('system')
          .doc(`projection_checkpoints_${projectionName}`)
          .set({ lastTimestamp: event.metadata.timestamp }, { merge: true });
      } else {
        console.error(
          `Projection ${handlers[i].name} failed for event ${event.eventType}:`,
          (results[i] as PromiseRejectedResult).reason,
        );
      }
    }
  }
}
