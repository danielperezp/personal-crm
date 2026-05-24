# Module 06 — Bills

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Bills
> **Bounded Context:** Financial Context
> **Phase:** 3 (Weeks 9–12)
> **Status:** Draft

---

## 1. Overview

The Bills module tracks money owed to vendors and service providers — both one-time and recurring. Bills have due dates, recurrence schedules, overdue detection, and auto-linking to expenses when paid. This module powers the "Bills Due" widget on the dashboard and feeds cash flow forecasting.

---

## 2. Aggregate: `Bill`

```
Bill (Aggregate Root)
├── billId: BillId
├── vendor: string
├── description: string
├── amount: Money
├── currency: CurrencyCode
├── frequency: BillingFrequency      // OneTime | Monthly | Quarterly | Annual
├── dueDate: Timestamp
├── autoPay: boolean
├── status: BillStatus               // Upcoming | Due | Paid | Overdue | Cancelled
├── linkedExpenses: ExpenseId[]
├── category: ExpenseCategory
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Recurring bills must have frequency ≠ OneTime.
- Cannot cancel a bill that has linked paid expenses in the current cycle.
- Due date must be a future date on creation.
- Amount must be > 0.

### Enums

```typescript
type BillingFrequency = 'OneTime' | 'Monthly' | 'Quarterly' | 'Annual';
type BillStatus = 'Upcoming' | 'Due' | 'Paid' | 'Overdue' | 'Cancelled';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `BillCreated` | `{ billId, vendor, description, amount, currency, frequency, dueDate, autoPay, category }` |
| `BillUpdated` | `{ changes }` |
| `BillDueReminder` | `{ daysUntilDue }` |
| `BillMarkedDue` | `{}` — status transitions when dueDate is today |
| `BillPaid` | `{ paidAt, expenseId }` |
| `BillOverdue` | `{ daysPastDue }` |
| `BillCancelled` | `{ reason? }` |
| `BillRecurrenceTriggered` | `{ nextDueDate, newBillId }` — creates next cycle bill |
| `BillExpenseLinked` | `{ expenseId }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `BillCreated` | Cash Flow Projection | Forecast future outflow |
| `BillPaid` | Cash Flow Projection | Record actual outflow |
| `BillOverdue` | Dashboard KPI | Increment overdue bills count |
| `BillRecurrenceTriggered` | Self | Creates new Bill aggregate for next cycle |

---

## 4. Commands

| Command | Payload |
|---|---|
| `CreateBill` | `{ vendor, description, amount, currency, frequency, dueDate, autoPay?, category }` |
| `UpdateBill` | `{ billId, changes }` |
| `MarkBillPaid` | `{ billId, expenseId? }` |
| `CancelBill` | `{ billId, reason? }` |
| `TriggerBillRecurrence` | `{ billId }` — system command from Cloud Function |
| `FlagBillOverdue` | `{ billId }` — system command |
| `FlagBillDue` | `{ billId }` — system command |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetBillList` | `PaginatedResult<BillListDTO>` — filters: status, frequency, category, vendor, dateRange |
| `GetBillDetail` | `BillDetailDTO` |
| `GetBillsDueThisWeek` | `BillListDTO[]` |
| `GetOverdueBills` | `BillListDTO[]` |
| `GetBillsByVendor` | `BillListDTO[]` |
| `GetRecurringBillsSummary` | `{ totalMonthly, totalQuarterly, totalAnnual }` |

---

## 6. Read Model: `rm_bills`

```typescript
interface BillListReadModel {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  currency: string;
  frequency: BillingFrequency;
  dueDate: number;
  autoPay: boolean;
  status: BillStatus;
  category: ExpenseCategory;
  linkedExpenseCount: number;
  notes?: string;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/bills/commands/CreateBill
POST   /api/v1/bills/commands/UpdateBill
POST   /api/v1/bills/commands/MarkBillPaid
POST   /api/v1/bills/commands/CancelBill

GET    /api/v1/bills
GET    /api/v1/bills/:id
GET    /api/v1/bills/:id/events
GET    /api/v1/bills/due-this-week
GET    /api/v1/bills/overdue
GET    /api/v1/bills/recurring-summary
```

---

## 8. Scheduled Cloud Functions

```typescript
// Daily at 06:00 UTC
// 1. Query rm_bills where status = 'Upcoming' AND dueDate = today → FlagBillDue
// 2. Query rm_bills where status = 'Due' AND dueDate < today → FlagBillOverdue
// 3. Query rm_bills where status = 'Paid' AND frequency ≠ 'OneTime'
//    AND nextDueDate is approaching → TriggerBillRecurrence
```

---

## 9. Frontend

### Pages

| Route | Page |
|---|---|
| `/bills` | `BillListPage` — table with calendar-style due date view option |

### Key Components

- `BillTable.tsx` — DataTable with due date countdown, status badges
- `CreateBillDialog.tsx` — Modal with frequency selector, category, auto-pay toggle
- `BillDueCalendar.tsx` — Mini calendar showing bill due dates
- `BillRecurringSummary.tsx` — Card showing total monthly recurring costs
- `BillOverdueAlert.tsx` — Alert banner for overdue bills

---

## 10. Acceptance Criteria

- [ ] Can create one-time and recurring bills
- [ ] Due date detection transitions Upcoming → Due → Overdue
- [ ] Recurring bills auto-generate next cycle via Cloud Function
- [ ] Can mark bill as paid, optionally linking to expense
- [ ] Bills due this week and overdue views work correctly
- [ ] Recurring summary shows total monthly/quarterly/annual costs
- [ ] All transitions produce domain events

---

## 11. File Manifest

```
server/src/domain/bill/Bill.ts
server/src/domain/bill/Bill.events.ts
server/src/domain/bill/Bill.errors.ts
server/src/domain/bill/IBillRepository.ts
server/src/application/commands/handlers/bill/*
server/src/application/queries/handlers/bill/*
server/src/application/dto/BillDTO.ts
server/src/application/events/reactors/BillRecurrenceReactor.ts
server/src/infrastructure/projections/BillListProjection.ts
server/src/infrastructure/http/routes/billRoutes.ts
server/src/infrastructure/http/controllers/BillController.ts
functions/src/billScheduledJobs.ts
client/src/features/bills/**
```
