# Module 10 — Purchases

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Purchases
> **Bounded Context:** Operations Context
> **Phase:** 4 (Weeks 13–16)
> **Status:** Draft

---

## 1. Overview

The Purchases module tracks outgoing purchase orders to vendors — the inverse of Orders. Purchases follow a request → approve → order → receive workflow, link to Expenses for cost tracking, and can be allocated to Projects for budget management.

---

## 2. Aggregate: `Purchase`

```
Purchase (Aggregate Root)
├── purchaseId: PurchaseId
├── vendor: string
├── items: PurchaseItem[]
│   ├── itemId: string
│   ├── name: string
│   ├── quantity: number
│   ├── unitCost: Money
│   └── received: boolean
├── totalCost: Money                 // Computed
├── status: PurchaseStatus           // Requested | Approved | Ordered | Received | Cancelled
├── expenseId?: ExpenseId
├── projectId?: ProjectId
├── expectedDelivery?: Timestamp
├── actualDelivery?: Timestamp
├── purchaseOrderNumber?: string
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Enums

```typescript
type PurchaseStatus = 'Requested' | 'Approved' | 'Ordered' | 'Received' | 'Cancelled';
```

### State Machine

```
Requested → Approved → Ordered → Received
  │            │          │
  │            │          └──→ Cancelled
  │            └──→ Cancelled
  └──→ Cancelled
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `PurchaseRequested` | `{ purchaseId, vendor, items, projectId?, expectedDelivery?, notes? }` |
| `PurchaseApproved` | `{ approvedBy, approvedAt }` |
| `PurchaseOrdered` | `{ orderedAt, purchaseOrderNumber? }` |
| `PurchaseItemReceived` | `{ itemId, receivedAt }` |
| `PurchaseFullyReceived` | `{ receivedAt }` |
| `PurchaseCancelled` | `{ reason?, cancelledAt }` |
| `PurchaseExpenseLinked` | `{ expenseId }` |
| `PurchaseAllocatedToProject` | `{ projectId }` |
| `PurchaseUpdated` | `{ changes }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `PurchaseFullyReceived` | Expense Reactor | Auto-generate expense entry |
| `PurchaseAllocatedToProject` | Project Budget Projection | Increment project spend |
| `PurchaseFullyReceived` | Asset Module | Prompt asset registration if applicable |

---

## 4. Commands

| Command | Payload |
|---|---|
| `RequestPurchase` | `{ vendor, items, projectId?, expectedDelivery?, notes? }` |
| `ApprovePurchase` | `{ purchaseId }` |
| `OrderPurchase` | `{ purchaseId, purchaseOrderNumber? }` |
| `ReceivePurchaseItem` | `{ purchaseId, itemId }` |
| `ReceiveAllPurchaseItems` | `{ purchaseId }` |
| `CancelPurchase` | `{ purchaseId, reason? }` |
| `LinkPurchaseToExpense` | `{ purchaseId, expenseId }` |
| `AllocatePurchaseToProject` | `{ purchaseId, projectId }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetPurchaseList` | `PaginatedResult<PurchaseListDTO>` — filters: status, vendor, projectId, dateRange |
| `GetPurchaseDetail` | `PurchaseDetailDTO` |
| `GetPurchasesByProject` | `PurchaseListDTO[]` |
| `GetPendingApprovals` | `PurchaseListDTO[]` |
| `GetPurchasesByVendor` | `PurchaseListDTO[]` |

---

## 6. Read Model: `rm_purchases`

```typescript
interface PurchaseListReadModel {
  id: string;
  vendor: string;
  itemCount: number;
  receivedItemCount: number;
  totalCost: number;
  currency: string;
  status: PurchaseStatus;
  projectId?: string;
  projectName?: string;
  expenseId?: string;
  expectedDelivery?: number;
  purchaseOrderNumber?: string;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/purchases/commands/RequestPurchase
POST   /api/v1/purchases/commands/ApprovePurchase
POST   /api/v1/purchases/commands/OrderPurchase
POST   /api/v1/purchases/commands/ReceivePurchaseItem
POST   /api/v1/purchases/commands/CancelPurchase
POST   /api/v1/purchases/commands/AllocatePurchaseToProject

GET    /api/v1/purchases
GET    /api/v1/purchases/:id
GET    /api/v1/purchases/:id/events
GET    /api/v1/purchases/pending-approvals
GET    /api/v1/purchases/by-project/:projectId
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/purchases` | `PurchaseListPage` — DataTable with status pipeline |

### Key Components

- `PurchaseTable.tsx` — Status badges, vendor, item count, delivery progress
- `RequestPurchaseDialog.tsx` — Multi-item form with vendor and project selector
- `PurchaseDetailDrawer.tsx` — Item-level receiving, status actions
- `PurchaseReceivingChecklist.tsx` — Check off received items individually
- `PendingApprovalsCard.tsx` — Dashboard widget for pending approvals

---

## 9. Acceptance Criteria

- [ ] Can request a purchase with vendor, items, optional project allocation
- [ ] Approve → Order → Receive workflow transitions correctly
- [ ] Individual items can be marked as received
- [ ] Purchase automatically moves to Received when all items are received
- [ ] Can link to expense and project
- [ ] Pending approvals view works
- [ ] Cancellation from any pre-Received status works
- [ ] All transitions produce domain events

---

## 10. File Manifest

```
server/src/domain/purchase/Purchase.ts
server/src/domain/purchase/Purchase.events.ts
server/src/domain/purchase/Purchase.errors.ts
server/src/domain/purchase/IPurchaseRepository.ts
server/src/domain/purchase/entities/PurchaseItem.ts
server/src/application/commands/handlers/purchase/*
server/src/application/queries/handlers/purchase/*
server/src/application/dto/PurchaseDTO.ts
server/src/infrastructure/projections/PurchaseListProjection.ts
server/src/infrastructure/http/routes/purchaseRoutes.ts
server/src/infrastructure/http/controllers/PurchaseController.ts
client/src/features/purchases/**
```
