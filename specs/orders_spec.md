# Module: Orders (Customer Sales Orders)

## Purpose
Manage customer purchase orders before invoicing. Convert orders to invoices.

## Aggregate: Order
- Attributes: customerId, orderItems[], status (draft, confirmed, fulfilled, invoiced, cancelled), total, notes

## Commands
- `CreateOrder`
- `UpdateOrder`
- `ConfirmOrder`
- `FulfillOrder`
- `GenerateInvoiceFromOrder` (creates invoice based on order)
- `CancelOrder`

## Events
- `OrderCreated`, `OrderUpdated`, `OrderConfirmed`, `OrderFulfilled`, `InvoiceGeneratedFromOrder`, `OrderCancelled`

## Projections
- `orders` collection

## API
- `POST /api/orders`
- `GET /api/orders`
- `PUT /api/orders/:id`
- `POST /api/orders/:id/confirm`
- `POST /api/orders/:id/fulfill`
- `POST /api/orders/:id/generate-invoice`