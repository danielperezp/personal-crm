export interface IFileStorage {
  upload(path: string, file: Buffer, contentType: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresInMs: number): Promise<string>;
}
