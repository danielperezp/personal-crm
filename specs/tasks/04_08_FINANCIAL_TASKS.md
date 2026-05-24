# Tasks — Module 04: Expenses

> **Phase:** 3 (Weeks 9–12)
> **Dependencies:** Module 00, optionally 05 (Receipts), 06 (Bills), 11 (Projects)
> **Estimated Tasks:** 34

---

## 1. Domain Layer

- [ ] T-0289: Implement `Expense` aggregate root — `Expense.record(props)`, `when()` handler
- [ ] T-0290: Implement `Expense.record()` — validate amount > 0, description non-empty, emit `ExpenseRecorded`
- [ ] T-0291: Implement `Expense.categorize(category)` — emit `ExpenseCategorized`
- [ ] T-0292: Implement `Expense.approve()` — validate Pending, emit `ExpenseApproved`
- [ ] T-0293: Implement `Expense.reject(reason)` — validate Pending, emit `ExpenseRejected`
- [ ] T-0294: Implement `Expense.reimburse()` — validate Approved, emit `ExpenseReimbursed`
- [ ] T-0295: Implement `Expense.linkToReceipt(receiptId)` — emit `ExpenseLinkedToReceipt`
- [ ] T-0296: Implement `Expense.linkToBill(billId)` — emit `ExpenseLinkedToBill`
- [ ] T-0297: Implement `Expense.allocateToProject(projectId)` — emit `ExpenseAllocatedToProject`
- [ ] T-0298: Implement `Expense.deallocateFromProject()` — emit `ExpenseDeallocatedFromProject`
- [ ] T-0299: Define events, errors, repository port
- [ ] T-0300: Write unit tests for Expense aggregate

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0301: Implement command handlers — Record, Update, Categorize, Approve, Reject, Reimburse, LinkToReceipt, LinkToBill, AllocateToProject, DeallocateFromProject
- [ ] T-0302: Implement query handlers — GetExpenseList, GetExpenseDetail, GetExpensesByCategory, GetExpensesByProject, GetDeductibleExpenses, GetMonthlyExpenseTrend
- [ ] T-0303: Implement Zod schemas — `recordExpenseSchema`, `updateExpenseSchema`
- [ ] T-0304: Implement `ExpenseListProjection` — subscribe to all Expense events, upsert `rm_expenses`
- [ ] T-0305: Implement `ExpenseByCategoryProjection` — aggregate totals per category
- [ ] T-0306: Register projections
- [ ] T-0307: Implement `ExpenseController` and `expenseRoutes.ts` — all command + query endpoints
- [ ] T-0308: Implement `expenseApi.ts` and hooks — `useExpenses`, `useRecordExpense`, etc.
- [ ] T-0309: Implement `ExpenseListPage` — DataTable with category icons + receipt indicator + trend chart
- [ ] T-0310: Implement `ExpenseTable` — columns: date, vendor, description, amount, category, status, receipt linked, project
- [ ] T-0311: Implement `RecordExpenseDialog` — modal form with category select, project link, receipt upload trigger
- [ ] T-0312: Implement `ExpenseCategoryChart` — Recharts pie/bar by category
- [ ] T-0313: Implement `ExpenseTrendChart` — monthly trend line chart
- [ ] T-0314: Implement `ExpenseFilters` — category, status, date range, deductible toggle, project
- [ ] T-0315: Add route `/expenses` to router
- [ ] T-0316: Write integration tests — record, approve, reject, link, project allocation

---

# Tasks — Module 05: Receipts

> **Phase:** 3 (Weeks 9–12)
> **Dependencies:** Module 00, optionally 03 (Payments), 04 (Expenses)
> **Estimated Tasks:** 24

---

## 1. Domain Layer

- [ ] T-0317: Implement `Receipt` aggregate root — `Receipt.upload(props)`, `when()` handler
- [ ] T-0318: Implement `Receipt.upload()` — validate attachmentUrl, vendor, amount > 0, emit `ReceiptUploaded`
- [ ] T-0319: Implement `Receipt.linkToPayment(paymentId)` — emit `ReceiptLinkedToPayment`
- [ ] T-0320: Implement `Receipt.linkToExpense(expenseId)` — emit `ReceiptLinkedToExpense`
- [ ] T-0321: Implement `Receipt.verify()` — validate has attachment, emit `ReceiptVerified`
- [ ] T-0322: Implement `Receipt.unverify()` — emit `ReceiptUnverified`
- [ ] T-0323: Implement `Receipt.update(changes)` — emit `ReceiptUpdated`
- [ ] T-0324: Implement `Receipt.delete(reason?)` — emit `ReceiptDeleted`
- [ ] T-0325: Define events, errors, repository port
- [ ] T-0326: Write unit tests for Receipt aggregate

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0327: Implement command handlers — Upload (with file storage), LinkToPayment, LinkToExpense, Verify, Unverify, Update, Delete
- [ ] T-0328: Implement multipart upload endpoint — validate file type (JPEG, PNG, PDF), upload to Firebase Storage `receipts/{receiptId}/{fileName}`, return URL
- [ ] T-0329: Implement query handlers — GetReceiptGallery, GetReceiptDetail, GetUnlinkedReceipts, GetReceiptsByPayment, GetReceiptsByExpense
- [ ] T-0330: Implement `ReceiptGalleryProjection` — upsert `rm_receipts`
- [ ] T-0331: Register projection
- [ ] T-0332: Implement `ReceiptController` and `receiptRoutes.ts` — multipart upload + command + query endpoints
- [ ] T-0333: Implement `receiptApi.ts` and hooks
- [ ] T-0334: Implement `ReceiptGalleryPage` — grid/list toggle with thumbnails
- [ ] T-0335: Implement `ReceiptGrid` — image grid with overlay info (vendor, amount, verified badge)
- [ ] T-0336: Implement `ReceiptUploadZone` — drag-and-drop file upload area
- [ ] T-0337: Implement `ReceiptDetailModal` — full-size image + metadata + link-to-payment/expense actions
- [ ] T-0338: Implement `ReceiptLinkSelector` — search and link to payment or expense
- [ ] T-0339: Add route `/receipts` to router
- [ ] T-0340: Write integration tests — upload, link, verify, gallery filtering

---

# Tasks — Module 06: Bills

> **Phase:** 3 (Weeks 9–12)
> **Dependencies:** Module 00, optionally 04 (Expenses)
> **Estimated Tasks:** 28

---

## 1. Domain Layer

- [ ] T-0341: Implement `Bill` aggregate root — `Bill.create(props)`, `when()` handler
- [ ] T-0342: Implement `Bill.create()` — validate amount > 0, dueDate future, frequency rules, emit `BillCreated`
- [ ] T-0343: Implement `Bill.markPaid(expenseId?)` — emit `BillPaid`
- [ ] T-0344: Implement `Bill.cancel(reason?)` — validate no linked paid expenses in current cycle, emit `BillCancelled`
- [ ] T-0345: Implement `Bill.flagDue()` — emit `BillMarkedDue`
- [ ] T-0346: Implement `Bill.flagOverdue(daysPastDue)` — emit `BillOverdue`
- [ ] T-0347: Implement `Bill.triggerRecurrence(nextDueDate, newBillId)` — emit `BillRecurrenceTriggered`
- [ ] T-0348: Define events, errors, repository port
- [ ] T-0349: Write unit tests for Bill aggregate

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0350: Implement command handlers — Create, Update, MarkPaid, Cancel, FlagDue, FlagOverdue, TriggerRecurrence
- [ ] T-0351: Implement `BillRecurrenceReactor` — on `BillPaid` for recurring bill, calculate next due date, dispatch `TriggerRecurrence`
- [ ] T-0352: Implement query handlers — GetBillList, GetBillDetail, GetBillsDueThisWeek, GetOverdueBills, GetRecurringBillsSummary
- [ ] T-0353: Implement `BillListProjection` — upsert `rm_bills`
- [ ] T-0354: Register projection and reactor
- [ ] T-0355: Implement `BillController` and `billRoutes.ts`
- [ ] T-0356: Implement scheduled Cloud Function — daily: flag Due, flag Overdue, trigger recurrence for paid recurring bills
- [ ] T-0357: Deploy Cloud Function
- [ ] T-0358: Implement `billApi.ts` and hooks
- [ ] T-0359: Implement `BillListPage` — DataTable with due date countdown, status badges
- [ ] T-0360: Implement `CreateBillDialog` — frequency selector, category, auto-pay toggle
- [ ] T-0361: Implement `BillDueCalendar` — mini calendar view of upcoming due dates
- [ ] T-0362: Implement `BillRecurringSummary` — total monthly/quarterly/annual recurring costs
- [ ] T-0363: Implement `BillOverdueAlert` — alert banner
- [ ] T-0364: Add route `/bills` to router
- [ ] T-0365: Write integration tests — create, pay, overdue, recurrence lifecycle

---

# Tasks — Module 07: Subscriptions

> **Phase:** 3 (Weeks 9–12)
> **Dependencies:** Module 00, optionally 06 (Bills)
> **Estimated Tasks:** 26

---

## 1. Domain Layer

- [ ] T-0366: Implement `Subscription` aggregate root — `Subscription.start(props)`, `when()` handler
- [ ] T-0367: Implement `Subscription.start()` — validate amount > 0, emit `SubscriptionStarted`
- [ ] T-0368: Implement `Subscription.renew()` — advance nextBillingDate, emit `SubscriptionRenewed`
- [ ] T-0369: Implement `Subscription.pause(reason?)` — validate Active, emit `SubscriptionPaused`
- [ ] T-0370: Implement `Subscription.resume()` — validate Paused, emit `SubscriptionResumed`
- [ ] T-0371: Implement `Subscription.cancel(reason?, effectiveDate?)` — emit `SubscriptionCancelled`
- [ ] T-0372: Implement `Subscription.changePlan(newPlan, newAmount)` — emit `SubscriptionPlanChanged`
- [ ] T-0373: Implement `Subscription.expire()` — emit `SubscriptionExpired`
- [ ] T-0374: Define events, errors, repository port
- [ ] T-0375: Write unit tests for Subscription aggregate

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0376: Implement command handlers — Start, Renew, Pause, Resume, Cancel, ChangePlan, Expire, Update
- [ ] T-0377: Implement `SubscriptionRenewalReactor` — on renewal, optionally create Bill for this cycle
- [ ] T-0378: Implement query handlers — GetSubscriptionList, GetSubscriptionDetail, GetMonthlyBurnRate, GetUpcomingRenewals, GetSubscriptionsByCategory
- [ ] T-0379: Implement `SubscriptionListProjection` — upsert `rm_subscriptions` with computed `monthlyEquivalent`
- [ ] T-0380: Implement `SubscriptionBurnProjection` — aggregate monthly burn by category
- [ ] T-0381: Register projections and reactor
- [ ] T-0382: Implement `SubscriptionController` and `subscriptionRoutes.ts`
- [ ] T-0383: Implement scheduled Cloud Function — daily: auto-renew active subscriptions where nextBillingDate ≤ today, expire non-autoRenew past endDate
- [ ] T-0384: Deploy Cloud Function
- [ ] T-0385: Implement `subscriptionApi.ts` and hooks
- [ ] T-0386: Implement `SubscriptionListPage` — card grid + burn rate summary
- [ ] T-0387: Implement `SubscriptionCard` — provider, plan, amount, next billing, status, category icon
- [ ] T-0388: Implement `BurnRateSummary` — total monthly burn + category breakdown bar chart
- [ ] T-0389: Implement `UpcomingRenewals` — timeline of next 30 days renewals
- [ ] T-0390: Implement `AddSubscriptionDialog` — modal form with billing cycle, category, URL
- [ ] T-0391: Add route `/subscriptions` to router
- [ ] T-0392: Write integration tests — start, renew, pause, resume, cancel, plan change, burn rate

---

# Tasks — Module 08: Utilities

> **Phase:** 3 (Weeks 9–12)
> **Dependencies:** Module 00, optionally 06 (Bills)
> **Estimated Tasks:** 20

---

## 1. Domain Layer

- [ ] T-0393: Implement `MeterReading` value object — `value`, `unit`, `date`
- [ ] T-0394: Implement `Utility` aggregate root — `Utility.register(props)`, `when()` handler
- [ ] T-0395: Implement `Utility.register()` — emit `UtilityRegistered`
- [ ] T-0396: Implement `Utility.recordReading(value, unit, date)` — emit `UtilityReadingRecorded`
- [ ] T-0397: Implement `Utility.linkBill(billId)` — emit `UtilityBillLinked`
- [ ] T-0398: Implement `Utility.disconnect(reason?)` — emit `UtilityDisconnected`
- [ ] T-0399: Implement `Utility.transfer(newProvider?)` — emit `UtilityTransferred`
- [ ] T-0400: Implement `Utility.reactivate()` — emit `UtilityReactivated`
- [ ] T-0401: Define events, errors, repository port
- [ ] T-0402: Write unit tests for Utility aggregate

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0403: Implement command handlers — Register, Update, RecordReading, LinkBill, Disconnect, Transfer, Reactivate
- [ ] T-0404: Implement query handlers — GetUtilityList, GetUtilityDetail, GetUtilityCostSummary, GetUtilityReadingHistory
- [ ] T-0405: Implement `UtilityListProjection` — upsert `rm_utilities`
- [ ] T-0406: Register projection
- [ ] T-0407: Implement `UtilityController` and `utilityRoutes.ts`
- [ ] T-0408: Implement `utilityApi.ts` and hooks
- [ ] T-0409: Implement `UtilityListPage` — card grid grouped by type
- [ ] T-0410: Implement `UtilityCard` — type icon, provider, monthly average, status, last reading
- [ ] T-0411: Implement `UtilityCostSummary` — total monthly utility costs by type
- [ ] T-0412: Implement `UtilityReadingChart` — Recharts line chart of readings over time
- [ ] T-0413: Implement `RegisterUtilityDialog` — modal form with type select, provider, account number
- [ ] T-0414: Add route `/utilities` to router
- [ ] T-0415: Write integration tests — register, record reading, link bill, cost summary
