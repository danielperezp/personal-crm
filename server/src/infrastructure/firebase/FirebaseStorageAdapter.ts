import type { Storage } from 'firebase-admin/storage';
import type { IFileStorage } from '../../application/ports/IFileStorage.js';

export class FirebaseStorageAdapter implements IFileStorage {
  constructor(private readonly storage: Storage) {}

  async upload(path: string, file: Buffer, contentType: string): Promise<string> {
    const bucket = this.storage.bucket();
    const fileRef = bucket.file(path);
    await fileRef.save(file, { contentType });
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    return url;
  }

  async download(path: string): Promise<Buffer> {
    const bucket = this.storage.bucket();
    const [contents] = await bucket.file(path).download();
    return contents;
  }

  async delete(path: string): Promise<void> {
    await this.storage.bucket().file(path).delete();
  }

  async getSignedUrl(path: string, expiresInMs: number): Promise<string> {
    const [url] = await this.storage.bucket().file(path).getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMs,
    });
    return url;
  }
}
