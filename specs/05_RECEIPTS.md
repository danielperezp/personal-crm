# Module 05 — Receipts

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Receipts
> **Bounded Context:** Financial Context
> **Phase:** 3 (Weeks 9–12)
> **Status:** Draft

---

## 1. Overview

The Receipts module manages proof-of-transaction documents — both uploaded receipt images/PDFs and system-generated receipts from completed payments. Receipts link to Payments and Expenses, providing a verifiable audit trail for every financial transaction. V2 will add OCR for automatic data extraction.

---

## 2. Aggregate: `Receipt`

```
Receipt (Aggregate Root)
├── receiptId: ReceiptId
├── paymentId?: PaymentId
├── expenseId?: ExpenseId
├── vendor: string
├── amount: Money
├── date: Timestamp
├── attachmentUrl: string            // Firebase Storage path
├── attachmentFileName: string
├── ocrData?: OcrExtraction          // V2 — extracted text/fields
├── verified: boolean
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Must have an attachment URL (image or PDF).
- Vendor and amount are required.
- Cannot verify a receipt that has no attachment.
- Cannot link to both a payment AND an expense that are unrelated (they must share the same transaction context, enforced at application layer).

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `ReceiptUploaded` | `{ receiptId, vendor, amount, date, attachmentUrl, attachmentFileName }` |
| `ReceiptLinkedToPayment` | `{ paymentId }` |
| `ReceiptLinkedToExpense` | `{ expenseId }` |
| `ReceiptVerified` | `{ verifiedBy }` |
| `ReceiptUnverified` | `{}` |
| `ReceiptOcrProcessed` | `{ extractedData: OcrExtraction }` |
| `ReceiptUpdated` | `{ changes }` |
| `ReceiptDeleted` | `{ reason? }` |

---

## 4. Commands

| Command | Payload | Validation |
|---|---|---|
| `UploadReceipt` | `{ vendor, amount, currency, date, file: Buffer, fileName, contentType }` | File is image or PDF; amount > 0 |
| `LinkReceiptToPayment` | `{ receiptId, paymentId }` | Both exist |
| `LinkReceiptToExpense` | `{ receiptId, expenseId }` | Both exist |
| `VerifyReceipt` | `{ receiptId }` | Has attachment |
| `UnverifyReceipt` | `{ receiptId }` | Currently verified |
| `UpdateReceipt` | `{ receiptId, changes: { vendor?, amount?, date?, notes? } }` | Receipt exists |
| `DeleteReceipt` | `{ receiptId, reason? }` | Receipt exists |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetReceiptGallery` | `PaginatedResult<ReceiptGalleryDTO>` — filters: dateRange, vendor, verified, linked/unlinked |
| `GetReceiptDetail` | `ReceiptDetailDTO` |
| `GetUnlinkedReceipts` | `ReceiptGalleryDTO[]` — receipts not linked to any payment or expense |
| `GetReceiptsByPayment` | `ReceiptGalleryDTO[]` |
| `GetReceiptsByExpense` | `ReceiptGalleryDTO[]` |

---

## 6. Read Model: `rm_receipts`

```typescript
interface ReceiptGalleryReadModel {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  date: number;
  attachmentUrl: string;
  thumbnailUrl?: string;
  verified: boolean;
  paymentId?: string;
  expenseId?: string;
  isLinked: boolean;
  notes?: string;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/receipts/upload                       → Multipart file upload
POST   /api/v1/receipts/commands/LinkReceiptToPayment
POST   /api/v1/receipts/commands/LinkReceiptToExpense
POST   /api/v1/receipts/commands/VerifyReceipt
POST   /api/v1/receipts/commands/UpdateReceipt
POST   /api/v1/receipts/commands/DeleteReceipt

GET    /api/v1/receipts                              → Gallery view
GET    /api/v1/receipts/:id
GET    /api/v1/receipts/:id/events
GET    /api/v1/receipts/unlinked
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/receipts` | `ReceiptGalleryPage` — grid/list toggle with thumbnails |

### Key Components

- `ReceiptGrid.tsx` — Image grid with overlay info (vendor, amount, status)
- `ReceiptUploadZone.tsx` — Drag-and-drop upload area
- `ReceiptDetailModal.tsx` — Full-size image + metadata + link actions
- `ReceiptVerificationBadge.tsx` — Verified/unverified indicator
- `ReceiptLinkSelector.tsx` — Search and link to payment or expense

---

## 9. File Upload Flow

```
[User selects file] → [Frontend validates type/size]
    → POST /api/v1/receipts/upload (multipart/form-data)
    → [Backend] uploads to Firebase Storage: receipts/{receiptId}/{fileName}
    → [Backend] creates ReceiptUploaded event with storage URL
    → [Projection] updates rm_receipts with thumbnailUrl (generated via Cloud Function V2)
```

---

## 10. Acceptance Criteria

- [ ] Can upload receipt image (JPEG, PNG) or PDF with vendor, amount, date
- [ ] File stored in Firebase Cloud Storage with correct path
- [ ] Can link receipt to payment and/or expense
- [ ] Can verify/unverify receipts
- [ ] Gallery view shows thumbnails with filter by verified/unlinked
- [ ] Unlinked receipts view helps match orphaned receipts
- [ ] Detail modal shows full-size image with metadata
- [ ] All transitions produce domain events

---

## 11. File Manifest

```
server/src/domain/receipt/Receipt.ts
server/src/domain/receipt/Receipt.events.ts
server/src/domain/receipt/Receipt.errors.ts
server/src/domain/receipt/IReceiptRepository.ts
server/src/application/commands/handlers/receipt/*
server/src/application/queries/handlers/receipt/*
server/src/application/dto/ReceiptDTO.ts
server/src/infrastructure/projections/ReceiptGalleryProjection.ts
server/src/infrastructure/http/routes/receiptRoutes.ts
server/src/infrastructure/http/controllers/ReceiptController.ts
client/src/features/receipts/**
```
