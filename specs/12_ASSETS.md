# Module 12 — Assets

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Assets
> **Bounded Context:** Operations Context
> **Phase:** 4 (Weeks 13–16)
> **Status:** Draft

---

## 1. Overview

The Assets module maintains a registry of all owned assets — equipment, vehicles, property, digital assets, and more. It tracks purchase price, current value, depreciation over time, maintenance history, and disposal/sale events. The depreciation engine runs as a scheduled Cloud Function to automatically update book values.

---

## 2. Aggregate: `Asset`

```
Asset (Aggregate Root)
├── assetId: AssetId
├── name: string
├── category: AssetCategory          // Equipment | Vehicle | Property | Digital | Financial | Other
├── purchaseDate: Timestamp
├── purchasePrice: Money
├── currentValue: Money
├── depreciationMethod?: DepreciationMethod   // StraightLine | DecliningBalance | None
├── usefulLifeYears?: number
├── serialNumber?: string
├── location?: string
├── condition: AssetCondition        // New | Good | Fair | Poor | Disposed
├── status: AssetStatus              // InUse | InStorage | UnderRepair | Disposed | Sold
├── linkedPurchaseId?: PurchaseId
├── maintenanceLog: MaintenanceEntry[]  // Entity
│   ├── entryId: string
│   ├── description: string
│   ├── cost: Money
│   ├── performedAt: Timestamp
│   └── performedBy?: string
├── soldAt?: Timestamp
├── salePrice?: Money
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot sell or dispose an already Disposed/Sold asset.
- Depreciation requires usefulLifeYears > 0 and method ≠ None.
- currentValue cannot be negative.
- purchasePrice must be > 0.
- Sale price must be ≥ 0.

### Enums

```typescript
type AssetCategory = 'Equipment' | 'Vehicle' | 'Property' | 'Digital' | 'Financial' | 'Other';
type DepreciationMethod = 'StraightLine' | 'DecliningBalance' | 'None';
type AssetCondition = 'New' | 'Good' | 'Fair' | 'Poor' | 'Disposed';
type AssetStatus = 'InUse' | 'InStorage' | 'UnderRepair' | 'Disposed' | 'Sold';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `AssetRegistered` | `{ assetId, name, category, purchaseDate, purchasePrice, depreciationMethod?, usefulLifeYears?, serialNumber?, location?, linkedPurchaseId? }` |
| `AssetUpdated` | `{ changes }` |
| `AssetValueUpdated` | `{ oldValue, newValue, reason }` |
| `AssetDepreciated` | `{ depreciationAmount, newValue, period }` |
| `AssetConditionChanged` | `{ from, to }` |
| `AssetStatusChanged` | `{ from, to }` |
| `AssetMaintenanceLogged` | `{ entryId, description, cost, performedAt, performedBy? }` |
| `AssetDisposed` | `{ disposedAt, reason? }` |
| `AssetSold` | `{ soldAt, salePrice, realizedGainLoss }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `AssetMaintenanceLogged` | Expense Reactor | Auto-create expense for maintenance cost |
| `AssetSold` | Payment Reactor | Record incoming payment if sale price > 0 |
| `AssetDepreciated` | Monthly Financial Summary | Track depreciation costs |

---

## 4. Commands

| Command | Payload |
|---|---|
| `RegisterAsset` | `{ name, category, purchaseDate, purchasePrice, currency, depreciationMethod?, usefulLifeYears?, serialNumber?, location?, linkedPurchaseId?, notes? }` |
| `UpdateAsset` | `{ assetId, changes }` |
| `UpdateAssetValue` | `{ assetId, newValue, reason }` |
| `DepreciateAsset` | `{ assetId, amount, period }` — system command |
| `ChangeAssetCondition` | `{ assetId, newCondition }` |
| `ChangeAssetStatus` | `{ assetId, newStatus }` |
| `LogMaintenance` | `{ assetId, description, cost, currency, performedAt, performedBy? }` |
| `DisposeAsset` | `{ assetId, reason? }` |
| `SellAsset` | `{ assetId, salePrice, currency }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetAssetList` | `PaginatedResult<AssetListDTO>` — filters: category, status, condition |
| `GetAssetDetail` | `AssetDetailDTO` — includes maintenance log, depreciation history |
| `GetAssetsByCategory` | `{ category, count, totalValue }[]` |
| `GetAssetDepreciationSchedule` | `{ period, bookValue }[]` — for a specific asset |
| `GetTotalAssetValue` | `{ totalPurchasePrice, totalCurrentValue, totalDepreciation }` |

---

## 6. Read Model: `rm_assets`

```typescript
interface AssetListReadModel {
  id: string;
  name: string;
  category: AssetCategory;
  purchaseDate: number;
  purchasePrice: number;
  currentValue: number;
  currency: string;
  depreciationMethod?: DepreciationMethod;
  condition: AssetCondition;
  status: AssetStatus;
  serialNumber?: string;
  location?: string;
  maintenanceCount: number;
  totalMaintenanceCost: number;
  linkedPurchaseId?: string;
  createdAt: number;
}
```

---

## 7. Depreciation Engine (Cloud Function)

```typescript
// Monthly scheduled function
// For each asset where depreciationMethod ≠ None AND status ∈ [InUse, InStorage, UnderRepair]:
//
// StraightLine:
//   monthlyDepreciation = (purchasePrice - salvageValue) / (usefulLifeYears * 12)
//   newValue = max(0, currentValue - monthlyDepreciation)
//
// DecliningBalance:
//   rate = 2 / usefulLifeYears  (double declining)
//   monthlyDepreciation = currentValue * (rate / 12)
//   newValue = max(0, currentValue - monthlyDepreciation)
//
// Dispatch DepreciateAsset command for each
```

---

## 8. API Endpoints

```
POST   /api/v1/assets/commands/RegisterAsset
POST   /api/v1/assets/commands/UpdateAsset
POST   /api/v1/assets/commands/UpdateAssetValue
POST   /api/v1/assets/commands/LogMaintenance
POST   /api/v1/assets/commands/DisposeAsset
POST   /api/v1/assets/commands/SellAsset
POST   /api/v1/assets/commands/ChangeAssetStatus

GET    /api/v1/assets
GET    /api/v1/assets/:id
GET    /api/v1/assets/:id/depreciation-schedule
GET    /api/v1/assets/:id/events
GET    /api/v1/assets/by-category
GET    /api/v1/assets/total-value
```

---

## 9. Frontend

### Pages

| Route | Page |
|---|---|
| `/assets` | `AssetRegistryPage` — DataTable + category breakdown + total value card |

### Key Components

- `AssetTable.tsx` — DataTable with category icons, condition badge, value
- `RegisterAssetDialog.tsx` — Modal form with depreciation config
- `AssetDetailDrawer.tsx` — Full details, maintenance log, depreciation chart
- `AssetDepreciationChart.tsx` — Recharts line chart showing value over time
- `AssetCategoryBreakdown.tsx` — Pie chart by category
- `AssetMaintenanceLog.tsx` — List of maintenance entries with costs
- `LogMaintenanceDialog.tsx` — Add maintenance entry
- `AssetTotalValueCard.tsx` — Summary: purchase price vs. current value

---

## 10. Acceptance Criteria

- [ ] Can register assets with category, purchase info, depreciation config
- [ ] Depreciation engine runs monthly and correctly computes straight-line and declining balance
- [ ] Current value never drops below zero
- [ ] Can log maintenance entries with costs
- [ ] Maintenance costs auto-create expense entries via reactor
- [ ] Can dispose or sell assets; sale records gain/loss
- [ ] Asset registry shows category breakdown and total portfolio value
- [ ] Depreciation schedule chart shows projected value over time
- [ ] All transitions produce domain events

---

## 11. File Manifest

```
server/src/domain/asset/Asset.ts
server/src/domain/asset/Asset.events.ts
server/src/domain/asset/Asset.errors.ts
server/src/domain/asset/IAssetRepository.ts
server/src/domain/asset/entities/MaintenanceEntry.ts
server/src/domain/asset/services/DepreciationCalculator.ts
server/src/application/commands/handlers/asset/*
server/src/application/queries/handlers/asset/*
server/src/application/dto/AssetDTO.ts
server/src/infrastructure/projections/AssetListProjection.ts
server/src/infrastructure/projections/AssetDepreciationProjection.ts
server/src/infrastructure/http/routes/assetRoutes.ts
server/src/infrastructure/http/controllers/AssetController.ts
functions/src/depreciationScheduledJob.ts
client/src/features/assets/**
```
