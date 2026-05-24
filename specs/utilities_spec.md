# Module: Utilities

## Purpose
Track specific utility bills (electricity, water, gas, internet). Similar to Bills but specialized with meter readings and comparison.

## Aggregate: Utility
- Attributes: type (electricity, water...), provider, accountNumber, meterReading (if applicable), previousReading, consumption, unitPrice, totalAmount, billingPeriod, dueDate, status (unpaid, paid)

## Commands
- `RecordUtilityBill`
- `UpdateMeterReading`
- `PayUtilityBill`
- `DeleteUtilityBill`

## Events
- `UtilityBillRecorded`, `UtilityMeterUpdated`, `UtilityBillPaid`, `UtilityBillDeleted`

## Projections
- `utilities` collection, consumption analytics view.

## API
- `POST /api/utilities`
- `GET /api/utilities?type&period`
- `PUT /api/utilities/:id`
- `POST /api/utilities/:id/pay`