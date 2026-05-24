# Module: Invoices

## Purpose
Issue sales invoices to customers. Track status, totals, and due dates.

## Aggregate: Invoice
- Items: list of line items (description, quantity, unitPrice, tax)
- Status: draft, sent, paid, partiallyPaid, overdue, cancelled
- Computed: subtotal, taxTotal, total, balanceDue

## Commands
- `CreateInvoice`
- `UpdateInvoice` (only draft/sent)
- `IssueInvoice` (change status to sent, generate invoice number)
- `RecordPayment` (apply a payment, update balance; also triggers Payment module)
- `CancelInvoice`
- `MarkAsOverdue` (automatic by scheduler)

## Events
- `InvoiceCreated`, `InvoiceUpdated`, `InvoiceIssued`, `InvoicePaymentRecorded`, `InvoiceCancelled`, `InvoiceMarkedOverdue`

## Projections
- `invoices` collection: denormalized customer name, address for display
- `invoiceItems` subcollection? Or flat.
- Scheduled Cloud Function to detect overdue invoices daily.

## API
- `POST /api/invoices`
- `GET /api/invoices?customerId&status&from&to`
- `GET /api/invoices/:id`
- `PUT /api/invoices/:id`
- `POST /api/invoices/:id/issue`
- `POST /api/invoices/:id/cancel`

## Integration
- On `InvoicePaymentRecorded`, emit event consumed by Payment module to link payment.
- On invoice issue, optionally generate PDF stored in Firebase Storage.