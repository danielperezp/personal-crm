export interface IBootstrapRepository {
  /** Returns the ownerId if bootstrap already ran, null if this is the first call. */
  claimIfFirst(ownerId: string): Promise<{ isFirst: boolean }>;
}
