# Module 02 — Invoices

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Invoices
> **Bounded Context:** Financial Context
> **Phase:** 2 (Weeks 5–8)
> **Status:** Draft

---

## 1. Overview

The Invoices module manages the complete invoice lifecycle — from drafting with line items, through issuance, payment tracking, to void/cancellation. Invoices are the primary revenue-tracking instrument and link directly to Customers, Payments, Orders, and Projects. Supports auto-incremented invoice numbers, PDF generation, and overdue detection.

---

## 2. Scope

### In Scope

- Invoice CRUD with Draft → Issued → Paid lifecycle
- Line item management (add, remove, update)
- Auto-incremented invoice numbering (configurable prefix)
- Tax calculation per line item
- Invoice PDF generation (Cloud Storage)
- Link to Customer, Order, Project
- Overdue detection (via scheduled Cloud Function)
- Payment history per invoice
- Void / Cancel with audit trail

### Out of Scope

- Recurring invoices (V2 — use Subscriptions + Reactor)
- Online payment gateway integration
- Multi-currency invoicing within a single invoice
- Credit notes / partial refunds as separate documents (V2)

---

## 3. Aggregate: `Invoice`

```
Invoice (Aggregate Root)
├── invoiceId: InvoiceId
├── customerId: CustomerId
├── invoiceNumber: InvoiceNumber     // Auto-incremented, e.g., INV-0001
├── lineItems: LineItem[]            // Entity
│   ├── lineItemId: string
│   ├── description: string
│   ├── quantity: number
│   ├── unitPrice: Money
│   ├── taxRate: Percentage
│   └── subtotal: Money              // Computed: quantity * unitPrice
├── currency: CurrencyCode
├── subtotal: Money                  // Sum of line item subtotals
├── taxTotal: Money                  // Sum of (subtotal * taxRate) per line
├── total: Money                     // subtotal + taxTotal
├── status: InvoiceStatus
├── issuedAt?: Timestamp
├── dueDate?: Timestamp
├── paidAt?: Timestamp
├── notes?: string
├── attachments: AttachmentRef[]
├── linkedOrderId?: OrderId
├── linkedProjectId?: ProjectId
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot issue an invoice with zero line items.
- Cannot mark as Paid without at least one linked Payment whose total ≥ invoice total.
- `dueDate` must be ≥ `issuedAt`.
- Cannot void or cancel a Paid invoice (must issue credit note in V2).
- Cannot add/remove line items on an Issued, Paid, or Voided invoice — only Draft.
- Invoice number is immutable once assigned (assigned on creation).
- `total` is always a computed derivation — never set directly.
- Line item quantity must be > 0 and unitPrice must be ≥ 0.

### Enums

```typescript
type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Overdue' | 'Cancelled' | 'Void';
```

### State Machine

```
Draft → Issued → Paid
  │        │
  │        ├──→ Overdue → Paid
  │        │
  │        ├──→ Cancelled
  │        │
  │        └──→ Void
  │
  └──→ Cancelled
```

---

## 4. Domain Events

| Event | Payload | Triggered When |
|---|---|---|
| `InvoiceDrafted` | `{ invoiceId, customerId, invoiceNumber, currency, notes?, linkedOrderId?, linkedProjectId? }` | New invoice created as Draft |
| `InvoiceLineItemAdded` | `{ lineItemId, description, quantity, unitPrice, taxRate }` | Line item added to draft |
| `InvoiceLineItemUpdated` | `{ lineItemId, changes }` | Line item modified |
| `InvoiceLineItemRemoved` | `{ lineItemId }` | Line item removed |
| `InvoiceIssued` | `{ issuedAt, dueDate, subtotal, taxTotal, total }` | Invoice sent / finalized |
| `InvoiceMarkedPaid` | `{ paidAt, paymentIds: string[] }` | Full payment received |
| `InvoiceOverdue` | `{ dueDate, daysPastDue }` | Due date passed without full payment |
| `InvoiceCancelled` | `{ reason?: string }` | Invoice cancelled |
| `InvoiceVoided` | `{ reason?: string }` | Issued invoice voided |
| `InvoiceNoteUpdated` | `{ notes }` | Notes field changed |
| `InvoiceAttachmentAdded` | `{ url, fileName }` | File attached |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `InvoiceIssued` | Customer Detail Projection | Add to customer's invoice list |
| `InvoiceIssued` | Dashboard KPI Projection | Increment outstanding balance |
| `InvoiceMarkedPaid` | Monthly Financial Summary | Add to revenue |
| `InvoiceMarkedPaid` | Dashboard KPI Projection | Decrement outstanding, increment collected |
| `InvoiceMarkedPaid` | Receipt Reactor | Auto-generate receipt |
| `InvoiceOverdue` | Dashboard KPI Projection | Increment overdue count |

---

## 5. Commands

| Command | Payload | Validation |
|---|---|---|
| `DraftInvoice` | `{ customerId, currency, notes?, linkedOrderId?, linkedProjectId? }` | Customer exists and is Active |
| `AddLineItem` | `{ invoiceId, description, quantity, unitPrice, taxRate }` | Invoice is Draft; quantity > 0 |
| `UpdateLineItem` | `{ invoiceId, lineItemId, changes }` | Invoice is Draft; line item exists |
| `RemoveLineItem` | `{ invoiceId, lineItemId }` | Invoice is Draft; line item exists |
| `IssueInvoice` | `{ invoiceId, dueDate }` | Invoice is Draft; has ≥ 1 line item; dueDate ≥ now |
| `MarkInvoicePaid` | `{ invoiceId, paymentIds }` | Invoice is Issued/Overdue; total payments ≥ total |
| `CancelInvoice` | `{ invoiceId, reason? }` | Invoice is Draft or Issued |
| `VoidInvoice` | `{ invoiceId, reason? }` | Invoice is Issued or Overdue |
| `UpdateInvoiceNotes` | `{ invoiceId, notes }` | Invoice exists |
| `AddInvoiceAttachment` | `{ invoiceId, url, fileName }` | Invoice exists |
| `FlagInvoiceOverdue` | `{ invoiceId }` | Invoice is Issued; dueDate < now (system command) |

---

## 6. Queries

| Query | Response | Filters |
|---|---|---|
| `GetInvoiceList` | `PaginatedResult<InvoiceListDTO>` | status, customerId, dateRange, sort, pagination |
| `GetInvoiceDetail` | `InvoiceDetailDTO` | invoiceId |
| `GetInvoicesByCustomer` | `InvoiceListDTO[]` | customerId, status |
| `GetOverdueInvoices` | `InvoiceListDTO[]` | (none — returns all overdue) |
| `GetInvoicePaymentHistory` | `PaymentSummary[]` | invoiceId |
| `GetRevenueByPeriod` | `{ period, total, count }[]` | dateRange, granularity (month/quarter/year) |

---

## 7. Read Model Projections

### `InvoiceListProjection`

**Collection:** `rm_invoices`

```typescript
interface InvoiceListReadModel {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  currency: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: InvoiceStatus;
  issuedAt?: number;
  dueDate?: number;
  paidAt?: number;
  lineItemCount: number;
  linkedOrderId?: string;
  linkedProjectId?: string;
  createdAt: number;
  updatedAt: number;
}
```

### `InvoiceDetailProjection`

**Collection:** `rm_invoice_details`

```typescript
interface InvoiceDetailReadModel {
  id: string;
  invoiceNumber: string;
  customer: { id: string; name: string; email: string; address: Address };
  lineItems: LineItemDTO[];
  currency: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: InvoiceStatus;
  issuedAt?: number;
  dueDate?: number;
  paidAt?: number;
  notes?: string;
  attachments: AttachmentRef[];
  payments: PaymentSummary[];
  linkedOrderId?: string;
  linkedProjectId?: string;
  pdfUrl?: string;
  createdAt: number;
  updatedAt: number;
}
```

---

## 8. API Endpoints

```
POST   /api/v1/invoices/commands/DraftInvoice
POST   /api/v1/invoices/commands/AddLineItem
POST   /api/v1/invoices/commands/UpdateLineItem
POST   /api/v1/invoices/commands/RemoveLineItem
POST   /api/v1/invoices/commands/IssueInvoice
POST   /api/v1/invoices/commands/MarkInvoicePaid
POST   /api/v1/invoices/commands/CancelInvoice
POST   /api/v1/invoices/commands/VoidInvoice
POST   /api/v1/invoices/commands/UpdateInvoiceNotes
POST   /api/v1/invoices/commands/AddInvoiceAttachment

GET    /api/v1/invoices                              → Paginated list
GET    /api/v1/invoices/:id                          → Detail view
GET    /api/v1/invoices/:id/payments                 → Payment history
GET    /api/v1/invoices/:id/events                   → Audit trail
GET    /api/v1/invoices/overdue                      → Overdue invoices
GET    /api/v1/invoices/by-customer/:customerId      → Customer invoices
```

---

## 9. Frontend Pages & Components

### Pages

| Route | Page | Description |
|---|---|---|
| `/invoices` | `InvoiceListPage` | DataTable with status tabs (All, Draft, Issued, Overdue, Paid) |
| `/invoices/new` | `InvoiceCreatePage` | Full-page invoice builder with line item editor |
| `/invoices/:id` | `InvoiceDetailPage` | Invoice preview + actions + payment history |

### Feature Components

```
features/invoices/
├── components/
│   ├── InvoiceTable.tsx                # Status-tabbed DataTable
│   ├── InvoiceStatusBadge.tsx          # Color-coded status badge
│   ├── InvoiceBuilder.tsx              # Full invoice form with line item editor
│   ├── LineItemEditor.tsx              # Add/edit/remove line items with live totals
│   ├── LineItemRow.tsx                 # Single line item with inline edit
│   ├── InvoiceTotalsBar.tsx            # Subtotal, tax, total display
│   ├── InvoicePreview.tsx              # Print-ready invoice preview
│   ├── InvoiceActions.tsx              # Issue, Cancel, Void, Download PDF buttons
│   ├── InvoicePaymentHistory.tsx       # Linked payments list
│   ├── InvoiceCustomerSelector.tsx     # Customer search/select dropdown
│   └── InvoiceOverdueAlert.tsx         # Alert banner for overdue invoices
├── hooks/
│   ├── useInvoices.ts
│   ├── useInvoiceDetail.ts
│   ├── useDraftInvoice.ts
│   ├── useIssueInvoice.ts
│   └── useInvoicePayments.ts
├── api/
│   └── invoiceApi.ts
└── types/
    └── invoice.types.ts
```

---

## 10. Invoice Number Sequence

```typescript
// Firestore: /system/sequences
{
  invoiceNumber: {
    prefix: "INV",
    current: 42,
    format: "{prefix}-{number:04d}"  // INV-0042
  }
}

// Atomic increment via Firestore transaction on DraftInvoice command
```

---

## 11. Overdue Detection (Cloud Function)

```typescript
// functions/src/scheduledJobs.ts
// Runs daily at 00:00 UTC
// 1. Query rm_invoices where status = 'Issued' AND dueDate < now
// 2. For each, dispatch FlagInvoiceOverdue command
// 3. Projection updates status to 'Overdue'
```

---

## 12. Acceptance Criteria

- [ ] Can draft an invoice linked to an active customer
- [ ] Can add, update, remove line items on a Draft invoice only
- [ ] Totals (subtotal, tax, total) compute correctly from line items
- [ ] Invoice number auto-increments atomically (INV-0001, INV-0002, ...)
- [ ] Can issue a Draft invoice with a due date; status transitions to Issued
- [ ] Cannot issue invoice with zero line items
- [ ] Can mark an Issued/Overdue invoice as Paid when linked payments cover total
- [ ] Can cancel a Draft or Issued invoice
- [ ] Can void an Issued or Overdue invoice
- [ ] Cannot modify line items on a non-Draft invoice
- [ ] Overdue detection Cloud Function flags past-due Issued invoices
- [ ] Invoice list supports status tab filtering, date range, customer filter
- [ ] Invoice detail shows full preview, payment history, and action buttons
- [ ] PDF generation creates downloadable invoice document
- [ ] All state transitions produce domain events

---

## 13. File Manifest

```
server/src/domain/invoice/Invoice.ts
server/src/domain/invoice/Invoice.events.ts
server/src/domain/invoice/Invoice.errors.ts
server/src/domain/invoice/IInvoiceRepository.ts
server/src/domain/invoice/entities/LineItem.ts
server/src/domain/invoice/vo/InvoiceNumber.ts
server/src/application/commands/handlers/invoice/DraftInvoiceHandler.ts
server/src/application/commands/handlers/invoice/AddLineItemHandler.ts
server/src/application/commands/handlers/invoice/IssueInvoiceHandler.ts
server/src/application/commands/handlers/invoice/MarkInvoicePaidHandler.ts
server/src/application/commands/handlers/invoice/CancelInvoiceHandler.ts
server/src/application/commands/handlers/invoice/VoidInvoiceHandler.ts
server/src/application/queries/handlers/invoice/GetInvoiceListHandler.ts
server/src/application/queries/handlers/invoice/GetInvoiceDetailHandler.ts
server/src/application/dto/InvoiceDTO.ts
server/src/infrastructure/projections/InvoiceListProjection.ts
server/src/infrastructure/projections/InvoiceDetailProjection.ts
server/src/infrastructure/http/routes/invoiceRoutes.ts
server/src/infrastructure/http/controllers/InvoiceController.ts
client/src/features/invoices/**
```
