# NexusCommand — Master Task Index

> **Total Atomic Tasks:** 711
> **Total Task Files:** 9
> **Phases:** 5 (Weeks 1–20)

---

## Task Files

| File | Modules Covered | Task Range | Count |
|---|---|---|---|
| `00_FOUNDATION_TASKS.md` | 00 Foundation | T-0001 → T-0109 | 109 |
| `01_CUSTOMERS_TASKS.md` | 01 Customers | T-0110 → T-0178 | 69 |
| `02_INVOICES_TASKS.md` | 02 Invoices | T-0179 → T-0251 | 73 |
| `03_PAYMENTS_TASKS.md` | 03 Payments | T-0252 → T-0288 | 37 |
| `04_08_FINANCIAL_TASKS.md` | 04 Expenses, 05 Receipts, 06 Bills, 07 Subscriptions, 08 Utilities | T-0289 → T-0415 | 127 |
| `09_ORDERS_TASKS.md` | 09 Orders | T-0416 → T-0447 | 32 |
| `10_13_OPERATIONS_TASKS.md` | 10 Purchases, 11 Projects, 12 Assets, 13 Investments | T-0448 → T-0570 | 123 |
| `14_USERS_TASKS.md` | 14 Users (IAM) | T-0571 → T-0619 | 49 |
| `15_ACCOUNTABILITY_TASKS.md` | 15 Accountability | T-0620 → T-0660 | 41 |
| `16_DASHBOARD_TASKS.md` | 16 Dashboard & Reporting | T-0661 → T-0711 | 51 |

---

## Tasks by Phase

| Phase | Weeks | Modules | Task Count |
|---|---|---|---|
| **Phase 1** | 1–4 | Foundation (109) + Users (49) | **158** |
| **Phase 2** | 5–8 | Customers (69) + Invoices (73) + Payments (37) + Orders (32) + Dashboard V1 (19) | **230** |
| **Phase 3** | 9–12 | Expenses (28) + Receipts (24) + Bills (25) + Subscriptions (27) + Utilities (23) + Dashboard V2 (14) | **141** |
| **Phase 4** | 13–16 | Purchases (26) + Projects (36) + Assets (32) + Investments (29) + Dashboard V3 (4) | **127** |
| **Phase 5** | 17–20 | Accountability (41) + Dashboard V4 (14) | **55** |

---

## Tasks by Layer

| Layer | Description | Approx. Count |
|---|---|---|
| **Domain** | Aggregates, entities, value objects, events, errors, invariants, unit tests | ~195 |
| **Application** | Command handlers, query handlers, reactors, DTOs, Zod schemas, bus wiring | ~165 |
| **Infrastructure** | Projections, Firestore adapters, Express routes/controllers, Cloud Functions, Firebase setup | ~160 |
| **Frontend** | API clients, hooks, pages, components, routing | ~150 |
| **Testing** | Integration tests across all modules | ~41 |

---

## Critical Path

```
T-0001 → T-0010   Monorepo scaffold
         ↓
T-0011 → T-0039   Domain base classes + value objects
         ↓
T-0040 → T-0057   Bus interfaces + ports
         ↓
T-0058 → T-0069   Firestore event store + projection engine
         ↓
T-0070 → T-0082   Express server + DI container
         ↓
T-0083 → T-0100   React scaffold + shared schemas
         ↓
T-0101 → T-0109   Firebase project setup
         ↓
T-0571 → T-0619   Users/IAM module (auth dependency for all)
         ↓
    ┌────┴────┐
    ▼         ▼
T-0110    T-0661    Customers + Dashboard V1 (parallel)
    │         │
    ▼         ▼
T-0179    T-0416    Invoices + Orders (parallel, both need Customers)
    │
    ▼
T-0252              Payments (needs Invoices)
    │
    ▼
T-0289 → T-0415    Financial modules (Phase 3, parallel)
    │
    ▼
T-0448 → T-0570    Operations modules (Phase 4, parallel)
    │
    ▼
T-0620 → T-0660    Accountability (Phase 5)
```

---

## Task ID Convention

```
T-{NNNN}
  │
  └── Sequential 4-digit number across all modules
      0001–0109: Foundation
      0110–0178: Customers
      0179–0251: Invoices
      0252–0288: Payments
      0289–0415: Expenses/Receipts/Bills/Subscriptions/Utilities
      0416–0447: Orders
      0448–0570: Purchases/Projects/Assets/Investments
      0571–0619: Users
      0620–0660: Accountability
      0661–0711: Dashboard
```

---

## How to Use These Tasks

1. **Sprint Planning**: Pick tasks from the current phase. Each task is atomic — one PR, one reviewable unit of work.
2. **Dependency Tracking**: Tasks within a module are ordered by dependency. Cross-module dependencies are noted in each file header.
3. **Parallelization**: Within a phase, modules with no cross-dependency can be built in parallel (e.g., Expenses + Receipts + Bills + Subscriptions + Utilities in Phase 3).
4. **Definition of Done**: Each task produces either a file, a passing test, or a verified deployment. No task requires more than ~2–4 hours of focused work.
5. **Progress Tracking**: Check off tasks as completed. Each file serves as both a task list and a progress tracker.
