# Tasks — Module 03: Payments

> **Phase:** 2 (Weeks 5–8)
> **Dependencies:** Module 00 (Foundation), Module 02 (Invoices — optional link)
> **Estimated Tasks:** 36

---

## 1. Domain Layer

- [ ] T-0252: Implement `Payment` aggregate root — constructor, `Payment.record(props)` factory
- [ ] T-0253: Implement `Payment.when(event)` state transition handler
- [ ] T-0254: Implement `Payment.record()` — validate amount > 0, if invoiceId check amount ≤ remaining balance (passed from handler), emit `PaymentRecorded`
- [ ] T-0255: Implement `Payment.complete()` — validate Pending, emit `PaymentCompleted`
- [ ] T-0256: Implement `Payment.fail(reason)` — validate Pending, emit `PaymentFailed`
- [ ] T-0257: Implement `Payment.refund(refundAmount, reason?)` — validate Completed, refundAmount ≤ amount, emit `PaymentRefunded` or `PaymentPartiallyRefunded`
- [ ] T-0258: Implement `Payment.reconcile()` — validate Completed and not already reconciled, emit `PaymentReconciled`
- [ ] T-0259: Define `Payment.events.ts` — all event type interfaces
- [ ] T-0260: Define `Payment.errors.ts` — `PaymentExceedsBalanceError`, `PaymentAlreadyCompletedError`, `RefundExceedsPaymentError`, `PaymentAlreadyReconciledError`
- [ ] T-0261: Define `IPaymentRepository` port — `getInvoiceRemainingBalance(invoiceId)`
- [ ] T-0262: Write unit tests for `Payment` aggregate — record, complete, fail, refund, reconcile, invariant violations

---

## 2. Application Layer

- [ ] T-0263: Implement `RecordPaymentHandler` — if invoiceId, check remaining balance, create aggregate, save
- [ ] T-0264: Implement `CompletePaymentHandler` — load, apply, save
- [ ] T-0265: Implement `FailPaymentHandler` — load, apply, save
- [ ] T-0266: Implement `RefundPaymentHandler` — load, apply, save
- [ ] T-0267: Implement `ReconcilePaymentHandler` — load, apply, save
- [ ] T-0268: Implement `PaymentCompletedReactor` — on `PaymentCompleted`, check if linked invoice total is covered → dispatch `MarkInvoicePaid`; also trigger receipt auto-generation
- [ ] T-0269: Register all handlers and reactor
- [ ] T-0270: Define `PaymentLedgerDTO`, `PaymentDetailDTO`
- [ ] T-0271: Implement query handlers — `GetPaymentLedger`, `GetPaymentDetail`, `GetPaymentsByInvoice`, `GetPaymentsByCustomer`, `GetUnreconciledPayments`
- [ ] T-0272: Implement Zod schemas — `recordPaymentSchema`, `refundPaymentSchema`

---

## 3. Infrastructure

- [ ] T-0273: Implement `PaymentLedgerProjection` — subscribe to all Payment events, upsert `rm_payments` with denormalized invoice number and customer name
- [ ] T-0274: Register projection
- [ ] T-0275: Implement `PaymentController` and `paymentRoutes.ts` — 5 command endpoints, 6 query endpoints
- [ ] T-0276: Add validation + permission guards

---

## 4. Frontend

- [ ] T-0277: Implement `paymentApi.ts` — typed Axios calls
- [ ] T-0278: Implement hooks — `usePayments`, `usePaymentDetail`, `useRecordPayment`, `useRefundPayment`, `useReconcilePayment`
- [ ] T-0279: Implement `PaymentLedgerPage` — DataTable with method icons, status badges, reconciliation toggle
- [ ] T-0280: Implement `PaymentTable` — columns: date, amount, method icon, invoice link, customer, status, reconciled
- [ ] T-0281: Implement `RecordPaymentDialog` — modal form with invoice search/select, amount, method, reference
- [ ] T-0282: Implement `PaymentDetailDrawer` — side drawer with full details, refund action
- [ ] T-0283: Implement `ReconciliationToggle` — checkbox to mark as reconciled
- [ ] T-0284: Implement `PaymentMethodIcon` — visual icon per method (Cash, BankTransfer, Card, Crypto, Other)
- [ ] T-0285: Add route `/payments` to router

---

## 5. Testing

- [ ] T-0286: Write integration tests — record, complete, refund, reconcile lifecycle
- [ ] T-0287: Write integration test — payment exceeding invoice balance returns 422
- [ ] T-0288: Write integration test — PaymentCompleted reactor triggers MarkInvoicePaid
