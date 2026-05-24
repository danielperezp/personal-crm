# Module: Payments (Incoming)

## Purpose
Record payments received from customers. Payments can be linked to invoices or be standalone (prepayments).

## Aggregate: Payment
- Attributes: amount, method (cash, bank transfer, credit card, etc.), reference, customerId, linkedInvoiceIds[], date, notes

## Commands
- `RecordPayment`
- `AllocatePaymentToInvoice` (if not fully allocated)
- `CancelPayment` (reverse allocation)

## Events
- `PaymentRecorded`, `PaymentAllocated`, `PaymentCancelled`

## Projections
- `payments` collection

## API
- `POST /api/payments`
- `GET /api/payments?customerId&invoiceId`
- `PUT /api/payments/:id/allocate`
- `POST /api/payments/:id/cancel`

## Rules
- Allocation cannot exceed payment amount; must reference existing unpaid invoice(s).