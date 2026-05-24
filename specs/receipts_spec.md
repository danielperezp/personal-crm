# Module: Receipts

## Purpose
Store digital receipts (images/PDFs) and link them to expenses or purchases.

## Aggregate: Receipt
- Attributes: fileUrl (Firebase Storage), uploadDate, expenseId (nullable), purchaseId (nullable), ocrData (optional), amount, vendor, date

## Commands
- `UploadReceipt` (with file upload)
- `LinkReceiptToExpense` / `LinkReceiptToPurchase`
- `DeleteReceipt`

## Events
- `ReceiptUploaded`, `ReceiptLinkedToExpense`, `ReceiptLinkedToPurchase`, `ReceiptDeleted`

## Projections
- `receipts` collection, includes thumbnail and download URL

## API
- `POST /api/receipts` (multipart)
- `GET /api/receipts`
- `PUT /api/receipts/:id/link`
- `DELETE /api/receipts/:id`

## Firebase
- Files stored in Firebase Storage with access rules based on user.