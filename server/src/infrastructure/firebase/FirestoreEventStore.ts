import type { Firestore } from 'firebase-admin/firestore';
import type { DomainEvent } from '../../domain/shared/DomainEvent.js';
import type { IEventStore } from '../../application/ports/IEventStore.js';
import type { IEventBus } from '../../application/events/bus/IEventBus.js';
import { ConcurrencyError } from '../../domain/shared/DomainError.js';

export class FirestoreEventStore implements IEventStore {
  constructor(
    private readonly db: Firestore,
    private readonly eventBus: IEventBus,
  ) {}

  async save(
    aggregateId: string,
    aggregateType: string,
    events: ReadonlyArray<DomainEvent>,
    expectedVersion: number,
  ): Promise<void> {
    if (events.length === 0) return;

    const aggregateRef = this.db.collection('events').doc(aggregateId);

    await this.db.runTransaction(async (tx) => {
      const metaDoc = await tx.get(aggregateRef);
      const currentVersion: number = metaDoc.exists
        ? (metaDoc.data()?.latestVersion as number ?? 0)
        : 0;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Aggregate ${aggregateId}: expected version ${expectedVersion}, got ${currentVersion}`,
        );
      }

      tx.set(aggregateRef, {
        aggregateType,
        latestVersion: expectedVersion + events.length,
        updatedAt: Date.now(),
      }, { merge: true });

      for (const event of events) {
        const eventRef = aggregateRef.collection('events').doc(event.eventId);
        tx.set(eventRef, {
          ...event,
          // Denormalize aggregateType onto each event doc for collectionGroup queries
          aggregateType,
        });
      }
    });

    // Publish events after successful commit
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }

  async load(aggregateId: string): Promise<DomainEvent[]> {
    const snapshot = await this.db
      .collection('events')
      .doc(aggregateId)
      .collection('events')
      .orderBy('version', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as DomainEvent);
  }

  async loadByType(aggregateType: string, fromTimestamp?: number): Promise<DomainEvent[]> {
    let query = this.db
      .collectionGroup('events')
      .where('aggregateType', '==', aggregateType)
      .orderBy('metadata.timestamp', 'asc');

    if (fromTimestamp !== undefined) {
      query = query.where('metadata.timestamp', '>=', fromTimestamp);
    }

    const snap = await query.get();
    return snap.docs.map(d => d.data() as DomainEvent);
  }
}
