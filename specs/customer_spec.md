# Module: Customers

## Purpose
Manage customer contacts (individuals or companies). Customers are linked to invoices, orders, and payments.

## Aggregate: Customer
- Attributes: customerId, userId, name, email, phone, address, type (individual/company), notes, tags, createdAt, updatedAt, isArchived

## Commands
- `CreateCustomer`
- `UpdateCustomer`
- `ArchiveCustomer`
- `RestoreCustomer`

## Events
- `CustomerCreated`, `CustomerUpdated`, `CustomerArchived`, `CustomerRestored`

## Projections
- `customers` collection: id = customerId, fields mirror aggregate state plus computed fields: openInvoiceCount, totalRevenue (these are updated by separate handlers when invoices/payments change, or could be lazy-computed)
- `customerSearch` index for auto‑complete

## API
- `POST /api/customers`
- `GET /api/customers?search&page`
- `GET /api/customers/:id`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id` (soft archive), `POST /api/customers/:id/restore`

## Rules
- A customer cannot be deleted if there are non‑archived invoices or orders (domain validation).