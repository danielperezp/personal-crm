import { z } from 'zod';

// ─── Users ────────────────────────────────────────────────────────────────────
export const UserRole = z.enum(['Owner', 'Admin', 'Viewer']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['Active', 'Suspended', 'Deactivated']);
export type UserStatus = z.infer<typeof UserStatus>;

export const Permission = z.enum([
  'customers:read', 'customers:write',
  'invoices:read', 'invoices:write',
  'payments:read', 'payments:write',
  'expenses:read', 'expenses:write',
  'receipts:read', 'receipts:write',
  'bills:read', 'bills:write',
  'subscriptions:read', 'subscriptions:write',
  'utilities:read', 'utilities:write',
  'orders:read', 'orders:write',
  'purchases:read', 'purchases:write',
  'projects:read', 'projects:write',
  'assets:read', 'assets:write',
  'investments:read', 'investments:write',
  'accountability:read', 'accountability:write',
  'users:manage',
  'system:config',
  'events:replay',
]);
export type Permission = z.infer<typeof Permission>;

// ─── Notes / Interactions ────────────────────────────────────────────────────
export const NoteType = z.enum(['note', 'call', 'email', 'meeting']);
export type NoteType = z.infer<typeof NoteType>;

// ─── Customers ────────────────────────────────────────────────────────────────
export const CustomerStatus = z.enum(['Lead', 'Active', 'Inactive', 'Churned']);
export type CustomerStatus = z.infer<typeof CustomerStatus>;

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const InvoiceStatus = z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Void']);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;

// ─── Payments ─────────────────────────────────────────────────────────────────
export const PaymentMethod = z.enum(['BankTransfer', 'CreditCard', 'Cash', 'Stripe', 'PayPal', 'Check', 'Crypto', 'Other']);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const PaymentStatus = z.enum(['Pending', 'Completed', 'Failed', 'Refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const ExpenseStatus = z.enum(['Draft', 'Submitted', 'Approved', 'Paid']);
export type ExpenseStatus = z.infer<typeof ExpenseStatus>;

export const ExpenseCategory = z.enum([
  'Office', 'Software', 'Hardware', 'Utilities', 'Contractors',
  'Payroll', 'Travel', 'Meals', 'BankFees', 'Taxes',
  'Insurance', 'Marketing', 'Maintenance', 'Other',
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategory>;

// ─── Bills ────────────────────────────────────────────────────────────────────
export const BillStatus = z.enum(['Pending', 'Paid', 'Overdue', 'Cancelled']);
export type BillStatus = z.infer<typeof BillStatus>;

export const BillingFrequency = z.enum(['Monthly', 'Quarterly', 'Annually', 'Custom']);
export type BillingFrequency = z.infer<typeof BillingFrequency>;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const SubscriptionStatus = z.enum(['Active', 'Paused', 'Cancelled', 'Expired']);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const BillingCycle = z.enum(['Monthly', 'Quarterly', 'Annual']);
export type BillingCycle = z.infer<typeof BillingCycle>;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const OrderStatus = z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']);
export type OrderStatus = z.infer<typeof OrderStatus>;

// ─── Purchases ────────────────────────────────────────────────────────────────
export const PurchaseStatus = z.enum(['Draft', 'Submitted', 'Ordered', 'Received', 'Cancelled']);
export type PurchaseStatus = z.infer<typeof PurchaseStatus>;

// ─── Projects ─────────────────────────────────────────────────────────────────
export const ProjectStatus = z.enum(['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled']);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

// ─── Assets ───────────────────────────────────────────────────────────────────
export const AssetStatus = z.enum(['Active', 'InRepair', 'Retired', 'Sold', 'Lost']);
export type AssetStatus = z.infer<typeof AssetStatus>;

export const AssetCondition = z.enum(['New', 'Excellent', 'Good', 'Fair', 'Poor']);
export type AssetCondition = z.infer<typeof AssetCondition>;

// ─── Investments ──────────────────────────────────────────────────────────────
export const InvestmentStatus = z.enum(['Active', 'Exited', 'WrittenOff']);
export type InvestmentStatus = z.infer<typeof InvestmentStatus>;

// ─── Accountability ───────────────────────────────────────────────────────────
export const AccountabilityStatus = z.enum(['Open', 'Completed', 'Failed', 'Cancelled']);
export type AccountabilityStatus = z.infer<typeof AccountabilityStatus>;

export const AccountabilityType = z.enum(['Goal', 'Habit', 'Task', 'Milestone']);
export type AccountabilityType = z.infer<typeof AccountabilityType>;

// ─── Role → Permissions mapping ───────────────────────────────────────────────
const ALL_PERMISSIONS: Permission[] = Permission.options;

const ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(
  p => !['users:manage', 'system:config', 'events:replay'].includes(p),
);

const VIEWER_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(p => p.endsWith(':read'));

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Owner: ALL_PERMISSIONS,
  Admin: ADMIN_PERMISSIONS,
  Viewer: VIEWER_PERMISSIONS,
};
