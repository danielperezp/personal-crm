# Module 08 — Utilities

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Utilities
> **Bounded Context:** Financial Context
> **Phase:** 3 (Weeks 9–12)
> **Status:** Draft

---

## 1. Overview

The Utilities module tracks household and business utility accounts — electricity, water, gas, internet, phone, and other essential services. It manages provider information, meter readings, bill history linkage, and monthly cost averages. This feeds into expense tracking and cash flow forecasting.

---

## 2. Aggregate: `Utility`

```
Utility (Aggregate Root)
├── utilityId: UtilityId
├── provider: string
├── type: UtilityType                // Electricity | Water | Gas | Internet | Phone | Other
├── accountNumber?: string
├── currentReading?: MeterReading    // Value Object { value, unit, date }
├── monthlyAverage: Money
├── status: UtilityStatus            // Active | Disconnected | Transferred
├── linkedBillIds: BillId[]
├── address?: Address
├── contractEndDate?: Timestamp
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Enums

```typescript
type UtilityType = 'Electricity' | 'Water' | 'Gas' | 'Internet' | 'Phone' | 'Other';
type UtilityStatus = 'Active' | 'Disconnected' | 'Transferred';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `UtilityRegistered` | `{ utilityId, provider, type, accountNumber?, monthlyAverage, address? }` |
| `UtilityUpdated` | `{ changes }` |
| `UtilityReadingRecorded` | `{ value, unit, date }` |
| `UtilityBillLinked` | `{ billId }` |
| `UtilityDisconnected` | `{ reason?, disconnectedAt }` |
| `UtilityTransferred` | `{ newProvider?, transferredAt }` |
| `UtilityReactivated` | `{}` |

---

## 4. Commands

| Command | Payload |
|---|---|
| `RegisterUtility` | `{ provider, type, accountNumber?, monthlyAverage, currency, address?, contractEndDate?, notes? }` |
| `UpdateUtility` | `{ utilityId, changes }` |
| `RecordUtilityReading` | `{ utilityId, value, unit, date }` |
| `LinkUtilityBill` | `{ utilityId, billId }` |
| `DisconnectUtility` | `{ utilityId, reason? }` |
| `TransferUtility` | `{ utilityId, newProvider? }` |
| `ReactivateUtility` | `{ utilityId }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetUtilityList` | `PaginatedResult<UtilityListDTO>` — filters: type, status |
| `GetUtilityDetail` | `UtilityDetailDTO` — includes reading history + linked bills |
| `GetUtilityCostSummary` | `{ type, monthlyAverage, totalMonthly }[]` |
| `GetUtilityReadingHistory` | `MeterReading[]` — for a specific utility |

---

## 6. Read Model: `rm_utilities`

```typescript
interface UtilityListReadModel {
  id: string;
  provider: string;
  type: UtilityType;
  accountNumber?: string;
  monthlyAverage: number;
  currency: string;
  status: UtilityStatus;
  lastReading?: { value: number; unit: string; date: number };
  linkedBillCount: number;
  contractEndDate?: number;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/utilities/commands/RegisterUtility
POST   /api/v1/utilities/commands/UpdateUtility
POST   /api/v1/utilities/commands/RecordUtilityReading
POST   /api/v1/utilities/commands/LinkUtilityBill
POST   /api/v1/utilities/commands/DisconnectUtility

GET    /api/v1/utilities
GET    /api/v1/utilities/:id
GET    /api/v1/utilities/:id/events
GET    /api/v1/utilities/:id/readings
GET    /api/v1/utilities/cost-summary
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/utilities` | `UtilityListPage` — card grid grouped by type |

### Key Components

- `UtilityCard.tsx` — Type icon, provider, monthly average, status, last reading
- `UtilityCostSummary.tsx` — Total monthly utility costs by type
- `RegisterUtilityDialog.tsx` — Modal form
- `UtilityReadingForm.tsx` — Record new meter reading
- `UtilityReadingChart.tsx` — Recharts line chart of readings over time

---

## 9. Acceptance Criteria

- [ ] Can register utility accounts with provider, type, monthly average
- [ ] Can record meter readings with value, unit, date
- [ ] Can link utility to bills
- [ ] Cost summary correctly totals monthly averages by type
- [ ] Reading history chart renders over time
- [ ] Can disconnect/transfer/reactivate utilities
- [ ] All transitions produce domain events

---

## 10. File Manifest

```
server/src/domain/utility/Utility.ts
server/src/domain/utility/Utility.events.ts
server/src/domain/utility/Utility.errors.ts
server/src/domain/utility/IUtilityRepository.ts
server/src/domain/utility/vo/MeterReading.ts
server/src/application/commands/handlers/utility/*
server/src/application/queries/handlers/utility/*
server/src/application/dto/UtilityDTO.ts
server/src/infrastructure/projections/UtilityListProjection.ts
server/src/infrastructure/http/routes/utilityRoutes.ts
server/src/infrastructure/http/controllers/UtilityController.ts
client/src/features/utilities/**
```
