# Tasks — Module 09: Orders

> **Phase:** 2 (Weeks 5–8)
> **Dependencies:** Module 00 (Foundation), Module 01 (Customers)
> **Estimated Tasks:** 32

---

## 1. Domain Layer

- [ ] T-0416: Implement `OrderItem` entity — `orderItemId`, `name`, `quantity`, `unitPrice`, `status`
- [ ] T-0417: Implement `Order` aggregate root — `Order.place(props)`, `when()` handler
- [ ] T-0418: Implement `Order.place()` — validate ≥ 1 item, customer exists (from handler), compute total, emit `OrderPlaced`
- [ ] T-0419: Implement `Order.confirm()` — validate Pending, emit `OrderConfirmed`
- [ ] T-0420: Implement `Order.updateItemStatus(orderItemId, newStatus)` — validate item exists, emit `OrderItemStatusChanged`
- [ ] T-0421: Implement `Order.ship(trackingNumber?)` — validate Confirmed or InProgress, emit `OrderShipped`
- [ ] T-0422: Implement `Order.deliver()` — validate Shipped, emit `OrderDelivered`
- [ ] T-0423: Implement `Order.cancel(reason?)` — validate not Delivered, emit `OrderCancelled`
- [ ] T-0424: Implement `Order.linkToInvoice(invoiceId)` — emit `OrderInvoiceLinked`
- [ ] T-0425: Implement total computation from order items
- [ ] T-0426: Define events, errors, repository port
- [ ] T-0427: Write unit tests for Order aggregate — place, confirm, ship, deliver, cancel, state machine violations

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0428: Implement command handlers — Place, Confirm, UpdateItemStatus, Ship, Deliver, Cancel, LinkToInvoice
- [ ] T-0429: Implement `OrderConfirmedReactor` — on `OrderConfirmed`, dispatch `DraftInvoice` command (ACL: translate order → invoice line items)
- [ ] T-0430: Register handlers and reactor
- [ ] T-0431: Implement query handlers — GetOrderList, GetOrderDetail, GetOrdersByCustomer, GetActiveOrders
- [ ] T-0432: Implement Zod schemas — `placeOrderSchema`, `shipOrderSchema`
- [ ] T-0433: Implement `OrderListProjection` — upsert `rm_orders` with denormalized customer name, invoice number
- [ ] T-0434: Register projection
- [ ] T-0435: Implement `OrderController` and `orderRoutes.ts` — 7 command + 5 query endpoints
- [ ] T-0436: Implement `orderApi.ts` and hooks
- [ ] T-0437: Implement `OrderListPage` — DataTable with status pipeline badges
- [ ] T-0438: Implement `OrderTable` — columns: orderId, customer, item count, total, status, invoice link, tracking, actions
- [ ] T-0439: Implement `OrderPipeline` — optional Kanban-style view by status columns
- [ ] T-0440: Implement `PlaceOrderDialog` — multi-item form with customer selector, shipping address
- [ ] T-0441: Implement `OrderDetailPage` — items list + fulfillment timeline + invoice link
- [ ] T-0442: Implement `OrderItemList` — item table with individual status update dropdowns
- [ ] T-0443: Implement `OrderFulfillmentTimeline` — visual timeline of status changes from events
- [ ] T-0444: Implement `OrderActions` — Confirm, Ship, Deliver, Cancel context-sensitive buttons
- [ ] T-0445: Add routes `/orders` and `/orders/:id` to router
- [ ] T-0446: Write integration tests — place, confirm, ship, deliver lifecycle
- [ ] T-0447: Write integration test — cancel triggers refund reactor if payment exists
