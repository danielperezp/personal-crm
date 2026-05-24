# Tasks — Module 16: Dashboard & Reporting

> **Phase:** 2–5 (iterative, grows with each phase)
> **Dependencies:** All other modules (read-only aggregation)
> **Estimated Tasks:** 46

---

## Phase 2 Tasks (Weeks 5–8) — Dashboard V1

- [ ] T-0661: Implement `DashboardKPIProjection` — initial version subscribing to Invoice + Payment events; compute `totalInvoicedMTD`, `totalInvoicedYTD`, `outstandingBalance`, `overdueBalance`, `overdueInvoiceCount`, `totalCollectedMTD`, `revenueChangeVsLastMonth`
- [ ] T-0662: Implement `ActivityTimelineProjection` — subscribe to ALL domain events, transform each to `ActivityTimelineEntry` with human-readable summary, icon, color, linkTo route
- [ ] T-0663: Define summary generation per event type — e.g., `InvoiceIssued` → "Invoice INV-0042 issued for $2,400", `PaymentCompleted` → "Payment of $1,200 received for INV-0042"
- [ ] T-0664: Implement activity timeline retention — cap at 500 entries in `rm_activity_timeline`
- [ ] T-0665: Register Phase 2 projections
- [ ] T-0666: Implement `GetDashboardKPIsHandler` — read from `rm_dashboard/{userId}`
- [ ] T-0667: Implement `GetActivityTimelineHandler` — paginated read from `rm_activity_timeline` with optional module filter
- [ ] T-0668: Implement `DashboardController` — `GET /api/v1/dashboard`, `GET /api/v1/dashboard/activity`
- [ ] T-0669: Implement `dashboardApi.ts` — typed Axios calls for KPIs and activity
- [ ] T-0670: Implement `useDashboardKPIs` hook — TanStack Query with auto-refetch
- [ ] T-0671: Implement `useActivityTimeline` hook — TanStack Query with pagination
- [ ] T-0672: Implement `DashboardPage` layout — responsive grid with placeholder cards for future sections
- [ ] T-0673: Implement `KPICard` atom — reusable stat card with value, label, trend indicator, optional icon
- [ ] T-0674: Implement `TrendIndicator` — ▲ green / ▼ red with percentage change
- [ ] T-0675: Implement `RevenueSnapshotCard` — total invoiced, outstanding, overdue using KPICard
- [ ] T-0676: Implement `ActivityTimeline` component — scrollable feed with module-specific icons and colors
- [ ] T-0677: Implement `ActivityTimelineEntry` — single row: timestamp, icon, summary text, link to entity
- [ ] T-0678: Implement `PeriodSelector` — MTD / QTD / YTD / Custom date range toggle
- [ ] T-0679: Add route `/` (root) pointing to DashboardPage

---

## Phase 3 Tasks (Weeks 9–12) — Dashboard V2

- [ ] T-0680: Extend `DashboardKPIProjection` — subscribe to Expense + Subscription + Bill events; add `netCashFlowMTD`, `totalIncomeMTD`, `totalExpensesMTD`, `monthlySubscriptionBurn`, `activeSubscriptionCount`, `billsDueThisWeek`, `overdueBillCount`
- [ ] T-0681: Implement `CashFlowProjection` — subscribe to `PaymentCompleted`, `PaymentRefunded`, `ExpenseRecorded`, `InvestmentSold`, `InvestmentDividendReceived`; aggregate by month into `rm_cash_flow/{yyyy-mm}`
- [ ] T-0682: Implement `MonthlyFinancialSummaryProjection` — aggregate revenue, expenses, subscriptions, bills, investments per month into `rm_monthly_summary/{yyyy-mm}`
- [ ] T-0683: Register Phase 3 projections
- [ ] T-0684: Implement `GetCashFlowByPeriodHandler` — read `rm_cash_flow` for date range
- [ ] T-0685: Implement `GetMonthlySummaryHandler` — read `rm_monthly_summary/{period}`
- [ ] T-0686: Add `GET /api/v1/dashboard/cash-flow` and `GET /api/v1/reports/monthly-summary/:period` endpoints
- [ ] T-0687: Implement `useCashFlow` hook
- [ ] T-0688: Implement `CashFlowCard` — net cash flow summary stat
- [ ] T-0689: Implement `NetProfitCard` — revenue minus expenses
- [ ] T-0690: Implement `CashFlowChart` — Recharts grouped bar chart (income vs expenses by month)
- [ ] T-0691: Implement `ExpenseBreakdownChart` — Recharts pie/donut by category (reads from `ExpenseByCategoryProjection`)
- [ ] T-0692: Implement `SubscriptionBurnCard` — monthly burn total + upcoming renewals list
- [ ] T-0693: Implement `BillsDueCard` — count due this week + overdue count + next 3 due items

---

## Phase 4 Tasks (Weeks 13–16) — Dashboard V3

- [ ] T-0694: Extend `DashboardKPIProjection` — subscribe to Project + Investment events; add `activeProjectCount`, `completedProjectCountYTD`, `portfolioTotalValue`, `portfolioUnrealizedGain`, `portfolioDailyChange`
- [ ] T-0695: Register Phase 4 projection updates
- [ ] T-0696: Implement `ProjectHealthCard` — active projects with budget utilization progress bars
- [ ] T-0697: Implement `InvestmentPortfolioCard` — total value, unrealized P&L, mini allocation pie chart

---

## Phase 5 Tasks (Weeks 17–20) — Dashboard V4

- [ ] T-0698: Extend `DashboardKPIProjection` — subscribe to Accountability events; add `accountabilityScore`, `activeGoalCount`, `overdueTaskCount`, `activeStreakCount`
- [ ] T-0699: Register Phase 5 projection updates
- [ ] T-0700: Implement `AccountabilityScoreCard` — completion rate, active streaks list, overdue tasks
- [ ] T-0701: Implement `GetYearOverYearComparisonHandler` — compare monthly summaries across two years
- [ ] T-0702: Add `GET /api/v1/reports/year-over-year` endpoint
- [ ] T-0703: Implement `useMonthlyReport` hook
- [ ] T-0704: Implement CSV export endpoint — `GET /api/v1/reports/export/csv?type=expenses&from=&to=`
- [ ] T-0705: Implement CSV export for each type: expenses, payments, invoices, subscriptions, bills, investments
- [ ] T-0706: Implement Cloud Function for timeline pruning — weekly: keep only last 500 entries in `rm_activity_timeline`

---

## Testing

- [ ] T-0707: Write integration test — dashboard KPIs reflect correct values after invoice + payment events
- [ ] T-0708: Write integration test — cash flow chart data matches payment inflows and expense outflows
- [ ] T-0709: Write integration test — activity timeline captures events from multiple modules in correct order
- [ ] T-0710: Write integration test — CSV export generates valid file with correct columns per type
- [ ] T-0711: Write integration test — period selector (MTD/QTD/YTD) correctly filters KPI data
