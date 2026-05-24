declare const __brand: unique symbol;
export type Brand<T, B> = T & { readonly [__brand]: B };

export type CustomerId       = Brand<string, 'CustomerId'>;
export type InvoiceId        = Brand<string, 'InvoiceId'>;
export type PaymentId        = Brand<string, 'PaymentId'>;
export type ExpenseId        = Brand<string, 'ExpenseId'>;
export type ReceiptId        = Brand<string, 'ReceiptId'>;
export type BillId           = Brand<string, 'BillId'>;
export type SubscriptionId   = Brand<string, 'SubscriptionId'>;
export type UtilityId        = Brand<string, 'UtilityId'>;
export type OrderId          = Brand<string, 'OrderId'>;
export type PurchaseId       = Brand<string, 'PurchaseId'>;
export type ProjectId        = Brand<string, 'ProjectId'>;
export type AssetId          = Brand<string, 'AssetId'>;
export type InvestmentId     = Brand<string, 'InvestmentId'>;
export type UserId           = Brand<string, 'UserId'>;
export type AccountabilityId = Brand<string, 'AccountabilityId'>;
export type MilestoneId      = Brand<string, 'MilestoneId'>;
export type InvoiceNumber    = Brand<string, 'InvoiceNumber'>;

export function createId<T extends string>(_brand: T, prefix: string): Brand<string, T> {
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12);
  return `${prefix}_${randomPart}` as Brand<string, T>;
}
