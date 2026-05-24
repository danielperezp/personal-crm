# Module 16 — Dashboard & Reporting

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Dashboard & Cross-Module Reporting
> **Bounded Context:** Cross-Cutting (reads from all contexts)
> **Phase:** 2–5 (iterative, grows with each phase)
> **Status:** Draft

---

## 1. Overview

The Dashboard is the landing page of NexusCommand — a single-screen command center that aggregates KPIs, trends, and alerts from all 15 modules. It is **read-only** and powered entirely by cross-module projections. The dashboard evolves across phases as modules come online, from a basic revenue snapshot (Phase 2) to a full operational intelligence view (Phase 5).

---

## 2. Scope

### In Scope

- Aggregated KPI cards (revenue, expenses, cash flow, portfolio value, etc.)
- Trend charts (revenue over time, expense breakdown, cash flow)
- Alert widgets (overdue invoices, due bills, broken habit streaks)
- Unified activity timeline (recent events across all modules)
- Period selector (MTD, QTD, YTD, custom range)
- Monthly financial summary reports
- Export to CSV

### Out of Scope

- Custom dashboard builder / widget drag-and-drop (V2)
- AI-generated insights (V2)
- Embeddable dashboard sharing

---

## 3. Dashboard Sections

### 3.1 Revenue Snapshot (Phase 2)

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  Total Invoiced      │  Outstanding        │  Overdue            │
│  $24,500 (MTD)       │  $8,200             │  $3,100 (4 inv.)    │
│  ▲ 12% vs last month │                     │  ⚠ Needs attention  │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Data Source:** `InvoiceListProjection`, `PaymentLedgerProjection`

### 3.2 Cash Flow Chart (Phase 3)

```
Income vs. Expenses — Last 6 Months
  ┌──────────────────────────────────────┐
  │  ██ Income   ░░ Expenses             │
  │  ██░░  ██░░  ██░░  ██░░  ██░░  ██░░ │
  │  Nov   Dec   Jan   Feb   Mar   Apr   │
  └──────────────────────────────────────┘
  Net: +$12,400 (MTD)
```

**Data Source:** `CashFlowProjection` (aggregates Payment + Expense events by month)

### 3.3 Expense Breakdown (Phase 3)

```
Expenses by Category — This Month
  ┌────────────────────────┐
  │  ● Software    $1,200  │
  │  ● Travel       $800   │
  │  ● Office       $450   │
  │  ● Marketing    $320   │
  │  ● Other        $180   │
  └────────────────────────┘
```

**Data Source:** `ExpenseByCategoryProjection`

### 3.4 Subscription Burn (Phase 3)

```
┌──────────────────────────────────┐
│  Monthly Subscription Burn       │
│  $847/mo across 14 services      │
│                                  │
│  Upcoming Renewals (7 days):     │
│  • Figma — Apr 12 — $15/mo      │
│  • AWS — Apr 14 — $234/mo       │
└──────────────────────────────────┘
```

**Data Source:** `SubscriptionBurnProjection`

### 3.5 Bills Due (Phase 3)

```
┌──────────────────────────────────┐
│  Bills Due This Week: 3          │
│  Overdue: 1 ⚠                   │
│                                  │
│  • Internet — Apr 8 — $89       │
│  • Electricity — Apr 10 — $142  │
│  • Insurance — Apr 12 — $320    │
└──────────────────────────────────┘
```

**Data Source:** `BillListProjection`

### 3.6 Project Health (Phase 4)

```
┌──────────────────────────────────────────────────┐
│  Active Projects: 4                               │
│                                                    │
│  Website Redesign    ████████░░  78% budget used  │
│  Mobile App          ████░░░░░░  42% budget used  │
│  API Integration     ██████████  100% ⚠ over      │
│  Marketing Campaign  ██░░░░░░░░  18% budget used  │
└──────────────────────────────────────────────────┘
```

**Data Source:** `ProjectListProjection` (budgetUtilization field)

### 3.7 Investment Portfolio (Phase 4)

```
┌──────────────────────────────────┐
│  Portfolio Value: $142,300       │
│  Unrealized P&L: +$18,400 ▲     │
│  Today: +$320 (+0.22%)          │
│                                  │
│  Allocation:                     │
│  ● Stocks 62%  ● Crypto 18%    │
│  ● Bonds 12%   ● Other  8%     │
└──────────────────────────────────┘
```

**Data Source:** `InvestmentPortfolioProjection`

### 3.8 Accountability Score (Phase 5)

```
┌──────────────────────────────────┐
│  Accountability Score: 82%       │
│                                  │
│  Goals on track: 6/8             │
│  Overdue tasks: 2 ⚠             │
│  Active streaks: 3 🔥           │
│    • Daily standup — 14 days    │
│    • Exercise — 7 days          │
│    • Reading — 21 days          │
└──────────────────────────────────┘
```

**Data Source:** `AccountabilityScoreProjection`

### 3.9 Recent Activity Timeline (Phase 2+)

```
┌──────────────────────────────────────────────────┐
│  Recent Activity                                  │
│                                                    │
│  10:32 AM  Payment received — INV-0042 — $2,400  │
│  09:15 AM  Order shipped — ORD-0018              │
│  Yesterday Invoice issued — INV-0043 — $5,800    │
│  Yesterday Expense recorded — Software — $49     │
│  Apr 5     Project milestone completed — MVP     │
│  Apr 5     Customer created — Acme Corp          │
└──────────────────────────────────────────────────┘
```

**Data Source:** `ActivityTimelineProjection` (listens to ALL domain events)

---

## 4. Cross-Module Projections

### 4.1 `DashboardKPIProjection`

**Collection:** `rm_dashboard/{userId}`

```typescript
interface DashboardKPIReadModel {
  // Revenue (Phase 2)
  totalInvoicedMTD: number;
  totalInvoicedYTD: number;
  outstandingBalance: number;
  overdueBalance: number;
  overdueInvoiceCount: number;
  totalCollectedMTD: number;
  revenueChangeVsLastMonth: number;  // percentage

  // Cash Flow (Phase 3)
  netCashFlowMTD: number;
  totalIncomeMTD: number;
  totalExpensesMTD: number;

  // Subscriptions (Phase 3)
  monthlySubscriptionBurn: number;
  activeSubscriptionCount: number;

  // Bills (Phase 3)
  billsDueThisWeek: number;
  overdueBillCount: number;

  // Projects (Phase 4)
  activeProjectCount: number;
  completedProjectCountYTD: number;

  // Investments (Phase 4)
  portfolioTotalValue: number;
  portfolioUnrealizedGain: number;
  portfolioDailyChange: number;

  // Accountability (Phase 5)
  accountabilityScore: number;
  activeGoalCount: number;
  overdueTaskCount: number;
  activeStreakCount: number;

  // Metadata
  lastUpdatedAt: number;
}
```

**Subscribed Events:** This projection subscribes to a wide set of events across all modules:

| Source Module | Events |
|---|---|
| Invoices | `InvoiceDrafted`, `InvoiceIssued`, `InvoiceMarkedPaid`, `InvoiceOverdue`, `InvoiceCancelled`, `InvoiceVoided` |
| Payments | `PaymentCompleted`, `PaymentRefunded` |
| Expenses | `ExpenseRecorded`, `ExpenseApproved` |
| Subscriptions | `SubscriptionStarted`, `SubscriptionCancelled`, `SubscriptionPlanChanged`, `SubscriptionRenewed` |
| Bills | `BillCreated`, `BillPaid`, `BillOverdue`, `BillCancelled` |
| Projects | `ProjectCreated`, `ProjectCompleted`, `ProjectCancelled`, `ProjectStatusChanged` |
| Investments | `InvestmentAcquired`, `InvestmentPriceUpdated`, `InvestmentSold` |
| Accountability | `AccountabilityEntryCreated`, `AccountabilityCompleted`, `AccountabilityFailed`, `AccountabilityHabitCompleted`, `AccountabilityHabitStreakBroken` |

### 4.2 `CashFlowProjection`

**Collection:** `rm_cash_flow/{yyyy-mm}`

```typescript
interface CashFlowReadModel {
  period: string;                    // "2026-04"
  totalIncome: number;               // Sum of completed payments
  totalExpenses: number;             // Sum of recorded expenses
  netCashFlow: number;               // income - expenses
  incomeBySource: {
    invoicePayments: number;
    standAlonePayments: number;
    investmentSales: number;
    dividends: number;
  };
  expensesByCategory: Record<ExpenseCategory, number>;
}
```

**Subscribed Events:** `PaymentCompleted`, `PaymentRefunded`, `ExpenseRecorded`, `InvestmentSold`, `InvestmentDividendReceived`

### 4.3 `MonthlyFinancialSummaryProjection`

**Collection:** `rm_monthly_summary/{yyyy-mm}`

```typescript
interface MonthlyFinancialSummaryReadModel {
  period: string;
  revenue: {
    invoiced: number;
    collected: number;
    outstanding: number;
  };
  expenses: {
    total: number;
    byCategory: Record<ExpenseCategory, number>;
    deductible: number;
  };
  subscriptions: {
    totalBurn: number;
    newCount: number;
    cancelledCount: number;
  };
  bills: {
    totalPaid: number;
    totalOverdue: number;
  };
  investments: {
    acquired: number;
    sold: number;
    dividends: number;
    unrealizedGainChange: number;
  };
  netProfit: number;                 // collected - expenses.total
  lastUpdatedAt: number;
}
```

### 4.4 `ActivityTimelineProjection`

**Collection:** `rm_activity_timeline`

```typescript
interface ActivityTimelineEntry {
  id: string;                        // eventId
  timestamp: number;
  module: string;                    // 'customers' | 'invoices' | 'payments' | ...
  eventType: string;
  aggregateId: string;
  summary: string;                   // Human-readable: "Invoice INV-0042 issued for $2,400"
  icon: string;                      // Lucide icon name
  color: string;                     // Semantic color
  linkTo: string;                    // Frontend route: "/invoices/inv_abc123"
  userId: string;
}
```

**Subscribed Events:** ALL domain events (filtered to user-facing ones, excluding internal system events)

**Retention:** Last 500 entries, pruned by Cloud Function weekly.

---

## 5. Queries

| Query | Response |
|---|---|
| `GetDashboardKPIs` | `DashboardKPIReadModel` |
| `GetCashFlowByPeriod` | `CashFlowReadModel[]` — for chart rendering |
| `GetMonthlyFinancialSummary` | `MonthlyFinancialSummaryReadModel` |
| `GetActivityTimeline` | `PaginatedResult<ActivityTimelineEntry>` — filters: module, dateRange |
| `GetYearOverYearComparison` | `{ thisYear: MonthlyFinancialSummaryReadModel[], lastYear: MonthlyFinancialSummaryReadModel[] }` |

---

## 6. API Endpoints

```
GET    /api/v1/dashboard                             → Full KPI payload
GET    /api/v1/dashboard/cash-flow?from=&to=          → Cash flow by period
GET    /api/v1/dashboard/activity?page=&limit=&module= → Activity timeline
GET    /api/v1/reports/monthly-summary/:period        → e.g., /2026-04
GET    /api/v1/reports/year-over-year?year=2026
GET    /api/v1/reports/export/csv?type=expenses&from=&to=  → CSV export
```

---

## 7. Frontend

### Pages

| Route | Page |
|---|---|
| `/` | `DashboardPage` — the main landing page |

### Component Layout

```
DashboardPage
├── PeriodSelector (MTD | QTD | YTD | Custom)
├── Row 1: KPI Cards
│   ├── RevenueSnapshotCard
│   ├── CashFlowCard
│   └── NetProfitCard
├── Row 2: Charts
│   ├── CashFlowChart (Recharts bar — income vs expenses)
│   └── ExpenseBreakdownChart (Recharts pie)
├── Row 3: Operational
│   ├── SubscriptionBurnCard
│   ├── BillsDueCard
│   └── ProjectHealthCard
├── Row 4: Wealth & Governance
│   ├── InvestmentPortfolioCard
│   └── AccountabilityScoreCard
└── Row 5: Activity
    └── ActivityTimeline (scrollable feed)
```

### Feature Components

```
features/dashboard/
├── components/
│   ├── PeriodSelector.tsx             # MTD/QTD/YTD/Custom date range toggle
│   ├── RevenueSnapshotCard.tsx        # Invoiced, outstanding, overdue
│   ├── CashFlowCard.tsx               # Net cash flow summary
│   ├── NetProfitCard.tsx              # Revenue - expenses
│   ├── CashFlowChart.tsx              # Recharts grouped bar chart
│   ├── ExpenseBreakdownChart.tsx      # Recharts pie/donut chart
│   ├── SubscriptionBurnCard.tsx       # Monthly burn + upcoming renewals
│   ├── BillsDueCard.tsx               # Due this week + overdue count
│   ├── ProjectHealthCard.tsx          # Active projects with budget bars
│   ├── InvestmentPortfolioCard.tsx    # Portfolio value + allocation mini-chart
│   ├── AccountabilityScoreCard.tsx    # Score, streaks, overdue
│   ├── ActivityTimeline.tsx           # Scrollable event feed with module icons
│   ├── ActivityTimelineEntry.tsx      # Single timeline row
│   ├── KPICard.tsx                    # Reusable stat card atom (value, label, trend)
│   └── TrendIndicator.tsx            # ▲/▼ with percentage and color
├── hooks/
│   ├── useDashboardKPIs.ts            # TanStack Query
│   ├── useCashFlow.ts
│   ├── useActivityTimeline.ts
│   └── useMonthlyReport.ts
├── api/
│   └── dashboardApi.ts
└── types/
    └── dashboard.types.ts
```

---

## 8. Dashboard Evolution by Phase

| Phase | Sections Available |
|---|---|
| **Phase 2** (Weeks 5–8) | Revenue Snapshot, Recent Activity Timeline (Customers, Invoices, Payments, Orders) |
| **Phase 3** (Weeks 9–12) | + Cash Flow Chart, Expense Breakdown, Subscription Burn, Bills Due |
| **Phase 4** (Weeks 13–16) | + Project Health, Investment Portfolio |
| **Phase 5** (Weeks 17–20) | + Accountability Score, Monthly Reports, CSV Export, Year-over-Year |

---

## 9. CSV Export

```typescript
// GET /api/v1/reports/export/csv?type=expenses&from=2026-01-01&to=2026-04-30
// Supported types: expenses, payments, invoices, subscriptions, bills, investments
//
// Returns: Content-Type: text/csv with appropriate columns per type
// Generated server-side from read model projections
```

---

## 10. Acceptance Criteria

- [ ] Dashboard loads in < 2 seconds with all KPIs pre-computed in read models
- [ ] Revenue snapshot shows correct MTD/YTD invoiced, outstanding, and overdue
- [ ] Cash flow chart correctly visualizes income vs. expenses by month
- [ ] Expense breakdown pie chart matches category totals
- [ ] Subscription burn shows correct monthly total and upcoming renewals
- [ ] Bills due widget shows correct counts and next due items
- [ ] Project health shows active projects with accurate budget utilization
- [ ] Investment portfolio card shows correct total value and unrealized P&L
- [ ] Accountability score computes completion rate correctly
- [ ] Activity timeline shows events across all modules in chronological order
- [ ] Period selector (MTD/QTD/YTD/Custom) filters all widgets appropriately
- [ ] Monthly financial summary report is accurate
- [ ] CSV export generates valid files for each supported type
- [ ] Dashboard degrades gracefully when modules are not yet built (empty state cards)

---

## 11. File Manifest

```
server/src/infrastructure/projections/DashboardKPIProjection.ts
server/src/infrastructure/projections/CashFlowProjection.ts
server/src/infrastructure/projections/MonthlyFinancialSummaryProjection.ts
server/src/infrastructure/projections/ActivityTimelineProjection.ts
server/src/application/queries/handlers/dashboard/GetDashboardKPIsHandler.ts
server/src/application/queries/handlers/dashboard/GetCashFlowHandler.ts
server/src/application/queries/handlers/dashboard/GetActivityTimelineHandler.ts
server/src/application/queries/handlers/reports/GetMonthlySummaryHandler.ts
server/src/application/queries/handlers/reports/ExportCsvHandler.ts
server/src/application/dto/DashboardDTO.ts
server/src/application/dto/ReportDTO.ts
server/src/infrastructure/http/routes/dashboardRoutes.ts
server/src/infrastructure/http/routes/reportRoutes.ts
server/src/infrastructure/http/controllers/DashboardController.ts
server/src/infrastructure/http/controllers/ReportController.ts
functions/src/timelinePruneJob.ts
client/src/features/dashboard/**
```
