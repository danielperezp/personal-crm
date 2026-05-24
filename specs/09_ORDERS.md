# Module 09 — Orders

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Orders
> **Bounded Context:** Operations Context
> **Phase:** 2 (Weeks 5–8)
> **Status:** Draft

---

## 1. Overview

The Orders module manages customer orders from placement through fulfillment. Orders link to Customers, generate Invoices, and track item-level status through the delivery lifecycle. Cancellation triggers refund flows when payments have already been made.

---

## 2. Aggregate: `Order`

```
Order (Aggregate Root)
├── orderId: OrderId
├── customerId: CustomerId
├── items: OrderItem[]               // Entity
│   ├── orderItemId: string
│   ├── name: string
│   ├── quantity: number
│   ├── unitPrice: Money
│   └── status: OrderItemStatus      // Pending | Processing | Shipped | Delivered | Cancelled
├── total: Money                     // Computed sum of items
├── status: OrderStatus
├── shippingAddress?: Address
├── invoiceId?: InvoiceId
├── trackingNumber?: string
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot ship without Confirmed status.
- Cannot deliver without Shipped status.
- Cancellation triggers refund if payment was made.
- Must have at least one item.
- Cannot modify items after Confirmed status.
- Total is computed — never set directly.

### Enums

```typescript
type OrderStatus = 'Pending' | 'Confirmed' | 'InProgress' | 'Shipped' | 'Delivered' | 'Cancelled';
type OrderItemStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
```

### State Machine

```
Pending → Confirmed → InProgress → Shipped → Delivered
  │          │
  │          └──→ Cancelled
  └──→ Cancelled
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `OrderPlaced` | `{ orderId, customerId, items, shippingAddress?, notes? }` |
| `OrderConfirmed` | `{ confirmedAt }` |
| `OrderItemStatusChanged` | `{ orderItemId, from, to }` |
| `OrderShipped` | `{ shippedAt, trackingNumber? }` |
| `OrderDelivered` | `{ deliveredAt }` |
| `OrderCancelled` | `{ reason?, cancelledAt }` |
| `OrderInvoiceLinked` | `{ invoiceId }` |
| `OrderUpdated` | `{ changes }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `OrderPlaced` | Customer Detail Projection | Add to customer orders |
| `OrderConfirmed` | Invoice Reactor (ACL) | Auto-generate draft invoice |
| `OrderCancelled` | Payment Module | Trigger refund if paid |
| `OrderDelivered` | Dashboard KPI | Update completed orders count |

---

## 4. Commands

| Command | Payload |
|---|---|
| `PlaceOrder` | `{ customerId, items: { name, quantity, unitPrice }[], shippingAddress?, notes? }` |
| `ConfirmOrder` | `{ orderId }` |
| `UpdateOrderItemStatus` | `{ orderId, orderItemId, newStatus }` |
| `ShipOrder` | `{ orderId, trackingNumber? }` |
| `DeliverOrder` | `{ orderId }` |
| `CancelOrder` | `{ orderId, reason? }` |
| `LinkOrderToInvoice` | `{ orderId, invoiceId }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetOrderList` | `PaginatedResult<OrderListDTO>` — filters: status, customerId, dateRange |
| `GetOrderDetail` | `OrderDetailDTO` |
| `GetOrdersByCustomer` | `OrderListDTO[]` |
| `GetActiveOrders` | `OrderListDTO[]` — Pending, Confirmed, InProgress, Shipped |

---

## 6. Read Model: `rm_orders`

```typescript
interface OrderListReadModel {
  id: string;
  customerId: string;
  customerName: string;
  itemCount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  invoiceId?: string;
  invoiceNumber?: string;
  trackingNumber?: string;
  createdAt: number;
  updatedAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/orders/commands/PlaceOrder
POST   /api/v1/orders/commands/ConfirmOrder
POST   /api/v1/orders/commands/UpdateOrderItemStatus
POST   /api/v1/orders/commands/ShipOrder
POST   /api/v1/orders/commands/DeliverOrder
POST   /api/v1/orders/commands/CancelOrder
POST   /api/v1/orders/commands/LinkOrderToInvoice

GET    /api/v1/orders
GET    /api/v1/orders/:id
GET    /api/v1/orders/:id/events
GET    /api/v1/orders/by-customer/:customerId
GET    /api/v1/orders/active
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/orders` | `OrderListPage` — DataTable with status pipeline view |
| `/orders/:id` | `OrderDetailPage` — Items, fulfillment timeline, invoice link |

### Key Components

- `OrderTable.tsx` — DataTable with status badges, customer link
- `OrderPipeline.tsx` — Kanban-style status columns (optional view)
- `PlaceOrderDialog.tsx` — Multi-item form with customer selector
- `OrderItemList.tsx` — Item table with individual status updates
- `OrderFulfillmentTimeline.tsx` — Visual timeline of status changes
- `OrderActions.tsx` — Confirm, Ship, Deliver, Cancel action buttons

---

## 9. Acceptance Criteria

- [ ] Can place an order with customer, items, and optional shipping address
- [ ] Order total computes correctly from items
- [ ] Status transitions follow the state machine strictly
- [ ] Cannot ship without confirmation
- [ ] Individual item status can be updated independently
- [ ] Confirmed order can auto-generate a draft invoice via reactor
- [ ] Cancellation with existing payment triggers refund flow
- [ ] Order list supports status filtering and customer filtering
- [ ] Detail page shows fulfillment timeline
- [ ] All transitions produce domain events

---

## 10. File Manifest

```
server/src/domain/order/Order.ts
server/src/domain/order/Order.events.ts
server/src/domain/order/Order.errors.ts
server/src/domain/order/IOrderRepository.ts
server/src/domain/order/entities/OrderItem.ts
server/src/application/commands/handlers/order/*
server/src/application/queries/handlers/order/*
server/src/application/dto/OrderDTO.ts
server/src/application/events/reactors/OrderConfirmedReactor.ts
server/src/infrastructure/projections/OrderListProjection.ts
server/src/infrastructure/http/routes/orderRoutes.ts
server/src/infrastructure/http/controllers/OrderController.ts
client/src/features/orders/**
```
