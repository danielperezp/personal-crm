# Module 13 — Investments

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Investments
> **Bounded Context:** Operations Context
> **Phase:** 4 (Weeks 13–16)
> **Status:** Draft

---

## 1. Overview

The Investments module tracks a personal or business investment portfolio — stocks, bonds, crypto, real estate, business stakes, and funds. It provides P&L tracking (unrealized and realized), portfolio allocation views, and dividend/return recording. Price updates are manual in V1, with external API feeds planned for V2.

---

## 2. Aggregate: `Investment`

```
Investment (Aggregate Root)
├── investmentId: InvestmentId
├── name: string
├── type: InvestmentType             // Stock | Bond | Crypto | RealEstate | Business | Fund | Other
├── platform?: string               // Brokerage, exchange, etc.
├── ticker?: string
├── purchaseDate: Timestamp
├── purchasePrice: Money             // Price per unit at purchase
├── quantity: number
├── currentPrice: Money              // Latest price per unit
├── totalValue: Money                // quantity * currentPrice
├── totalCostBasis: Money            // quantity * purchasePrice
├── unrealizedGain: Money            // totalValue - totalCostBasis
├── status: InvestmentStatus         // Active | Sold | Matured | WrittenOff
├── soldAt?: Timestamp
├── salePrice?: Money                // Price per unit at sale
├── realizedGain?: Money
├── dividends: DividendEntry[]       // Entity
│   ├── dividendId: string
│   ├── amount: Money
│   ├── date: Timestamp
│   └── reinvested: boolean
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot sell an already Sold, Matured, or WrittenOff investment.
- quantity must be > 0.
- purchasePrice must be > 0.
- Cannot record dividends on Sold or WrittenOff investments.
- Realized gain is computed: (salePrice - purchasePrice) * quantity.

### Enums

```typescript
type InvestmentType = 'Stock' | 'Bond' | 'Crypto' | 'RealEstate' | 'Business' | 'Fund' | 'Other';
type InvestmentStatus = 'Active' | 'Sold' | 'Matured' | 'WrittenOff';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `InvestmentAcquired` | `{ investmentId, name, type, platform?, ticker?, purchaseDate, purchasePrice, quantity, currency }` |
| `InvestmentPriceUpdated` | `{ oldPrice, newPrice, source? }` |
| `InvestmentSold` | `{ soldAt, salePrice, quantity, realizedGain }` |
| `InvestmentPartialSold` | `{ soldAt, salePrice, quantitySold, quantityRemaining, realizedGain }` |
| `InvestmentDividendReceived` | `{ dividendId, amount, date, reinvested }` |
| `InvestmentMatured` | `{ maturedAt, finalValue }` |
| `InvestmentWrittenOff` | `{ writtenOffAt, reason }` |
| `InvestmentUpdated` | `{ changes }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `InvestmentSold` | Payment Reactor | Record incoming payment for sale proceeds |
| `InvestmentDividendReceived` | Payment Reactor | Record incoming payment for dividend |
| `InvestmentPriceUpdated` | Dashboard KPI | Update portfolio value |

---

## 4. Commands

| Command | Payload |
|---|---|
| `AcquireInvestment` | `{ name, type, platform?, ticker?, purchaseDate, purchasePrice, quantity, currency, notes? }` |
| `UpdateInvestmentPrice` | `{ investmentId, newPrice, source? }` |
| `SellInvestment` | `{ investmentId, salePrice, quantity? }` — full or partial sale |
| `RecordDividend` | `{ investmentId, amount, currency, date, reinvested? }` |
| `MatureInvestment` | `{ investmentId, finalValue }` |
| `WriteOffInvestment` | `{ investmentId, reason }` |
| `UpdateInvestment` | `{ investmentId, changes }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetInvestmentList` | `PaginatedResult<InvestmentListDTO>` — filters: type, status, platform |
| `GetInvestmentDetail` | `InvestmentDetailDTO` — includes dividend history, price history |
| `GetPortfolioSummary` | `{ totalValue, totalCostBasis, totalUnrealizedGain, totalRealizedGain, totalDividends }` |
| `GetPortfolioAllocation` | `{ type, totalValue, percentage }[]` |
| `GetInvestmentPerformance` | `{ investmentId, priceHistory: { date, price }[] }` |
| `GetDividendHistory` | `DividendEntry[]` — across all investments |

---

## 6. Read Model: `rm_investments`

```typescript
interface InvestmentListReadModel {
  id: string;
  name: string;
  type: InvestmentType;
  platform?: string;
  ticker?: string;
  purchaseDate: number;
  purchasePrice: number;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  totalCostBasis: number;
  unrealizedGain: number;
  unrealizedGainPct: number;        // (unrealizedGain / totalCostBasis) * 100
  currency: string;
  status: InvestmentStatus;
  totalDividends: number;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/investments/commands/AcquireInvestment
POST   /api/v1/investments/commands/UpdateInvestmentPrice
POST   /api/v1/investments/commands/SellInvestment
POST   /api/v1/investments/commands/RecordDividend
POST   /api/v1/investments/commands/WriteOffInvestment
POST   /api/v1/investments/commands/MatureInvestment

GET    /api/v1/investments
GET    /api/v1/investments/:id
GET    /api/v1/investments/:id/events
GET    /api/v1/investments/portfolio-summary
GET    /api/v1/investments/allocation
GET    /api/v1/investments/dividends
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/investments` | `InvestmentPortfolioPage` — table + portfolio summary + allocation chart |

### Key Components

- `InvestmentTable.tsx` — Name, type, cost basis, current value, gain/loss with color coding
- `PortfolioSummaryCard.tsx` — Total value, unrealized P&L, realized P&L, dividends
- `PortfolioAllocationChart.tsx` — Recharts pie chart by investment type
- `AcquireInvestmentDialog.tsx` — Modal form
- `InvestmentDetailDrawer.tsx` — Price history, dividend log, actions
- `UpdatePriceDialog.tsx` — Quick price update form
- `InvestmentGainLossIndicator.tsx` — Green/red P&L display
- `DividendHistoryTable.tsx` — Cross-investment dividend log

---

## 9. Acceptance Criteria

- [ ] Can acquire investments with type, price, quantity, platform
- [ ] Can update current price manually; unrealized gain recomputes
- [ ] Can sell fully or partially; realized gain computes correctly
- [ ] Can record dividends with reinvestment flag
- [ ] Portfolio summary totals correctly across all active investments
- [ ] Allocation chart shows correct proportions by type
- [ ] Gain/loss displays with green (positive) / red (negative) indicators
- [ ] Can write off or mature investments
- [ ] All transitions produce domain events

---

## 10. File Manifest

```
server/src/domain/investment/Investment.ts
server/src/domain/investment/Investment.events.ts
server/src/domain/investment/Investment.errors.ts
server/src/domain/investment/IInvestmentRepository.ts
server/src/domain/investment/entities/DividendEntry.ts
server/src/application/commands/handlers/investment/*
server/src/application/queries/handlers/investment/*
server/src/application/dto/InvestmentDTO.ts
server/src/infrastructure/projections/InvestmentPortfolioProjection.ts
server/src/infrastructure/http/routes/investmentRoutes.ts
server/src/infrastructure/http/controllers/InvestmentController.ts
client/src/features/investments/**
```
