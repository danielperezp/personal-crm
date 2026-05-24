# Module 11 — Projects

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Projects
> **Bounded Context:** Operations Context
> **Phase:** 4 (Weeks 13–16)
> **Status:** Draft

---

## 1. Overview

The Projects module is the operational hub that ties together Customers, Orders, Invoices, Expenses, and Purchases under a unified project umbrella. Each project has milestones, a budget with real-time spend tracking derived from linked expenses and purchases, and timeline/deadline management. Projects also trigger Accountability entries when milestones are reached.

---

## 2. Aggregate: `Project`

```
Project (Aggregate Root)
├── projectId: ProjectId
├── name: string
├── description?: string
├── customerId?: CustomerId
├── status: ProjectStatus
├── startDate?: Timestamp
├── deadline?: Timestamp
├── budget: Money
├── spent: Money                     // Derived from linked expenses + purchases
├── milestones: Milestone[]          // Entity
│   ├── milestoneId: MilestoneId
│   ├── title: string
│   ├── description?: string
│   ├── dueDate: Timestamp
│   ├── status: MilestoneStatus     // Pending | InProgress | Completed | Missed
│   └── completedAt?: Timestamp
├── linkedOrderIds: OrderId[]
├── linkedInvoiceIds: InvoiceId[]
├── tags: Tag[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot complete a project with incomplete milestones (warning, not blocking).
- Budget must be ≥ 0.
- Deadline must be ≥ startDate if both are set.
- Cannot add milestones to a Completed or Cancelled project.
- Milestone dueDate should be ≤ project deadline (warning).

### Enums

```typescript
type ProjectStatus = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
type MilestoneStatus = 'Pending' | 'InProgress' | 'Completed' | 'Missed';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `ProjectCreated` | `{ projectId, name, description?, customerId?, startDate?, deadline?, budget, tags }` |
| `ProjectUpdated` | `{ changes }` |
| `ProjectStatusChanged` | `{ from, to, reason? }` |
| `ProjectMilestoneAdded` | `{ milestoneId, title, description?, dueDate }` |
| `ProjectMilestoneUpdated` | `{ milestoneId, changes }` |
| `ProjectMilestoneCompleted` | `{ milestoneId, completedAt }` |
| `ProjectMilestoneMissed` | `{ milestoneId, dueDate }` |
| `ProjectBudgetUpdated` | `{ oldBudget, newBudget }` |
| `ProjectSpendUpdated` | `{ totalSpent, delta, sourceType, sourceId }` |
| `ProjectOrderLinked` | `{ orderId }` |
| `ProjectInvoiceLinked` | `{ invoiceId }` |
| `ProjectCompleted` | `{ completedAt }` |
| `ProjectCancelled` | `{ reason?, cancelledAt }` |
| `ProjectTagged` | `{ tag }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `ProjectMilestoneCompleted` | Accountability Reactor | Auto-create accountability entry |
| `ProjectCompleted` | Dashboard KPI | Update completed projects count |
| `ProjectSpendUpdated` | Dashboard KPI | Update budget utilization |

---

## 4. Commands

| Command | Payload |
|---|---|
| `CreateProject` | `{ name, description?, customerId?, startDate?, deadline?, budget, currency, tags? }` |
| `UpdateProject` | `{ projectId, changes }` |
| `ChangeProjectStatus` | `{ projectId, newStatus, reason? }` |
| `AddMilestone` | `{ projectId, title, description?, dueDate }` |
| `UpdateMilestone` | `{ projectId, milestoneId, changes }` |
| `CompleteMilestone` | `{ projectId, milestoneId }` |
| `UpdateProjectBudget` | `{ projectId, newBudget }` |
| `LinkOrderToProject` | `{ projectId, orderId }` |
| `LinkInvoiceToProject` | `{ projectId, invoiceId }` |
| `CompleteProject` | `{ projectId }` |
| `CancelProject` | `{ projectId, reason? }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetProjectList` | `PaginatedResult<ProjectListDTO>` — filters: status, customerId, tags, dateRange |
| `GetProjectDetail` | `ProjectDetailDTO` — milestones, budget, linked entities |
| `GetProjectBudgetReport` | `{ budget, spent, remaining, linkedExpenses, linkedPurchases }` |
| `GetActiveProjects` | `ProjectListDTO[]` |
| `GetProjectProfitability` | `{ revenue (from linked invoices), costs (from linked expenses/purchases), profit }` |
| `GetProjectTimeline` | `TimelineEntry[]` — all events across linked entities |

---

## 6. Read Model: `rm_projects`

```typescript
interface ProjectListReadModel {
  id: string;
  name: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  status: ProjectStatus;
  startDate?: number;
  deadline?: number;
  budget: number;
  spent: number;
  budgetUtilization: number;         // spent / budget * 100
  currency: string;
  milestoneCount: number;
  completedMilestoneCount: number;
  linkedOrderCount: number;
  linkedInvoiceCount: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/projects/commands/CreateProject
POST   /api/v1/projects/commands/UpdateProject
POST   /api/v1/projects/commands/ChangeProjectStatus
POST   /api/v1/projects/commands/AddMilestone
POST   /api/v1/projects/commands/CompleteMilestone
POST   /api/v1/projects/commands/UpdateProjectBudget
POST   /api/v1/projects/commands/CompleteProject
POST   /api/v1/projects/commands/CancelProject

GET    /api/v1/projects
GET    /api/v1/projects/:id
GET    /api/v1/projects/:id/budget
GET    /api/v1/projects/:id/profitability
GET    /api/v1/projects/:id/timeline
GET    /api/v1/projects/:id/events
GET    /api/v1/projects/active
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/projects` | `ProjectPortfolioPage` — card grid with budget utilization bars |
| `/projects/:id` | `ProjectDetailPage` — tabs: Overview, Milestones, Budget, Orders, Invoices, Timeline |

### Key Components

- `ProjectCard.tsx` — Name, status, budget bar, milestone progress, deadline
- `ProjectMilestoneList.tsx` — Milestone checklist with due dates and status
- `ProjectBudgetChart.tsx` — Budget vs. spent bar/donut chart
- `ProjectProfitabilityCard.tsx` — Revenue vs. costs breakdown
- `CreateProjectDialog.tsx` — Modal form with customer selector, budget, dates
- `AddMilestoneDialog.tsx` — Modal for adding milestones
- `ProjectTimeline.tsx` — Cross-module event feed scoped to project
- `ProjectLinkedEntities.tsx` — Tabs for linked orders, invoices, expenses

---

## 9. Budget Tracking (Cross-Module Projection)

The `ProjectBudgetProjection` listens to:
- `ExpenseAllocatedToProject` → increment spent
- `ExpenseDeallocatedFromProject` → decrement spent
- `PurchaseAllocatedToProject` → increment spent
- `PurchaseCancelled` (if project-allocated) → decrement spent

This updates `rm_projects.spent` and `rm_projects.budgetUtilization` in real time.

---

## 10. Acceptance Criteria

- [ ] Can create projects with name, budget, optional customer, dates, tags
- [ ] Can add, update, complete milestones
- [ ] Milestone completion triggers accountability entry via reactor
- [ ] Budget tracking reflects linked expenses and purchases in real time
- [ ] Budget utilization percentage computes correctly
- [ ] Profitability report shows revenue (linked invoices) vs. costs
- [ ] Project detail page shows all linked entities across modules
- [ ] Status transitions follow the state machine
- [ ] Project timeline aggregates events from all linked entities
- [ ] All transitions produce domain events

---

## 11. File Manifest

```
server/src/domain/project/Project.ts
server/src/domain/project/Project.events.ts
server/src/domain/project/Project.errors.ts
server/src/domain/project/IProjectRepository.ts
server/src/domain/project/entities/Milestone.ts
server/src/application/commands/handlers/project/*
server/src/application/queries/handlers/project/*
server/src/application/dto/ProjectDTO.ts
server/src/application/events/reactors/ProjectMilestoneReactor.ts
server/src/infrastructure/projections/ProjectListProjection.ts
server/src/infrastructure/projections/ProjectBudgetProjection.ts
server/src/infrastructure/http/routes/projectRoutes.ts
server/src/infrastructure/http/controllers/ProjectController.ts
client/src/features/projects/**
```
