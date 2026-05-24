# Module: Purchases (Procurement / Supplier Orders)

## Purpose
Manage purchase orders to suppliers, vendors, or for inventory. Different from personal Spendings – represents formal purchase process.

## Aggregate: PurchaseOrder
- Attributes: supplierName, items[], total, status (draft, ordered, received, paid, cancelled), expectedDeliveryDate, notes

## Commands
- `CreatePurchaseOrder`
- `UpdatePurchaseOrder`
- `PlaceOrder`
- `ReceiveOrder`
- `RecordPaymentForPurchase`
- `CancelOrder`

## Events
- `PurchaseOrderCreated`, `PurchaseOrderUpdated`, `PurchaseOrderPlaced`, `PurchaseOrderReceived`, `PaymentForPurchaseRecorded`, `PurchaseOrderCancelled`

## Projections
- `purchases` collection

## API
- `POST /api/purchases`
- `GET /api/purchases`
- `PUT /api/purchases/:id`
- `POST /api/purchases/:id/place`
- `POST /api/purchases/:id/receive`
- `POST /api/purchases/:id/pay`