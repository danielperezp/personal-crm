# Module 04 — Expenses

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Expenses
> **Bounded Context:** Financial Context
> **Phase:** 3 (Weeks 9–12)
> **Status:** Draft

---

## 1. Overview

The Expenses module tracks all outgoing money — every purchase, fee, cost, or expenditure. Expenses can be categorized, linked to receipts and bills, allocated to projects, and flagged as tax-deductible. This module feeds the cash flow projection, expense breakdown charts, and project budget tracking.

---

## 2. Aggregate: `Expense`

```
Expense (Aggregate Root)
├── expenseId: ExpenseId
├── category: ExpenseCategory
├── vendor?: string
├── description: string
├── amount: Money
├── currency: CurrencyCode
├── receiptId?: ReceiptId
├── billId?: BillId
├── projectId?: ProjectId
├── date: Timestamp
├── isDeductible: boolean
├── tags: Tag[]
├── status: ExpenseStatus            // Pending | Approved | Rejected | Reimbursed
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Amount must be > 0.
- Cannot reject an already-approved expense.
- Cannot reimburse an expense that is not approved.
- Description must be non-empty.
- If linked to a project, project must exist and not be Cancelled.

### Enums

```typescript
type ExpenseCategory =
  | 'Office' | 'Travel' | 'Software' | 'Hardware' | 'Marketing'
  | 'Professional' | 'Insurance' | 'Utilities' | 'Meals'
  | 'Shipping' | 'Taxes' | 'Maintenance' | 'Other';

type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `ExpenseRecorded` | `{ expenseId, category, vendor?, description, amount, currency, date, isDeductible, tags }` |
| `ExpenseCategorized` | `{ from, to }` |
| `ExpenseApproved` | `{ approvedBy }` |
| `ExpenseRejected` | `{ reason, rejectedBy }` |
| `ExpenseReimbursed` | `{ reimbursedAt }` |
| `ExpenseLinkedToReceipt` | `{ receiptId }` |
| `ExpenseLinkedToBill` | `{ billId }` |
| `ExpenseAllocatedToProject` | `{ projectId }` |
| `ExpenseDeallocatedFromProject` | `{ projectId }` |
| `ExpenseTagged` | `{ tag }` |
| `ExpenseUpdated` | `{ changes }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `ExpenseRecorded` | Cash Flow Projection | Record outflow |
| `ExpenseRecorded` | Monthly Financial Summary | Add to costs |
| `ExpenseAllocatedToProject` | Project Budget Projection | Increment project spend |
| `ExpenseRecorded` | Expense By Category Projection | Update breakdown |

---

## 4. Commands

| Command | Payload | Validation |
|---|---|---|
| `RecordExpense` | `{ category, vendor?, description, amount, currency, date, isDeductible?, tags?, receiptId?, billId?, projectId? }` | amount > 0; description non-empty |
| `UpdateExpense` | `{ expenseId, changes }` | Expense is Pending |
| `CategorizeExpense` | `{ expenseId, category }` | Valid category |
| `ApproveExpense` | `{ expenseId }` | Status is Pending |
| `RejectExpense` | `{ expenseId, reason }` | Status is Pending |
| `ReimburseExpense` | `{ expenseId }` | Status is Approved |
| `LinkExpenseToReceipt` | `{ expenseId, receiptId }` | Receipt exists |
| `LinkExpenseToBill` | `{ expenseId, billId }` | Bill exists |
| `AllocateExpenseToProject` | `{ expenseId, projectId }` | Project exists and not Cancelled |
| `DeallocateExpenseFromProject` | `{ expenseId }` | Currently allocated |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetExpenseList` | `PaginatedResult<ExpenseListDTO>` — filters: category, status, dateRange, vendor, projectId, isDeductible |
| `GetExpenseDetail` | `ExpenseDetailDTO` |
| `GetExpensesByCategory` | `{ category, total, count }[]` — for breakdown chart |
| `GetExpensesByProject` | `ExpenseListDTO[]` |
| `GetDeductibleExpenses` | `PaginatedResult<ExpenseListDTO>` — for tax season |
| `GetMonthlyExpenseTrend` | `{ month, total }[]` |

---

## 6. Read Model: `rm_expenses`

```typescript
interface ExpenseListReadModel {
  id: string;
  category: ExpenseCategory;
  vendor?: string;
  description: string;
  amount: number;
  currency: string;
  date: number;
  status: ExpenseStatus;
  isDeductible: boolean;
  tags: string[];
  receiptId?: string;
  hasReceipt: boolean;
  billId?: string;
  projectId?: string;
  projectName?: string;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/expenses/commands/RecordExpense
POST   /api/v1/expenses/commands/UpdateExpense
POST   /api/v1/expenses/commands/CategorizeExpense
POST   /api/v1/expenses/commands/ApproveExpense
POST   /api/v1/expenses/commands/RejectExpense
POST   /api/v1/expenses/commands/LinkExpenseToReceipt
POST   /api/v1/expenses/commands/AllocateExpenseToProject

GET    /api/v1/expenses
GET    /api/v1/expenses/:id
GET    /api/v1/expenses/:id/events
GET    /api/v1/expenses/by-category
GET    /api/v1/expenses/by-project/:projectId
GET    /api/v1/expenses/deductible
GET    /api/v1/expenses/trend
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/expenses` | `ExpenseListPage` — table + category breakdown chart |

### Key Components

- `ExpenseTable.tsx` — DataTable with category icons, receipt indicator
- `RecordExpenseDialog.tsx` — Modal form with category select, project link, receipt upload
- `ExpenseCategoryChart.tsx` — Recharts pie/bar chart by category
- `ExpenseTrendChart.tsx` — Monthly trend line chart
- `ExpenseFilters.tsx` — Category, status, date range, deductible toggle

---

## 9. Acceptance Criteria

- [ ] Can record an expense with category, amount, vendor, description
- [ ] Can link expense to receipt, bill, and/or project
- [ ] Approve/reject workflow transitions correctly
- [ ] Category breakdown chart renders from projection data
- [ ] Monthly trend shows expense over time
- [ ] Deductible filter isolates tax-deductible expenses
- [ ] Project allocation updates project budget projection
- [ ] All transitions produce domain events

---

## 10. File Manifest

```
server/src/domain/expense/Expense.ts
server/src/domain/expense/Expense.events.ts
server/src/domain/expense/Expense.errors.ts
server/src/domain/expense/IExpenseRepository.ts
server/src/application/commands/handlers/expense/*
server/src/application/queries/handlers/expense/*
server/src/application/dto/ExpenseDTO.ts
server/src/infrastructure/projections/ExpenseListProjection.ts
server/src/infrastructure/projections/ExpenseByCategoryProjection.ts
server/src/infrastructure/http/routes/expenseRoutes.ts
server/src/infrastructure/http/controllers/ExpenseController.ts
client/src/features/expenses/**
```
