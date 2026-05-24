# Tasks — Module 10: Purchases

> **Phase:** 4 (Weeks 13–16)
> **Dependencies:** Module 00, optionally 04 (Expenses), 11 (Projects)
> **Estimated Tasks:** 26

---

## 1. Domain Layer

- [ ] T-0448: Implement `PurchaseItem` entity — `itemId`, `name`, `quantity`, `unitCost`, `received`
- [ ] T-0449: Implement `Purchase` aggregate root — `Purchase.request(props)`, `when()` handler
- [ ] T-0450: Implement `Purchase.request()` — validate ≥ 1 item, compute totalCost, emit `PurchaseRequested`
- [ ] T-0451: Implement `Purchase.approve()` — validate Requested, emit `PurchaseApproved`
- [ ] T-0452: Implement `Purchase.order(purchaseOrderNumber?)` — validate Approved, emit `PurchaseOrdered`
- [ ] T-0453: Implement `Purchase.receiveItem(itemId)` — mark item received, if all received emit `PurchaseFullyReceived`, else emit `PurchaseItemReceived`
- [ ] T-0454: Implement `Purchase.receiveAll()` — mark all items received, emit `PurchaseFullyReceived`
- [ ] T-0455: Implement `Purchase.cancel(reason?)` — validate not Received, emit `PurchaseCancelled`
- [ ] T-0456: Implement `Purchase.linkToExpense(expenseId)` — emit `PurchaseExpenseLinked`
- [ ] T-0457: Implement `Purchase.allocateToProject(projectId)` — emit `PurchaseAllocatedToProject`
- [ ] T-0458: Define events, errors, repository port
- [ ] T-0459: Write unit tests for Purchase aggregate

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0460: Implement command handlers — Request, Approve, Order, ReceiveItem, ReceiveAll, Cancel, LinkToExpense, AllocateToProject
- [ ] T-0461: Implement query handlers — GetPurchaseList, GetPurchaseDetail, GetPurchasesByProject, GetPendingApprovals, GetPurchasesByVendor
- [ ] T-0462: Implement `PurchaseListProjection` — upsert `rm_purchases` with receivedItemCount, project name
- [ ] T-0463: Register projection
- [ ] T-0464: Implement `PurchaseController` and `purchaseRoutes.ts`
- [ ] T-0465: Implement `purchaseApi.ts` and hooks
- [ ] T-0466: Implement `PurchaseListPage` — DataTable with status pipeline, receiving progress
- [ ] T-0467: Implement `PurchaseTable` — columns: vendor, items, total, status, project, delivery progress, actions
- [ ] T-0468: Implement `RequestPurchaseDialog` — multi-item form with vendor selector, project link
- [ ] T-0469: Implement `PurchaseDetailDrawer` — item-level receiving checklist, status actions
- [ ] T-0470: Implement `PurchaseReceivingChecklist` — checkboxes per item, "Receive All" button
- [ ] T-0471: Implement `PendingApprovalsCard` — dashboard-ready widget
- [ ] T-0472: Add route `/purchases` to router
- [ ] T-0473: Write integration tests — request, approve, order, receive lifecycle

---

# Tasks — Module 11: Projects

> **Phase:** 4 (Weeks 13–16)
> **Dependencies:** Module 00, 01 (Customers), 02 (Invoices), 04 (Expenses), 09 (Orders), 10 (Purchases)
> **Estimated Tasks:** 36

---

## 1. Domain Layer

- [ ] T-0474: Implement `Milestone` entity — `milestoneId`, `title`, `description?`, `dueDate`, `status`, `completedAt?`
- [ ] T-0475: Implement `Project` aggregate root — `Project.create(props)`, `when()` handler
- [ ] T-0476: Implement `Project.create()` — validate budget ≥ 0, deadline ≥ startDate, emit `ProjectCreated`
- [ ] T-0477: Implement `Project.changeStatus(newStatus, reason?)` — validate transition, emit `ProjectStatusChanged`
- [ ] T-0478: Implement `Project.addMilestone(title, description?, dueDate)` — validate not Completed/Cancelled, emit `ProjectMilestoneAdded`
- [ ] T-0479: Implement `Project.updateMilestone(milestoneId, changes)` — emit `ProjectMilestoneUpdated`
- [ ] T-0480: Implement `Project.completeMilestone(milestoneId)` — validate exists, emit `ProjectMilestoneCompleted`
- [ ] T-0481: Implement `Project.updateBudget(newBudget)` — validate ≥ 0, emit `ProjectBudgetUpdated`
- [ ] T-0482: Implement `Project.updateSpend(delta, sourceType, sourceId)` — emit `ProjectSpendUpdated`
- [ ] T-0483: Implement `Project.complete()` — emit `ProjectCompleted`
- [ ] T-0484: Implement `Project.cancel(reason?)` — emit `ProjectCancelled`
- [ ] T-0485: Implement `Project.linkOrder(orderId)` — emit `ProjectOrderLinked`
- [ ] T-0486: Implement `Project.linkInvoice(invoiceId)` — emit `ProjectInvoiceLinked`
- [ ] T-0487: Define events, errors, repository port
- [ ] T-0488: Write unit tests for Project aggregate — create, milestones, budget, status transitions

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0489: Implement command handlers — Create, Update, ChangeStatus, AddMilestone, UpdateMilestone, CompleteMilestone, UpdateBudget, LinkOrder, LinkInvoice, Complete, Cancel
- [ ] T-0490: Implement `ProjectMilestoneReactor` — on `ProjectMilestoneCompleted`, dispatch `CreateAccountabilityEntry` with type Milestone
- [ ] T-0491: Register handlers and reactor
- [ ] T-0492: Implement query handlers — GetProjectList, GetProjectDetail, GetProjectBudgetReport, GetActiveProjects, GetProjectProfitability, GetProjectTimeline
- [ ] T-0493: Implement `ProjectListProjection` — upsert `rm_projects` with budgetUtilization, milestone counts, customer name
- [ ] T-0494: Implement `ProjectBudgetProjection` — listen to `ExpenseAllocatedToProject`, `ExpenseDeallocatedFromProject`, `PurchaseAllocatedToProject`, `PurchaseCancelled`; update `rm_projects.spent`
- [ ] T-0495: Register projections
- [ ] T-0496: Implement `ProjectController` and `projectRoutes.ts`
- [ ] T-0497: Implement `projectApi.ts` and hooks
- [ ] T-0498: Implement `ProjectPortfolioPage` — card grid with budget utilization bars, status badges
- [ ] T-0499: Implement `ProjectCard` — name, status, budget bar, milestone progress (X/Y), deadline countdown
- [ ] T-0500: Implement `ProjectDetailPage` — tabs: Overview, Milestones, Budget, Orders, Invoices, Expenses, Timeline
- [ ] T-0501: Implement `ProjectMilestoneList` — checklist with due dates, status toggles, complete action
- [ ] T-0502: Implement `ProjectBudgetChart` — budget vs. spent bar/donut chart
- [ ] T-0503: Implement `ProjectProfitabilityCard` — revenue (linked invoices) vs. costs (linked expenses/purchases)
- [ ] T-0504: Implement `CreateProjectDialog` — name, customer, budget, dates, tags
- [ ] T-0505: Implement `AddMilestoneDialog` — title, description, due date
- [ ] T-0506: Implement `ProjectTimeline` — cross-module event feed scoped to project
- [ ] T-0507: Implement `ProjectLinkedEntities` — tabs with mini-tables for linked orders, invoices, expenses, purchases
- [ ] T-0508: Add routes `/projects` and `/projects/:id` to router
- [ ] T-0509: Write integration tests — create, milestones, budget tracking from expenses/purchases, profitability

---

# Tasks — Module 12: Assets

> **Phase:** 4 (Weeks 13–16)
> **Dependencies:** Module 00, optionally 10 (Purchases)
> **Estimated Tasks:** 30

---

## 1. Domain Layer

- [ ] T-0510: Implement `MaintenanceEntry` entity — `entryId`, `description`, `cost`, `performedAt`, `performedBy?`
- [ ] T-0511: Implement `DepreciationCalculator` domain service — `calculateStraightLine(purchasePrice, salvageValue, usefulLifeYears)`, `calculateDecliningBalance(currentValue, usefulLifeYears)`
- [ ] T-0512: Implement `Asset` aggregate root — `Asset.register(props)`, `when()` handler
- [ ] T-0513: Implement `Asset.register()` — validate purchasePrice > 0, emit `AssetRegistered`
- [ ] T-0514: Implement `Asset.updateValue(newValue, reason)` — validate ≥ 0, emit `AssetValueUpdated`
- [ ] T-0515: Implement `Asset.depreciate(amount, period)` — validate ≥ 0, newValue ≥ 0, emit `AssetDepreciated`
- [ ] T-0516: Implement `Asset.changeCondition(newCondition)` — emit `AssetConditionChanged`
- [ ] T-0517: Implement `Asset.changeStatus(newStatus)` — emit `AssetStatusChanged`
- [ ] T-0518: Implement `Asset.logMaintenance(description, cost, performedAt, performedBy?)` — emit `AssetMaintenanceLogged`
- [ ] T-0519: Implement `Asset.dispose(reason?)` — validate not already Disposed/Sold, emit `AssetDisposed`
- [ ] T-0520: Implement `Asset.sell(salePrice)` — compute realizedGainLoss, emit `AssetSold`
- [ ] T-0521: Define events, errors, repository port
- [ ] T-0522: Write unit tests for Asset aggregate + DepreciationCalculator

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0523: Implement command handlers — Register, Update, UpdateValue, Depreciate, ChangeCondition, ChangeStatus, LogMaintenance, Dispose, Sell
- [ ] T-0524: Implement query handlers — GetAssetList, GetAssetDetail, GetAssetsByCategory, GetAssetDepreciationSchedule, GetTotalAssetValue
- [ ] T-0525: Implement `AssetListProjection` — upsert `rm_assets` with maintenanceCount, totalMaintenanceCost
- [ ] T-0526: Implement `AssetDepreciationProjection` — track value over time for chart
- [ ] T-0527: Register projections
- [ ] T-0528: Implement `AssetController` and `assetRoutes.ts`
- [ ] T-0529: Implement scheduled Cloud Function — monthly depreciation: for each depreciable active asset, compute and dispatch `DepreciateAsset` command
- [ ] T-0530: Deploy depreciation Cloud Function
- [ ] T-0531: Implement `assetApi.ts` and hooks
- [ ] T-0532: Implement `AssetRegistryPage` — DataTable + category breakdown + total value card
- [ ] T-0533: Implement `AssetTable` — columns: name, category icon, purchase price, current value, condition, status, actions
- [ ] T-0534: Implement `RegisterAssetDialog` — form with depreciation config (method, useful life)
- [ ] T-0535: Implement `AssetDetailDrawer` — full details, maintenance log, depreciation chart
- [ ] T-0536: Implement `AssetDepreciationChart` — Recharts line chart of value over time
- [ ] T-0537: Implement `AssetCategoryBreakdown` — pie chart by category value
- [ ] T-0538: Implement `AssetMaintenanceLog` — list with costs, add entry button
- [ ] T-0539: Implement `AssetTotalValueCard` — purchase price vs. current value summary
- [ ] T-0540: Add route `/assets` to router
- [ ] T-0541: Write integration tests — register, depreciate, maintain, dispose, sell

---

# Tasks — Module 13: Investments

> **Phase:** 4 (Weeks 13–16)
> **Dependencies:** Module 00
> **Estimated Tasks:** 28

---

## 1. Domain Layer

- [ ] T-0542: Implement `DividendEntry` entity — `dividendId`, `amount`, `date`, `reinvested`
- [ ] T-0543: Implement `Investment` aggregate root — `Investment.acquire(props)`, `when()` handler
- [ ] T-0544: Implement `Investment.acquire()` — validate quantity > 0, purchasePrice > 0, emit `InvestmentAcquired`
- [ ] T-0545: Implement `Investment.updatePrice(newPrice, source?)` — recompute totalValue + unrealizedGain, emit `InvestmentPriceUpdated`
- [ ] T-0546: Implement `Investment.sell(salePrice, quantity?)` — full or partial sale, compute realizedGain, emit `InvestmentSold` or `InvestmentPartialSold`
- [ ] T-0547: Implement `Investment.recordDividend(amount, date, reinvested?)` — validate Active, emit `InvestmentDividendReceived`
- [ ] T-0548: Implement `Investment.mature(finalValue)` — emit `InvestmentMatured`
- [ ] T-0549: Implement `Investment.writeOff(reason)` — emit `InvestmentWrittenOff`
- [ ] T-0550: Implement unrealized gain computation: `(currentPrice - purchasePrice) * quantity`
- [ ] T-0551: Implement realized gain computation: `(salePrice - purchasePrice) * quantitySold`
- [ ] T-0552: Define events, errors, repository port
- [ ] T-0553: Write unit tests for Investment aggregate — acquire, price update, sell, partial sell, dividend, gain calculations

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0554: Implement command handlers — Acquire, UpdatePrice, Sell, RecordDividend, Mature, WriteOff, Update
- [ ] T-0555: Implement query handlers — GetInvestmentList, GetInvestmentDetail, GetPortfolioSummary, GetPortfolioAllocation, GetInvestmentPerformance, GetDividendHistory
- [ ] T-0556: Implement `InvestmentPortfolioProjection` — upsert `rm_investments` with unrealizedGainPct, totalDividends
- [ ] T-0557: Register projection
- [ ] T-0558: Implement `InvestmentController` and `investmentRoutes.ts`
- [ ] T-0559: Implement `investmentApi.ts` and hooks
- [ ] T-0560: Implement `InvestmentPortfolioPage` — table + portfolio summary + allocation chart
- [ ] T-0561: Implement `InvestmentTable` — columns: name, type, ticker, cost basis, current value, gain/loss (color-coded), status
- [ ] T-0562: Implement `PortfolioSummaryCard` — total value, unrealized P&L, realized P&L, total dividends
- [ ] T-0563: Implement `PortfolioAllocationChart` — Recharts pie chart by investment type
- [ ] T-0564: Implement `AcquireInvestmentDialog` — form with type, platform, ticker, price, quantity
- [ ] T-0565: Implement `InvestmentDetailDrawer` — price history, dividend log, sell/write-off actions
- [ ] T-0566: Implement `UpdatePriceDialog` — quick price update modal
- [ ] T-0567: Implement `InvestmentGainLossIndicator` — green ▲ / red ▼ with percentage
- [ ] T-0568: Implement `DividendHistoryTable` — cross-investment dividend log with totals
- [ ] T-0569: Add route `/investments` to router
- [ ] T-0570: Write integration tests — acquire, price update, sell, dividend, portfolio summary
