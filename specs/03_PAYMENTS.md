# Module 03 — Payments

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Payments
> **Bounded Context:** Financial Context
> **Phase:** 2 (Weeks 5–8)
> **Status:** Draft

---

## 1. Overview

The Payments module records all inbound money — whether tied to an invoice or standalone. It supports multiple payment methods, reconciliation tracking, and refund handling. Payments are the bridge between Invoices and Receipts and feed directly into cash flow projections and revenue dashboards.

---

## 2. Aggregate: `Payment`

```
Payment (Aggregate Root)
├── paymentId: PaymentId
├── invoiceId?: InvoiceId
├── customerId?: CustomerId
├── amount: Money
├── currency: CurrencyCode
├── method: PaymentMethod            // Cash | BankTransfer | Card | Crypto | Other
├── reference?: string               // External ref (transaction ID, check #)
├── status: PaymentStatus            // Pending | Completed | Failed | Refunded
├── receivedAt: Timestamp
├── reconciled: boolean
├── refundedAmount?: Money
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- If linked to an invoice, payment amount cannot exceed invoice remaining balance.
- Refund amount cannot exceed original payment amount.
- Cannot refund a Pending or Failed payment.
- Cannot complete a Failed payment (must record a new one).
- A Completed payment cannot transition back to Pending.

### Enums

```typescript
type PaymentMethod = 'Cash' | 'BankTransfer' | 'Card' | 'Crypto' | 'Other';
type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded' | 'PartiallyRefunded';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `PaymentRecorded` | `{ paymentId, invoiceId?, customerId?, amount, currency, method, reference?, receivedAt }` |
| `PaymentCompleted` | `{ completedAt }` |
| `PaymentFailed` | `{ reason }` |
| `PaymentRefunded` | `{ refundAmount, reason?, refundedAt }` |
| `PaymentPartiallyRefunded` | `{ refundAmount, remainingAmount, reason? }` |
| `PaymentReconciled` | `{ reconciledAt, reconciledBy }` |
| `PaymentNoteUpdated` | `{ notes }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `PaymentCompleted` | Invoice Module | Trigger `MarkInvoicePaid` if total payments ≥ invoice total |
| `PaymentCompleted` | Receipt Reactor | Auto-generate receipt |
| `PaymentCompleted` | Cash Flow Projection | Record inflow |
| `PaymentCompleted` | Dashboard KPI | Update revenue |
| `PaymentRefunded` | Invoice Module | Revert invoice to Issued/Overdue if underpaid |

---

## 4. Commands

| Command | Payload | Validation |
|---|---|---|
| `RecordPayment` | `{ invoiceId?, customerId?, amount, currency, method, reference?, receivedAt?, notes? }` | amount > 0; if invoiceId, ≤ remaining balance |
| `CompletePayment` | `{ paymentId }` | Status is Pending |
| `FailPayment` | `{ paymentId, reason }` | Status is Pending |
| `RefundPayment` | `{ paymentId, refundAmount, reason? }` | Status is Completed; refundAmount ≤ amount |
| `ReconcilePayment` | `{ paymentId }` | Status is Completed; not already reconciled |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetPaymentLedger` | `PaginatedResult<PaymentLedgerDTO>` — filters: status, method, dateRange, customerId, reconciled |
| `GetPaymentDetail` | `PaymentDetailDTO` |
| `GetPaymentsByInvoice` | `PaymentLedgerDTO[]` |
| `GetPaymentsByCustomer` | `PaymentLedgerDTO[]` |
| `GetUnreconciledPayments` | `PaymentLedgerDTO[]` |

---

## 6. Read Model: `rm_payments`

```typescript
interface PaymentLedgerReadModel {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  status: PaymentStatus;
  receivedAt: number;
  reconciled: boolean;
  refundedAmount?: number;
  notes?: string;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/payments/commands/RecordPayment
POST   /api/v1/payments/commands/CompletePayment
POST   /api/v1/payments/commands/FailPayment
POST   /api/v1/payments/commands/RefundPayment
POST   /api/v1/payments/commands/ReconcilePayment

GET    /api/v1/payments                              → Paginated ledger
GET    /api/v1/payments/:id                          → Detail
GET    /api/v1/payments/:id/events                   → Audit trail
GET    /api/v1/payments/by-invoice/:invoiceId
GET    /api/v1/payments/by-customer/:customerId
GET    /api/v1/payments/unreconciled
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/payments` | `PaymentLedgerPage` — full ledger with filters |

### Key Components

- `PaymentTable.tsx` — TanStack Table with method icons, status badges
- `RecordPaymentDialog.tsx` — Modal form with invoice search/link
- `PaymentDetailDrawer.tsx` — Side drawer with full details + refund action
- `ReconciliationToggle.tsx` — Mark as reconciled
- `PaymentMethodIcon.tsx` — Visual icon per method

---

## 9. Acceptance Criteria

- [ ] Can record a payment linked to an invoice or standalone
- [ ] Payment linked to invoice cannot exceed remaining balance
- [ ] Can complete, fail, or refund a payment with correct state transitions
- [ ] Refund amount cannot exceed original amount
- [ ] Reconciliation flag toggles correctly
- [ ] Payment ledger filters by status, method, date range, customer
- [ ] Unreconciled payments view works
- [ ] PaymentCompleted triggers downstream effects (invoice paid, receipt generation)
- [ ] All transitions produce domain events

---

## 10. File Manifest

```
server/src/domain/payment/Payment.ts
server/src/domain/payment/Payment.events.ts
server/src/domain/payment/Payment.errors.ts
server/src/domain/payment/IPaymentRepository.ts
server/src/application/commands/handlers/payment/*
server/src/application/queries/handlers/payment/*
server/src/application/dto/PaymentDTO.ts
server/src/application/events/reactors/PaymentCompletedReactor.ts
server/src/infrastructure/projections/PaymentLedgerProjection.ts
server/src/infrastructure/http/routes/paymentRoutes.ts
server/src/infrastructure/http/controllers/PaymentController.ts
client/src/features/payments/**
```
