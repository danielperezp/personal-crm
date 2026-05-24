# Module: Spendings (Expenses)

## Purpose
Log personal or business expenses. Categorize spending for analysis.

## Aggregate: Spending
- Attributes: description, amount, category, date, paymentMethod, vendor, isReimbursable, tags, receiptIds[] (linked receipts)
- Status: pending, cleared

## Commands
- `RecordSpending`
- `AttachReceipt`
- `UpdateSpending`
- `ClearSpending` (mark as cleared/reconciled)
- `DeleteSpending` (soft)

## Events
- `SpendingRecorded`, `SpendingUpdated`, `ReceiptAttachedToSpending`, `SpendingCleared`, `SpendingDeleted`

## Projections
- `spendings` collection
- Aggregated views: spending by category, month (for charts)

## API
- `POST /api/spendings`
- `GET /api/spendings?category&dateRange&page`
- `PUT /api/spendings/:id`
- `POST /api/spendings/:id/attach-receipt`