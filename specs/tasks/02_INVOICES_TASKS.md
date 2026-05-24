# Tasks — Module 02: Invoices

> **Phase:** 2 (Weeks 5–8)
> **Dependencies:** Module 00 (Foundation), Module 01 (Customers)
> **Estimated Tasks:** 58

---

## 1. Domain Layer

- [ ] T-0179: Implement `LineItem` entity — `lineItemId`, `description`, `quantity`, `unitPrice`, `taxRate`, computed `subtotal`
- [ ] T-0180: Implement `InvoiceNumber` value object — format `{prefix}-{number:04d}`, immutable
- [ ] T-0181: Implement `Invoice` aggregate root — constructor, factory method `Invoice.draft(props)`
- [ ] T-0182: Implement `Invoice.when(event)` state transition handler for all invoice events
- [ ] T-0183: Implement `Invoice.draft()` — emit `InvoiceDrafted`, assign invoice number
- [ ] T-0184: Implement `Invoice.addLineItem(item)` — validate status is Draft, quantity > 0, emit `InvoiceLineItemAdded`
- [ ] T-0185: Implement `Invoice.updateLineItem(lineItemId, changes)` — validate Draft, item exists, emit `InvoiceLineItemUpdated`
- [ ] T-0186: Implement `Invoice.removeLineItem(lineItemId)` — validate Draft, item exists, emit `InvoiceLineItemRemoved`
- [ ] T-0187: Implement `Invoice.issue(dueDate)` — validate Draft, ≥ 1 line item, dueDate ≥ now, compute totals, emit `InvoiceIssued`
- [ ] T-0188: Implement `Invoice.markPaid(paymentIds)` — validate Issued/Overdue, emit `InvoiceMarkedPaid`
- [ ] T-0189: Implement `Invoice.cancel(reason?)` — validate Draft or Issued, emit `InvoiceCancelled`
- [ ] T-0190: Implement `Invoice.void(reason?)` — validate Issued or Overdue, emit `InvoiceVoided`
- [ ] T-0191: Implement `Invoice.flagOverdue(daysPastDue)` — validate Issued, dueDate < now, emit `InvoiceOverdue`
- [ ] T-0192: Implement total computation — `subtotal` (sum of line items), `taxTotal` (sum of per-line tax), `total` (subtotal + taxTotal)
- [ ] T-0193: Define `Invoice.events.ts` — all event type interfaces with typed payloads
- [ ] T-0194: Define `Invoice.errors.ts` — `InvoiceNotDraftError`, `InvoiceNoLineItemsError`, `InvoiceDueDateInvalidError`, `InvoiceNotIssuedError`, `InvoiceAlreadyPaidError`
- [ ] T-0195: Define `IInvoiceRepository` port — `getNextInvoiceNumber()`, `findByCustomerId()`
- [ ] T-0196: Write unit tests for `Invoice` aggregate — draft, add/update/remove line items, issue, mark paid, cancel, void, overdue, total computation, invariant violations

---

## 2. Application Layer — Command Handlers

- [ ] T-0197: Implement `DraftInvoiceHandler` — validate customer exists and Active, get next invoice number atomically, create aggregate, save
- [ ] T-0198: Implement `AddLineItemHandler` — load invoice, apply, save
- [ ] T-0199: Implement `UpdateLineItemHandler` — load, apply, save
- [ ] T-0200: Implement `RemoveLineItemHandler` — load, apply, save
- [ ] T-0201: Implement `IssueInvoiceHandler` — load, apply with dueDate, save
- [ ] T-0202: Implement `MarkInvoicePaidHandler` — load, verify total payments ≥ total, apply, save
- [ ] T-0203: Implement `CancelInvoiceHandler` — load, apply, save
- [ ] T-0204: Implement `VoidInvoiceHandler` — load, apply, save
- [ ] T-0205: Implement `FlagInvoiceOverdueHandler` — load, apply, save (system command)
- [ ] T-0206: Implement `UpdateInvoiceNotesHandler` — load, apply, save
- [ ] T-0207: Implement `AddInvoiceAttachmentHandler` — load, apply, save
- [ ] T-0208: Register all invoice command handlers in DI container / command bus

---

## 3. Application Layer — Query Handlers

- [ ] T-0209: Define `InvoiceListDTO` and `InvoiceDetailDTO` in `InvoiceDTO.ts`
- [ ] T-0210: Implement `GetInvoiceListHandler` — query `rm_invoices` with filters (status, customerId, dateRange), pagination
- [ ] T-0211: Implement `GetInvoiceDetailHandler` — query `rm_invoice_details` by ID
- [ ] T-0212: Implement `GetInvoicesByCustomerHandler` — query `rm_invoices` by customerId
- [ ] T-0213: Implement `GetOverdueInvoicesHandler` — query `rm_invoices` where status = Overdue
- [ ] T-0214: Implement `GetInvoicePaymentHistoryHandler` — query `rm_payments` by invoiceId
- [ ] T-0215: Implement `GetRevenueByPeriodHandler` — aggregate from `rm_monthly_summary`
- [ ] T-0216: Register all invoice query handlers

---

## 4. Application Layer — Zod Schemas

- [ ] T-0217: Implement `draftInvoiceSchema` — customerId, currency, notes?, linkedOrderId?, linkedProjectId?
- [ ] T-0218: Implement `addLineItemSchema` — invoiceId, description, quantity (> 0), unitPrice (≥ 0), taxRate (0–100)
- [ ] T-0219: Implement `issueInvoiceSchema` — invoiceId, dueDate (≥ now)
- [ ] T-0220: Implement `markInvoicePaidSchema` — invoiceId, paymentIds[]

---

## 5. Infrastructure — Invoice Number Sequence

- [ ] T-0221: Create Firestore document `/system/sequences` with `invoiceNumber: { prefix: "INV", current: 0, format: "{prefix}-{number:04d}" }`
- [ ] T-0222: Implement atomic increment function using Firestore transaction — read current, increment, return formatted number

---

## 6. Infrastructure — Projections

- [ ] T-0223: Implement `InvoiceListProjection` — subscribe to all invoice events, upsert/update `rm_invoices` with denormalized customer name
- [ ] T-0224: Implement `InvoiceDetailProjection` — subscribe to invoice + payment events, maintain `rm_invoice_details` with line items, payments, customer info
- [ ] T-0225: Register projections in ProjectionEngine

---

## 7. Infrastructure — HTTP Layer

- [ ] T-0226: Implement `InvoiceController` — methods for all commands and queries
- [ ] T-0227: Implement `invoiceRoutes.ts` — POST routes for 11 commands, GET routes for list, detail, by-customer, overdue, payment history, events
- [ ] T-0228: Add Zod validation + permission guards to all routes

---

## 8. Infrastructure — Overdue Detection Cloud Function

- [ ] T-0229: Implement Cloud Function triggered daily — query `rm_invoices` where status = Issued AND dueDate < now
- [ ] T-0230: For each result, dispatch `FlagInvoiceOverdue` command
- [ ] T-0231: Deploy and test Cloud Function

---

## 9. Frontend — API, Hooks, Components, Pages

- [ ] T-0232: Implement `invoiceApi.ts` — typed Axios calls for all endpoints
- [ ] T-0233: Implement `useInvoices`, `useInvoiceDetail`, `useDraftInvoice`, `useIssueInvoice`, `useInvoicePayments` hooks
- [ ] T-0234: Implement `InvoiceListPage` — DataTable with status tabs (All, Draft, Issued, Overdue, Paid)
- [ ] T-0235: Implement `InvoiceTable` — columns: number, customer, total, status badge, issued date, due date, actions
- [ ] T-0236: Implement `InvoiceStatusBadge` — color-coded (Draft=gray, Issued=blue, Paid=green, Overdue=red, Cancelled=orange, Void=gray-strikethrough)
- [ ] T-0237: Implement `InvoiceCreatePage` — full-page form with customer selector, line item editor, notes
- [ ] T-0238: Implement `LineItemEditor` — add/edit/remove rows, live subtotal/tax/total computation
- [ ] T-0239: Implement `LineItemRow` — inline editable: description, quantity, unit price, tax rate, computed subtotal
- [ ] T-0240: Implement `InvoiceTotalsBar` — sticky bottom bar showing subtotal, tax, total
- [ ] T-0241: Implement `InvoiceDetailPage` — invoice preview + actions bar + payment history tab
- [ ] T-0242: Implement `InvoicePreview` — print-ready layout matching a real invoice (header, line items, totals, notes)
- [ ] T-0243: Implement `InvoiceActions` — Issue, Cancel, Void, Download PDF context-sensitive buttons
- [ ] T-0244: Implement `InvoicePaymentHistory` — linked payments table
- [ ] T-0245: Implement `InvoiceCustomerSelector` — searchable dropdown with customer name/email
- [ ] T-0246: Implement `InvoiceOverdueAlert` — alert banner for overdue invoices on detail page
- [ ] T-0247: Add routes `/invoices`, `/invoices/new`, `/invoices/:id` to router

---

## 10. Testing

- [ ] T-0248: Write integration tests — draft, add line items, issue, mark paid lifecycle
- [ ] T-0249: Write integration test — issue with zero line items returns 422
- [ ] T-0250: Write integration test — void a paid invoice returns 422
- [ ] T-0251: Write integration test — invoice number auto-increments correctly
