import type { Firestore } from 'firebase-admin/firestore';
import type { IBootstrapRepository } from '../../application/ports/IBootstrapRepository.js';

export class FirestoreBootstrapRepository implements IBootstrapRepository {
  private readonly ref;

  constructor(private readonly db: Firestore) {
    this.ref = this.db.collection('system').doc('bootstrap');
  }

  async claimIfFirst(ownerId: string): Promise<{ isFirst: boolean }> {
    let isFirst = false;
    await this.db.runTransaction(async (tx) => {
      const doc = await tx.get(this.ref);
      if (!doc.exists) {
        isFirst = true;
        tx.set(this.ref, { bootstrapped: true, ownerId, createdAt: Date.now() });
      }
    });
    return { isFirst };
  }
}
