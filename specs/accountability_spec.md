# Module: Accountability (Budgeting & Tracking)

## Purpose
Set financial goals, budgets by category, and track spending against budgets. Provide spending limits and alerts.

## Aggregate: Budget
- Attributes: name, category (or grouping), period (monthly, yearly), amountLimit, startDate, endDate, isActive

## Commands
- `CreateBudget`
- `UpdateBudget`
- `CloseBudget`

## Events
- `BudgetCreated`, `BudgetUpdated`, `BudgetClosed`

## Projections
- `budgets` collection
- Budget vs. actual spending view (combining data from Spendings module via query service).

## API
- `POST /api/budgets`
- `GET /api/budgets`
- `PUT /api/budgets/:id`
- `DELETE /api/budgets/:id`

## Integration
- An analytical query service aggregates spending per category and compares with active budgets; can be a read‑only endpoint polling Spent read model.