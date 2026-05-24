# NexusCommand — Module Specification Index

> **Version:** 0.1.0-spec
> **Date:** 2026-04-07
> **Total Modules:** 16 (Foundation + 15 Feature Modules + Dashboard)

---

## Specification Documents

| # | File | Module | Context | Phase | Weeks |
|---|---|---|---|---|---|
| 00 | `00_FOUNDATION.md` | Foundation & Shared Infrastructure | Shared Kernel | 1 | 1–4 |
| 01 | `01_CUSTOMERS.md` | Customers | Customer | 2 | 5–8 |
| 02 | `02_INVOICES.md` | Invoices | Financial | 2 | 5–8 |
| 03 | `03_PAYMENTS.md` | Payments | Financial | 2 | 5–8 |
| 04 | `04_EXPENSES.md` | Expenses | Financial | 3 | 9–12 |
| 05 | `05_RECEIPTS.md` | Receipts | Financial | 3 | 9–12 |
| 06 | `06_BILLS.md` | Bills | Financial | 3 | 9–12 |
| 07 | `07_SUBSCRIPTIONS.md` | Subscriptions | Financial | 3 | 9–12 |
| 08 | `08_UTILITIES.md` | Utilities | Financial | 3 | 9–12 |
| 09 | `09_ORDERS.md` | Orders | Operations | 2 | 5–8 |
| 10 | `10_PURCHASES.md` | Purchases | Operations | 4 | 13–16 |
| 11 | `11_PROJECTS.md` | Projects | Operations | 4 | 13–16 |
| 12 | `12_ASSETS.md` | Assets | Operations | 4 | 13–16 |
| 13 | `13_INVESTMENTS.md` | Investments | Operations | 4 | 13–16 |
| 14 | `14_USERS.md` | Users (IAM) | Governance | 1 | 1–4 |
| 15 | `15_ACCOUNTABILITY.md` | Accountability | Governance | 5 | 17–20 |
| 16 | `16_DASHBOARD.md` | Dashboard & Reporting | Cross-Cutting | 2–5 | 5–20 |

---

## Build Order (Dependency-Driven)

```
Phase 1 — Foundation
  ├── 00_FOUNDATION ← Everything depends on this
  └── 14_USERS      ← Auth required by all modules

Phase 2 — Core CRM
  ├── 01_CUSTOMERS   ← Referenced by Invoices, Orders, Projects
  ├── 02_INVOICES    ← Depends on Customers
  ├── 03_PAYMENTS    ← Depends on Invoices (optional)
  ├── 09_ORDERS      ← Depends on Customers
  └── 16_DASHBOARD   ← V1: Revenue + Activity

Phase 3 — Financial Tracking
  ├── 04_EXPENSES    ← Depends on Receipts, Bills, Projects (optional links)
  ├── 05_RECEIPTS    ← Depends on Payments, Expenses (optional links)
  ├── 06_BILLS       ← Standalone, links to Expenses
  ├── 07_SUBSCRIPTIONS ← Standalone, links to Bills
  ├── 08_UTILITIES   ← Standalone, links to Bills
  └── 16_DASHBOARD   ← V2: + Cash Flow, Expenses, Subscriptions, Bills

Phase 4 — Operations & Assets
  ├── 10_PURCHASES   ← Links to Expenses, Projects
  ├── 11_PROJECTS    ← Links to Customers, Orders, Invoices, Expenses, Purchases
  ├── 12_ASSETS      ← Links to Purchases
  ├── 13_INVESTMENTS ← Standalone
  └── 16_DASHBOARD   ← V3: + Projects, Investments

Phase 5 — Governance & Polish
  ├── 15_ACCOUNTABILITY ← Links to Projects, Investments
  └── 16_DASHBOARD      ← V4: + Accountability, Reports, Export
```

---

## Cross-Module Dependency Map

```
                    ┌──────────┐
                    │  USERS   │ ← Auth for everything
                    └────┬─────┘
                         │
              ┌──────────┼──────────────────────────────────┐
              ▼          ▼                                   ▼
        ┌──────────┐ ┌──────────┐                    ┌──────────────┐
        │CUSTOMERS │ │ACCOUNTA. │◄───────────────────│   PROJECTS   │
        └──┬───┬───┘ └──────────┘                    └──┬───┬───┬───┘
           │   │                                        │   │   │
     ┌─────┘   └─────┐                          ┌──────┘   │   └──────┐
     ▼               ▼                          ▼          ▼          ▼
┌──────────┐   ┌──────────┐              ┌──────────┐┌──────────┐┌──────────┐
│ INVOICES │   │  ORDERS  │              │PURCHASES ││ EXPENSES ││  ASSETS  │
└──┬───────┘   └──────────┘              └──────────┘└──┬───────┘└──────────┘
   │                                                    │
   ▼                                                    ▼
┌──────────┐                                     ┌──────────┐
│ PAYMENTS │────────────────────────────────────▶│ RECEIPTS │
└──────────┘                                     └──────────┘

┌──────────┐   ┌──────────┐   ┌──────────┐
│  BILLS   │◄──│SUBSCRIPT.│   │UTILITIES │──▶ BILLS
└──────────┘   └──────────┘   └──────────┘

┌──────────────┐
│ INVESTMENTS  │──▶ ACCOUNTABILITY
└──────────────┘

┌──────────────────────────────────────────────────┐
│              DASHBOARD (reads from ALL)            │
└──────────────────────────────────────────────────┘
```

---

## Spec Consistency Checklist

Every module spec includes:

- [ ] **Overview** — What the module does and why
- [ ] **Aggregate definition** — Full property tree with types
- [ ] **Invariants** — Business rules enforced by the aggregate
- [ ] **Enums** — All status types and category types
- [ ] **Domain Events** — Complete event catalog with payloads
- [ ] **Integration Events** — Cross-module event consumers
- [ ] **Commands** — All write operations with validation rules
- [ ] **Queries** — All read operations with response types
- [ ] **Read Model Projection** — Firestore collection schema
- [ ] **API Endpoints** — Full REST surface (commands + queries + audit)
- [ ] **Frontend** — Pages, routes, feature components
- [ ] **Acceptance Criteria** — Testable requirements
- [ ] **File Manifest** — Every file to be created

---

## Aggregate Count Summary

| Metric | Count |
|---|---|
| Bounded Contexts | 4 |
| Aggregates | 15 |
| Domain Event Types | ~95 |
| Commands | ~85 |
| Queries | ~60 |
| Read Model Collections | ~20 |
| API Endpoints | ~120 |
| Frontend Pages | ~22 |
| Cloud Functions | ~5 scheduled jobs |
| Reactors | ~8 cross-module reactors |
