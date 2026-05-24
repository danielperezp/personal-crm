# Module: Bills

## Purpose
Manage recurring bills (rent, insurance, subscriptions that are fixed). Track payment status and due dates. Unlike the Subscriptions module, bills represent expenses with a fixed schedule but not necessarily tied to a service.

## Aggregate: Bill
- Attributes: name, amount, dueDay, frequency (monthly, yearly), category, autoPay, nextDueDate, isActive

## Commands
- `CreateBill`
- `UpdateBill`
- `PayBill` (record payment, create spending record)
- `SkipBill` (skip one occurrence)
- `DeactivateBill`

## Events
- `BillCreated`, `BillUpdated`, `BillPaid`, `BillSkipped`, `BillDeactivated`

## Projections
- `bills` collection, plus upcoming bill calendar view.

## API
- `POST /api/bills`
- `GET /api/bills`
- `PUT /api/bills/:id`
- `POST /api/bills/:id/pay`
- `POST /api/bills/:id/skip`
- `DELETE /api/bills/:id`

## Automation
- Scheduled Cloud Function checks `bills` projection for due bills and optionally auto‑creates a spending record if autoPay is enabled, or sends a reminder.