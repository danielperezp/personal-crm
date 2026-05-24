# NexusCommand — Personal CRM & Admin Management Platform

> **Codename:** NexusCommand
> **Version:** 0.1.0-spec
> **Author:** Daniel
> **Date:** 2026-04-07
> **Status:** Draft — Business Overview & Architecture Specification

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision & Problem Statement](#2-vision--problem-statement)
3. [Core Principles](#3-core-principles)
4. [Bounded Contexts & Domain Map](#4-bounded-contexts--domain-map)
5. [Domain Model — Aggregates & Entities](#5-domain-model--aggregates--entities)
6. [Event Catalog](#6-event-catalog)
7. [CQRS — Command & Query Separation](#7-cqrs--command--query-separation)
8. [Clean Architecture Layers](#8-clean-architecture-layers)
9. [Tech Stack](#9-tech-stack)
10. [Frontend Architecture (React)](#10-frontend-architecture-react)
11. [Backend Architecture (Express + TypeScript)](#11-backend-architecture-express--typescript)
12. [Firebase Infrastructure](#12-firebase-infrastructure)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [Module Breakdown](#14-module-breakdown)
15. [Read Model Projections](#15-read-model-projections)
16. [API Surface — REST + Command Bus](#16-api-surface--rest--command-bus)
17. [Cross-Cutting Concerns](#17-cross-cutting-concerns)
18. [Data Flow Diagrams](#18-data-flow-diagrams)
19. [Directory Structures](#19-directory-structures)
20. [Phased Roadmap](#20-phased-roadmap)
21. [Appendix — Glossary](#21-appendix--glossary)

---

## 1. Executive Summary

**NexusCommand** is a self-hosted, single-tenant personal CRM and administrative management platform designed to centralize every operational facet of a solo operator or micro-business into a single, event-sourced system of record. It replaces a patchwork of spreadsheets, SaaS tools, and manual tracking with a unified domain model spanning **15 core modules**: Customers, Invoices, Payments, Expenses, Receipts, Bills, Subscriptions, Utilities, Orders, Users (IAM), Accountability, Purchases, Projects, Assets, and Investments.

The system is built on an **Event Sourcing + CQRS** backbone with **Clean Architecture** enforced at every layer, producing a fully auditable, replay-able, and projection-flexible platform.

---

## 2. Vision & Problem Statement

### Problem

Managing personal or micro-business operations requires juggling disconnected tools — one for invoicing, another for expense tracking, a spreadsheet for assets, sticky notes for accountability. Data is siloed, audit trails are nonexistent, and cross-domain insights (e.g., "how do my subscriptions compare to my invoice revenue this quarter?") require manual reconciliation.

### Vision

A single command center where every financial event, customer interaction, project milestone, and asset lifecycle change is captured as an immutable event, projected into purpose-built read models, and surfaced through a clean, fast React dashboard — all powered by Firebase for zero-ops infrastructure.

### Non-Goals (V1)

- Multi-tenant SaaS (this is a personal/single-org tool)
- Mobile-native app (responsive web only for V1)
- Real-time collaboration (single primary user with optional secondary users)
- AI/ML features (deferred to V2+)

---

## 3. Core Principles

| Principle | Enforcement |
|---|---|
| **Event Sourcing as Truth** | All state changes are appended events. No direct mutation of aggregates. Projections are derived, never canonical. |
| **CQRS Strict Separation** | Commands mutate state via aggregates → events. Queries read from denormalized projections. Never query the event store directly for UI reads. |
| **Clean Architecture** | Dependency rule: Domain → Application → Infrastructure. No framework imports in domain layer. |
| **Domain-Driven Design** | Bounded contexts with explicit context maps. Aggregates own invariants. Domain events cross context boundaries via integration events. |
| **Firebase-Native Infra** | Firestore for event store + read models. Firebase Auth for identity. Cloud Functions for async projections. Cloud Storage for attachments. |
| **Type Safety Everywhere** | TypeScript strict mode on backend AND frontend. Branded types for IDs. Discriminated unions for events. |

---

## 4. Bounded Contexts & Domain Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NexusCommand Domain                         │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│   CUSTOMER   │   FINANCIAL  │  OPERATIONS  │    GOVERNANCE         │
│   CONTEXT    │   CONTEXT    │  CONTEXT     │    CONTEXT            │
├──────────────┼──────────────┼──────────────┼───────────────────────┤
│ • Customers  │ • Invoices   │ • Orders     │ • Users (IAM)         │
│              │ • Payments   │ • Projects   │ • Accountability      │
│              │ • Expenses   │ • Purchases  │                       │
│              │ • Receipts   │ • Assets     │                       │
│              │ • Bills      │ • Investments│                       │
│              │ • Subscript. │              │                       │
│              │ • Utilities  │              │                       │
└──────────────┴──────────────┴──────────────┴───────────────────────┘
```

### Context Map — Integration Patterns

| Upstream | Downstream | Pattern | Integration Event Example |
|---|---|---|---|
| Customer | Financial | Conformist | `CustomerCreated` → auto-create billing profile |
| Financial (Invoice) | Financial (Payment) | Published Language | `InvoiceIssued` → payment can reference it |
| Operations (Order) | Financial (Invoice) | ACL (Anti-Corruption Layer) | `OrderCompleted` → trigger invoice generation |
| Operations (Project) | Governance (Accountability) | Domain Events | `ProjectMilestoneReached` → log accountability entry |
| Financial (Payment) | Financial (Receipt) | Event-Carried State Transfer | `PaymentReceived` → auto-generate receipt |
| Governance (Users) | ALL | Shared Kernel | User identity referenced across all contexts |

---

## 5. Domain Model — Aggregates & Entities

### 5.1 Customer Context

#### Aggregate: `Customer`

```
Customer (Aggregate Root)
├── customerId: CustomerId          // Branded type
├── name: string
├── email: Email                    // Value Object
├── phone?: Phone                   // Value Object
├── company?: string
├── tags: Tag[]
├── addresses: Address[]            // Value Object[]
├── notes: Note[]                   // Entity
├── status: CustomerStatus          // Active | Archived | Prospect
├── source: AcquisitionSource       // Referral | Organic | Direct | Other
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Invariants:**
- Email must be unique across active customers.
- At least one address required for invoicing.
- Cannot archive a customer with open invoices.

---

### 5.2 Financial Context

#### Aggregate: `Invoice`

```
Invoice (Aggregate Root)
├── invoiceId: InvoiceId
├── customerId: CustomerId
├── invoiceNumber: InvoiceNumber     // Value Object — auto-incremented
├── lineItems: LineItem[]            // Entity
│   ├── description: string
│   ├── quantity: number
│   ├── unitPrice: Money             // Value Object
│   ├── taxRate: Percentage
│   └── subtotal: Money              // Computed
├── currency: CurrencyCode
├── subtotal: Money
├── taxTotal: Money
├── total: Money
├── status: InvoiceStatus            // Draft | Issued | Paid | Overdue | Cancelled | Void
├── issuedAt?: Timestamp
├── dueDate?: Timestamp
├── paidAt?: Timestamp
├── notes?: string
├── attachments: AttachmentRef[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Invariants:**
- Cannot issue an invoice with zero line items.
- Cannot mark as Paid without a linked Payment aggregate.
- `dueDate` must be ≥ `issuedAt`.
- Cannot void/cancel a Paid invoice (must issue credit note).

#### Aggregate: `Payment`

```
Payment (Aggregate Root)
├── paymentId: PaymentId
├── invoiceId?: InvoiceId            // Optional — standalone payments exist
├── customerId?: CustomerId
├── amount: Money
├── currency: CurrencyCode
├── method: PaymentMethod            // Cash | BankTransfer | Card | Crypto | Other
├── reference?: string               // External ref (transaction ID, check #)
├── status: PaymentStatus            // Pending | Completed | Failed | Refunded
├── receivedAt: Timestamp
├── reconciled: boolean
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Invariants:**
- If linked to an invoice, payment amount cannot exceed invoice remaining balance.
- Refund cannot exceed original payment amount.

#### Aggregate: `Expense`

```
Expense (Aggregate Root)
├── expenseId: ExpenseId
├── category: ExpenseCategory        // Enum — configurable
├── vendor?: string
├── description: string
├── amount: Money
├── currency: CurrencyCode
├── receiptId?: ReceiptId            // Link to Receipt aggregate
├── billId?: BillId                  // Link to Bill if recurring
├── projectId?: ProjectId            // Allocate to project
├── date: Timestamp
├── isDeductible: boolean
├── tags: Tag[]
├── status: ExpenseStatus            // Pending | Approved | Rejected | Reimbursed
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `Receipt`

```
Receipt (Aggregate Root)
├── receiptId: ReceiptId
├── paymentId?: PaymentId
├── expenseId?: ExpenseId
├── vendor: string
├── amount: Money
├── date: Timestamp
├── attachmentUrl: string            // Firebase Storage ref
├── ocrData?: OcrExtraction          // Value Object — future OCR
├── verified: boolean
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `Bill`

```
Bill (Aggregate Root)
├── billId: BillId
├── vendor: string
├── description: string
├── amount: Money
├── currency: CurrencyCode
├── frequency: BillingFrequency      // OneTime | Monthly | Quarterly | Annual
├── dueDate: Timestamp
├── autoPay: boolean
├── status: BillStatus               // Upcoming | Due | Paid | Overdue | Cancelled
├── linkedExpenses: ExpenseId[]
├── category: ExpenseCategory
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Invariants:**
- Recurring bills must have a frequency ≠ OneTime.
- Cannot cancel a bill that has linked paid expenses in the current cycle.

#### Aggregate: `Subscription`

```
Subscription (Aggregate Root)
├── subscriptionId: SubscriptionId
├── provider: string
├── plan: string
├── amount: Money
├── currency: CurrencyCode
├── billingCycle: BillingCycle        // Monthly | Quarterly | Annual
├── startDate: Timestamp
├── nextBillingDate: Timestamp
├── endDate?: Timestamp
├── autoRenew: boolean
├── category: SubscriptionCategory   // Software | Service | Media | Other
├── status: SubscriptionStatus       // Active | Paused | Cancelled | Expired
├── linkedBillIds: BillId[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `Utility`

```
Utility (Aggregate Root)
├── utilityId: UtilityId
├── provider: string
├── type: UtilityType                // Electricity | Water | Gas | Internet | Phone | Other
├── accountNumber?: string
├── currentReading?: MeterReading    // Value Object
├── monthlyAverage: Money
├── status: UtilityStatus            // Active | Disconnected | Transferred
├── linkedBillIds: BillId[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

---

### 5.3 Operations Context

#### Aggregate: `Order`

```
Order (Aggregate Root)
├── orderId: OrderId
├── customerId: CustomerId
├── items: OrderItem[]               // Entity
│   ├── name: string
│   ├── quantity: number
│   ├── unitPrice: Money
│   └── status: OrderItemStatus
├── total: Money
├── status: OrderStatus              // Pending | Confirmed | InProgress | Shipped | Delivered | Cancelled
├── shippingAddress?: Address
├── invoiceId?: InvoiceId
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Invariants:**
- Cannot ship an order without a confirmed status.
- Cancellation triggers refund flow if payment was already made.

#### Aggregate: `Purchase`

```
Purchase (Aggregate Root)
├── purchaseId: PurchaseId
├── vendor: string
├── items: PurchaseItem[]
│   ├── name: string
│   ├── quantity: number
│   ├── unitCost: Money
│   └── received: boolean
├── totalCost: Money
├── status: PurchaseStatus           // Requested | Approved | Ordered | Received | Cancelled
├── expenseId?: ExpenseId
├── projectId?: ProjectId
├── expectedDelivery?: Timestamp
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `Project`

```
Project (Aggregate Root)
├── projectId: ProjectId
├── name: string
├── description?: string
├── customerId?: CustomerId
├── status: ProjectStatus            // Planning | Active | OnHold | Completed | Cancelled
├── startDate?: Timestamp
├── deadline?: Timestamp
├── budget: Money
├── spent: Money                     // Derived from linked expenses/purchases
├── milestones: Milestone[]          // Entity
│   ├── milestoneId: MilestoneId
│   ├── title: string
│   ├── dueDate: Timestamp
│   ├── status: MilestoneStatus
│   └── completedAt?: Timestamp
├── linkedOrderIds: OrderId[]
├── linkedInvoiceIds: InvoiceId[]
├── tags: Tag[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `Asset`

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
├── maintenanceLog: MaintenanceEntry[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `Investment`

```
Investment (Aggregate Root)
├── investmentId: InvestmentId
├── name: string
├── type: InvestmentType             // Stock | Bond | Crypto | RealEstate | Business | Fund | Other
├── platform?: string
├── ticker?: string
├── purchaseDate: Timestamp
├── purchasePrice: Money
├── quantity: number
├── currentPrice: Money              // Manually updated or via integration
├── totalValue: Money                // quantity * currentPrice
├── unrealizedGain: Money            // totalValue - (purchasePrice * quantity)
├── status: InvestmentStatus         // Active | Sold | Matured | WrittenOff
├── soldAt?: Timestamp
├── salePrice?: Money
├── realizedGain?: Money
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

---

### 5.4 Governance Context

#### Aggregate: `User`

```
User (Aggregate Root)
├── userId: UserId
├── firebaseUid: string              // Firebase Auth UID
├── email: Email
├── displayName: string
├── role: UserRole                   // Owner | Admin | Viewer
├── permissions: Permission[]
├── status: UserStatus               // Active | Suspended | Deactivated
├── lastLoginAt?: Timestamp
├── preferences: UserPreferences     // Value Object
│   ├── theme: 'light' | 'dark'
│   ├── currency: CurrencyCode
│   ├── dateFormat: string
│   └── timezone: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

#### Aggregate: `AccountabilityEntry`

```
AccountabilityEntry (Aggregate Root)
├── entryId: AccountabilityId
├── userId: UserId
├── type: AccountabilityType         // Goal | Task | Habit | Milestone | Review
├── title: string
├── description?: string
├── targetDate?: Timestamp
├── status: AccountabilityStatus     // Open | InProgress | Completed | Failed | Deferred
├── linkedProjectId?: ProjectId
├── linkedInvestmentId?: InvestmentId
├── metrics?: Record<string, number> // KPIs
├── evidence: EvidenceItem[]         // Attachments, links, notes
├── reviewNotes?: string
├── completedAt?: Timestamp
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

---

## 6. Event Catalog

All events follow this envelope:

```typescript
interface DomainEvent<T = unknown> {
  eventId: string;           // UUID v4
  aggregateId: string;
  aggregateType: string;
  eventType: string;         // Discriminated union tag
  version: number;           // Aggregate version (optimistic concurrency)
  payload: T;
  metadata: {
    userId: string;
    correlationId: string;   // Ties related commands/events
    causationId: string;     // The command or event that caused this
    timestamp: number;       // Unix ms
  };
}
```

### Event Types per Aggregate (representative, not exhaustive)

| Aggregate | Events |
|---|---|
| **Customer** | `CustomerCreated`, `CustomerUpdated`, `CustomerArchived`, `CustomerReactivated`, `CustomerNoteAdded`, `CustomerTagged` |
| **Invoice** | `InvoiceDrafted`, `InvoiceLineItemAdded`, `InvoiceLineItemRemoved`, `InvoiceIssued`, `InvoiceMarkedPaid`, `InvoiceVoided`, `InvoiceCancelled`, `InvoiceOverdue` |
| **Payment** | `PaymentRecorded`, `PaymentCompleted`, `PaymentFailed`, `PaymentRefunded`, `PaymentReconciled` |
| **Expense** | `ExpenseRecorded`, `ExpenseCategorized`, `ExpenseApproved`, `ExpenseRejected`, `ExpenseLinkedToReceipt`, `ExpenseAllocatedToProject` |
| **Receipt** | `ReceiptUploaded`, `ReceiptLinkedToPayment`, `ReceiptVerified`, `ReceiptOcrProcessed` |
| **Bill** | `BillCreated`, `BillDueReminder`, `BillPaid`, `BillOverdue`, `BillCancelled`, `BillRecurrenceTriggered` |
| **Subscription** | `SubscriptionStarted`, `SubscriptionRenewed`, `SubscriptionPaused`, `SubscriptionCancelled`, `SubscriptionExpired`, `SubscriptionPlanChanged` |
| **Utility** | `UtilityRegistered`, `UtilityReadingRecorded`, `UtilityBillLinked`, `UtilityDisconnected` |
| **Order** | `OrderPlaced`, `OrderConfirmed`, `OrderItemStatusChanged`, `OrderShipped`, `OrderDelivered`, `OrderCancelled` |
| **Purchase** | `PurchaseRequested`, `PurchaseApproved`, `PurchaseOrdered`, `PurchaseReceived`, `PurchaseCancelled` |
| **Project** | `ProjectCreated`, `ProjectStatusChanged`, `ProjectMilestoneAdded`, `ProjectMilestoneCompleted`, `ProjectBudgetUpdated`, `ProjectCompleted` |
| **Asset** | `AssetRegistered`, `AssetValueUpdated`, `AssetDepreciated`, `AssetMaintenanceLogged`, `AssetDisposed`, `AssetSold` |
| **Investment** | `InvestmentAcquired`, `InvestmentPriceUpdated`, `InvestmentSold`, `InvestmentDividendReceived`, `InvestmentWrittenOff` |
| **User** | `UserRegistered`, `UserRoleChanged`, `UserSuspended`, `UserReactivated`, `UserPreferencesUpdated` |
| **Accountability** | `AccountabilityEntryCreated`, `AccountabilityStatusChanged`, `AccountabilityEvidenceAdded`, `AccountabilityReviewed`, `AccountabilityCompleted` |

---

## 7. CQRS — Command & Query Separation

### Command Side

```
[Client] → [REST API] → [Command Bus] → [Command Handler]
                                              │
                                              ▼
                                     [Aggregate.apply(event)]
                                              │
                                              ▼
                                     [Event Store (Firestore)]
                                              │
                                              ▼
                                     [Event Bus (publish)]
                                              │
                                              ▼
                                     [Projectors / Reactors]
```

### Query Side

```
[Client] → [REST API] → [Query Bus] → [Query Handler]
                                            │
                                            ▼
                                   [Read Model (Firestore)]
                                            │
                                            ▼
                                   [Response DTO]
```

### Command Examples

```typescript
// Commands are imperative — they tell the system to do something
interface CreateCustomerCommand {
  type: 'CreateCustomer';
  payload: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address: AddressDTO;
  };
  metadata: CommandMetadata;
}

interface IssueInvoiceCommand {
  type: 'IssueInvoice';
  payload: { invoiceId: string };
  metadata: CommandMetadata;
}

interface RecordPaymentCommand {
  type: 'RecordPayment';
  payload: {
    invoiceId?: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    reference?: string;
  };
  metadata: CommandMetadata;
}
```

### Query Examples

```typescript
// Queries are declarative — they ask for data
interface GetCustomerDashboardQuery {
  type: 'GetCustomerDashboard';
  payload: { customerId: string };
}

interface GetMonthlyExpenseBreakdownQuery {
  type: 'GetMonthlyExpenseBreakdown';
  payload: { year: number; month: number };
}

interface GetProjectProfitabilityQuery {
  type: 'GetProjectProfitability';
  payload: { projectId: string };
}
```

---

## 8. Clean Architecture Layers

```
┌──────────────────────────────────────────┐
│            PRESENTATION LAYER            │
│         (React Components, Pages)        │
├──────────────────────────────────────────┤
│          INFRASTRUCTURE LAYER            │
│   (Express Routes, Firestore Repos,      │
│    Firebase Auth, Cloud Functions)        │
├──────────────────────────────────────────┤
│           APPLICATION LAYER              │
│  (Command Handlers, Query Handlers,      │
│   Event Handlers, DTOs, Use Cases)       │
├──────────────────────────────────────────┤
│             DOMAIN LAYER                 │
│  (Aggregates, Entities, Value Objects,   │
│   Domain Events, Repository Interfaces,  │
│   Domain Services)                       │
└──────────────────────────────────────────┘
        ▲ Dependency Rule: Inward Only ▲
```

### Dependency Rule Enforcement

- **Domain Layer** — Zero external imports. Pure TypeScript. No Firebase, no Express, no React.
- **Application Layer** — Depends only on Domain. Defines ports (interfaces) for infrastructure.
- **Infrastructure Layer** — Implements ports. Contains Firestore adapters, Express controllers, Firebase Auth adapter.
- **Presentation Layer** — React components. Calls application layer via API client. No direct infra access.

---

## 9. Tech Stack

### Frontend

| Concern | Technology |
|---|---|
| Framework | React 18+ with TypeScript |
| Routing | React Router v6 |
| State Management | Zustand (global) + React Query / TanStack Query (server state) |
| Forms | React Hook Form + Zod validation |
| UI Library | Shadcn/UI + Tailwind CSS |
| Charts | Recharts |
| Tables | TanStack Table |
| Date Handling | date-fns |
| HTTP Client | Axios with typed interceptors |
| Auth | Firebase Auth SDK (client) |
| Build | Vite |
| Testing | Vitest + React Testing Library |

### Backend

| Concern | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js 4.x |
| Language | TypeScript 5.x (strict mode) |
| Event Store | Firestore (events collection, partitioned by aggregate) |
| Read Models | Firestore (separate collections per projection) |
| Event Bus | In-process EventEmitter (V1) → Cloud Pub/Sub (V2) |
| Command Bus | Custom in-process bus with middleware pipeline |
| Query Bus | Custom in-process bus |
| Auth | Firebase Admin SDK (token verification) |
| File Storage | Firebase Cloud Storage |
| Scheduled Jobs | Firebase Cloud Functions (scheduled) |
| Validation | Zod (shared schemas) |
| Logging | Pino |
| Testing | Vitest + Supertest |
| API Docs | OpenAPI 3.1 via zod-to-openapi |

### Firebase Services

| Service | Purpose |
|---|---|
| **Authentication** | User identity, sign-in methods, JWT verification |
| **Firestore** | Event store, read model projections, system config |
| **Cloud Functions** | Async event processing, scheduled projections, cron jobs (bill reminders, subscription renewals) |
| **Cloud Storage** | Receipt images, invoice PDFs, asset photos, attachment storage |
| **Hosting** | Frontend React SPA deployment |
| **Security Rules** | Firestore access control (secondary to backend auth) |

---

## 10. Frontend Architecture (React)

### Page Structure

```
/                           → Dashboard (KPI overview)
/customers                  → Customer list
/customers/:id              → Customer detail + timeline
/invoices                   → Invoice list + filters
/invoices/new               → Create/edit invoice
/invoices/:id               → Invoice detail + payment history
/payments                   → Payments ledger
/expenses                   → Expense tracker
/receipts                   → Receipt gallery + uploads
/bills                      → Bills & due dates
/subscriptions              → Active subscriptions overview
/utilities                  → Utility accounts + usage
/orders                     → Order management
/orders/:id                 → Order detail + fulfillment
/purchases                  → Purchase requests + tracking
/projects                   → Project portfolio
/projects/:id               → Project detail + milestones + budget
/assets                     → Asset registry
/investments                → Investment portfolio + performance
/accountability             → Goals, tasks, habits tracker
/settings                   → User preferences, categories, config
/settings/users             → User management (IAM)
```

### Component Architecture (Atomic Design)

```
src/
├── components/
│   ├── atoms/               # Button, Input, Badge, Avatar, Tooltip
│   ├── molecules/           # SearchBar, StatCard, FormField, DatePicker
│   ├── organisms/           # DataTable, Sidebar, CommandPalette, InvoiceForm
│   ├── templates/           # DashboardLayout, DetailLayout, FormLayout
│   └── pages/               # Route-level components
├── features/
│   ├── customers/
│   │   ├── hooks/           # useCustomers, useCustomerDetail
│   │   ├── components/      # CustomerCard, CustomerTimeline
│   │   ├── api/             # customerApi.ts
│   │   └── types/           # customer.types.ts
│   ├── invoices/
│   ├── payments/
│   ├── expenses/
│   ├── receipts/
│   ├── bills/
│   ├── subscriptions/
│   ├── utilities/
│   ├── orders/
│   ├── purchases/
│   ├── projects/
│   ├── assets/
│   ├── investments/
│   ├── accountability/
│   └── users/
├── stores/                  # Zustand stores (auth, ui, preferences)
├── lib/                     # Axios instance, Firebase client init, utils
├── hooks/                   # Shared hooks (useDebounce, useMediaQuery)
├── types/                   # Shared types, DTOs, enums
└── styles/                  # Tailwind config, global styles, theme tokens
```

### Dashboard KPIs (Landing Page)

The dashboard surfaces cross-domain insights:

- **Revenue Snapshot**: Total invoiced (MTD/YTD), outstanding, overdue
- **Cash Flow**: Income vs. expenses trend chart (Recharts line/bar)
- **Subscription Burn**: Total monthly recurring cost, upcoming renewals
- **Bills Due**: Next 7 days, overdue count
- **Project Health**: Active projects with budget utilization bars
- **Investment Portfolio**: Total value, unrealized P&L, allocation pie chart
- **Accountability Score**: Goals on track vs. overdue
- **Recent Activity**: Unified event timeline across all modules

---

## 11. Backend Architecture (Express + TypeScript)

### Server Bootstrap

```typescript
// src/main.ts
const app = express();

// Middleware pipeline
app.use(cors(corsConfig));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(requestIdMiddleware);        // Attach correlationId
app.use(loggingMiddleware);          // Pino structured logs
app.use(authMiddleware);             // Firebase token verification
app.use(rateLimitMiddleware);

// Route registration
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
// ... all 15 modules

// Error handling
app.use(errorHandlerMiddleware);
```

### Command Handler Pattern

```typescript
// src/application/commands/handlers/CreateCustomerHandler.ts
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
  constructor(
    private readonly eventStore: IEventStore,
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<void> {
    // 1. Validate uniqueness (domain service)
    await this.customerRepo.ensureEmailUnique(command.payload.email);

    // 2. Create aggregate & apply domain event
    const customer = Customer.create(command.payload);

    // 3. Persist events to event store
    await this.eventStore.save(
      customer.id,
      'Customer',
      customer.getUncommittedEvents(),
      customer.version,
    );

    // 4. Events are published post-commit by the event store
  }
}
```

### Event Store (Firestore Implementation)

```
Firestore Collections:

events/
├── {aggregateId}/
│   ├── metadata: { aggregateType, latestVersion }
│   └── events/ (subcollection)
│       ├── {eventId}: { eventType, version, payload, metadata, timestamp }
│       ├── {eventId}: { ... }
│       └── ...

Indexes:
- events/{aggregateId}/events → compound index on (version ASC)
- Global collectionGroup query on events by eventType + timestamp (for projections)
```

### Projection Pattern

```typescript
// src/infrastructure/projections/CustomerListProjection.ts
export class CustomerListProjection implements IProjection {
  readonly subscribedEvents = ['CustomerCreated', 'CustomerUpdated', 'CustomerArchived'];

  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'CustomerCreated':
        await this.readModelRepo.upsert('customer_list', event.aggregateId, {
          id: event.aggregateId,
          name: event.payload.name,
          email: event.payload.email,
          status: 'Active',
          createdAt: event.metadata.timestamp,
        });
        break;
      case 'CustomerArchived':
        await this.readModelRepo.update('customer_list', event.aggregateId, {
          status: 'Archived',
        });
        break;
    }
  }
}
```

---

## 12. Firebase Infrastructure

### Firestore Schema

```
Root Collections:

/events/{aggregateId}                    → Event stream metadata
/events/{aggregateId}/events/{eventId}   → Individual domain events

/rm_customers/{customerId}               → Customer list read model
/rm_customer_details/{customerId}        → Customer detail read model
/rm_invoices/{invoiceId}                 → Invoice list read model
/rm_invoice_details/{invoiceId}          → Invoice detail read model
/rm_payments/{paymentId}                 → Payment ledger read model
/rm_expenses/{expenseId}                 → Expense list read model
/rm_receipts/{receiptId}                 → Receipt gallery read model
/rm_bills/{billId}                       → Bills read model
/rm_subscriptions/{subscriptionId}       → Subscription list read model
/rm_utilities/{utilityId}                → Utility accounts read model
/rm_orders/{orderId}                     → Order list read model
/rm_purchases/{purchaseId}               → Purchase list read model
/rm_projects/{projectId}                 → Project list read model
/rm_assets/{assetId}                     → Asset registry read model
/rm_investments/{investmentId}           → Investment portfolio read model
/rm_accountability/{entryId}             → Accountability tracker read model
/rm_users/{userId}                       → User list read model

/rm_dashboard/{userId}                   → Aggregated dashboard KPIs
/rm_monthly_summary/{yyyy-mm}            → Monthly financial summaries
/rm_cash_flow/{yyyy-mm}                  → Cash flow projections

/system/config                           → App config, categories, enums
/system/sequences                        → Auto-increment counters (invoice #)
```

### Cloud Functions

```typescript
// Async Event Processors (triggered by Firestore writes to events collection)
onDocumentCreated('events/{aggregateId}/events/{eventId}', async (event) => {
  const domainEvent = event.data;
  await projectionEngine.dispatch(domainEvent);
});

// Scheduled Jobs
schedule('every 24 hours').onRun(async () => {
  await billReminderService.checkOverdueBills();
  await subscriptionService.processRenewals();
  await assetService.runDepreciationCycle();
});
```

---

## 13. Authentication & Authorization

### Auth Flow

```
[React SPA] → Firebase Auth SDK → [Sign In]
                                        │
                                        ▼
                                   [Firebase JWT]
                                        │
                                        ▼
[API Request] → Authorization: Bearer {jwt}
                                        │
                                        ▼
                            [Express Auth Middleware]
                            firebase.auth().verifyIdToken(jwt)
                                        │
                                        ▼
                            [Attach userId + role to request context]
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Owner** | Full CRUD on all modules. User management. System config. Event replay. |
| **Admin** | Full CRUD on all modules except user management and system config. |
| **Viewer** | Read-only access to all modules. Cannot execute commands. |

### Permission Matrix (per module)

```typescript
type Permission =
  | 'customers:read' | 'customers:write'
  | 'invoices:read'  | 'invoices:write'
  | 'payments:read'  | 'payments:write'
  | 'expenses:read'  | 'expenses:write'
  | 'projects:read'  | 'projects:write'
  // ... per module
  | 'users:manage'
  | 'system:config'
  | 'events:replay';
```

---

## 14. Module Breakdown

| # | Module | Aggregate | Key Use Cases |
|---|---|---|---|
| 1 | **Customers** | Customer | Add/edit customers, tag, track interaction history, link to invoices/orders/projects |
| 2 | **Invoices** | Invoice | Draft, issue, track payment status, generate PDF, send reminders |
| 3 | **Payments** | Payment | Record inbound payments, link to invoices, reconcile, track methods |
| 4 | **Expenses** | Expense | Log outgoing money, categorize, link receipts, allocate to projects |
| 5 | **Receipts** | Receipt | Upload/photograph receipts, link to expenses/payments, future OCR |
| 6 | **Bills** | Bill | Track recurring/one-time bills, due dates, auto-link to expense on payment |
| 7 | **Subscriptions** | Subscription | Track SaaS/service subscriptions, renewal dates, monthly burn rate |
| 8 | **Utilities** | Utility | Track utility providers, meter readings, bill history |
| 9 | **Orders** | Order | Manage customer orders, fulfillment status, link to invoices |
| 10 | **Users** | User | IAM — manage users, roles, permissions, preferences |
| 11 | **Accountability** | AccountabilityEntry | Set goals/tasks/habits, track progress, link to projects/investments |
| 12 | **Purchases** | Purchase | Track outgoing purchase orders from vendors, receiving, cost tracking |
| 13 | **Projects** | Project | Manage projects with milestones, budgets, timelines, link everything |
| 14 | **Assets** | Asset | Register owned assets, depreciation, maintenance logs, disposal |
| 15 | **Investments** | Investment | Track portfolio, P&L, dividends, allocation |

---

## 15. Read Model Projections

| Projection | Source Events | Purpose |
|---|---|---|
| `CustomerListProjection` | CustomerCreated, Updated, Archived | Paginated customer table |
| `CustomerDetailProjection` | All Customer + linked Invoice, Order, Project events | 360° customer view |
| `InvoiceListProjection` | InvoiceDrafted, Issued, MarkedPaid, Voided | Invoice table with status filters |
| `PaymentLedgerProjection` | PaymentRecorded, Completed, Refunded | Full payment history |
| `ExpenseByCategoryProjection` | ExpenseRecorded, Categorized | Category breakdown charts |
| `MonthlyFinancialSummary` | Invoice, Payment, Expense events | Revenue, costs, profit per month |
| `CashFlowProjection` | Payment, Expense, Bill, Subscription events | Running cash flow timeline |
| `SubscriptionBurnProjection` | SubscriptionStarted, Renewed, Cancelled | Monthly SaaS burn rate |
| `ProjectBudgetProjection` | Expense, Purchase events allocated to projects | Budget utilization per project |
| `InvestmentPortfolioProjection` | InvestmentAcquired, PriceUpdated, Sold | Portfolio valuation + P&L |
| `AssetDepreciationProjection` | AssetRegistered, Depreciated, Disposed | Asset book value over time |
| `DashboardKPIProjection` | Aggregation of all above | Single-read dashboard payload |
| `AccountabilityScoreProjection` | AccountabilityEntry events | Goal completion rates |
| `ActivityTimelineProjection` | ALL events | Unified cross-module activity feed |

---

## 16. API Surface — REST + Command Bus

### URL Pattern Convention

```
POST   /api/v1/{module}/commands/{commandName}   → Execute command
GET    /api/v1/{module}                           → List (read model)
GET    /api/v1/{module}/:id                       → Detail (read model)
GET    /api/v1/{module}/:id/events                → Event history (audit)
```

### Examples

```
POST   /api/v1/customers/commands/CreateCustomer
POST   /api/v1/customers/commands/ArchiveCustomer
GET    /api/v1/customers?status=Active&page=1&limit=20
GET    /api/v1/customers/cust_abc123
GET    /api/v1/customers/cust_abc123/events

POST   /api/v1/invoices/commands/DraftInvoice
POST   /api/v1/invoices/commands/IssueInvoice
POST   /api/v1/invoices/commands/RecordPayment
GET    /api/v1/invoices?status=Overdue&from=2026-01-01
GET    /api/v1/invoices/inv_xyz789

GET    /api/v1/dashboard                           → Aggregated KPIs
GET    /api/v1/reports/cash-flow?year=2026
GET    /api/v1/reports/expense-breakdown?month=2026-04

POST   /api/v1/receipts/upload                     → Multipart file upload
```

---

## 17. Cross-Cutting Concerns

### Optimistic Concurrency

Every aggregate carries a `version` number. When saving events, the event store checks that the expected version matches the current version in Firestore. Conflicts return `409 Conflict`.

### Idempotency

Commands carry a `commandId` (UUID). The event store deduplicates by checking if an event with that `causationId` already exists.

### Correlation & Causation Tracking

```
Command (correlationId: X, commandId: Y)
  └─▶ Event (correlationId: X, causationId: Y)
       └─▶ Reactor triggers new Command (correlationId: X, causationId: eventId)
            └─▶ Event (correlationId: X, causationId: newCommandId)
```

This chain enables full traceability from user action → all downstream effects.

### Error Handling

```typescript
// Domain errors — thrown by aggregates
class InvoiceAlreadyIssuedError extends DomainError {}
class InsufficientBudgetError extends DomainError {}
class CustomerEmailConflictError extends DomainError {}

// Application errors — thrown by handlers
class CustomerNotFoundError extends ApplicationError {}
class UnauthorizedCommandError extends ApplicationError {}

// All mapped to HTTP status codes by error middleware
DomainError         → 422 Unprocessable Entity
ApplicationError    → 400 / 404
AuthError           → 401 / 403
ConcurrencyError    → 409 Conflict
Unknown             → 500
```

### Audit Trail

Every state change is inherently audited via event sourcing. The `metadata.userId` and `metadata.timestamp` on each event provide a complete audit log. The `/events` endpoint per aggregate exposes this for UI consumption.

---

## 18. Data Flow Diagrams

### Invoice Lifecycle

```
[User]──▶ DraftInvoice Command
              │
              ▼
        Invoice.draft()
              │
              ▼
        InvoiceDrafted Event ──▶ InvoiceListProjection (status: Draft)
              │
[User]──▶ IssueInvoice Command
              │
              ▼
        Invoice.issue()
              │
              ▼
        InvoiceIssued Event ──▶ InvoiceListProjection (status: Issued)
                            ──▶ CustomerDetailProjection (add to invoices)
                            ──▶ DashboardKPI (increment outstanding)
              │
[User]──▶ RecordPayment Command
              │
              ▼
        Payment.record() ──▶ PaymentRecorded Event
              │                     │
              ▼                     ▼
        Invoice.markPaid()   PaymentLedgerProjection
              │
              ▼
        InvoiceMarkedPaid Event ──▶ InvoiceListProjection (status: Paid)
                                ──▶ MonthlyFinancialSummary (add revenue)
                                ──▶ Receipt auto-generation reactor
```

### Expense → Receipt → Bill Flow

```
[User uploads receipt image]
              │
              ▼
        ReceiptUploaded Event
              │
[User]──▶ RecordExpense Command (with receiptId)
              │
              ▼
        ExpenseRecorded Event ──▶ ExpenseListProjection
                              ──▶ CashFlowProjection (outflow)
                              ──▶ If projectId: ProjectBudgetProjection
              │
        ReceiptLinkedToExpense Event ──▶ ReceiptProjection (linked: true)
              │
        If linked to Bill:
              ▼
        BillPaid Event ──▶ BillProjection (status: Paid)
```

---

## 19. Directory Structures

### Backend

```
server/
├── src/
│   ├── domain/                          # ZERO external dependencies
│   │   ├── shared/
│   │   │   ├── ValueObject.ts
│   │   │   ├── AggregateRoot.ts
│   │   │   ├── DomainEvent.ts
│   │   │   ├── DomainError.ts
│   │   │   ├── Entity.ts
│   │   │   └── types/
│   │   │       ├── branded.ts           # CustomerId, InvoiceId, etc.
│   │   │       └── money.ts             # Money value object
│   │   ├── customer/
│   │   │   ├── Customer.ts              # Aggregate root
│   │   │   ├── Customer.events.ts       # Event type definitions
│   │   │   ├── Customer.errors.ts       # Domain errors
│   │   │   ├── vo/                      # Value objects (Email, Phone, Address)
│   │   │   └── ICustomerRepository.ts   # Port (interface only)
│   │   ├── invoice/
│   │   ├── payment/
│   │   ├── expense/
│   │   ├── receipt/
│   │   ├── bill/
│   │   ├── subscription/
│   │   ├── utility/
│   │   ├── order/
│   │   ├── purchase/
│   │   ├── project/
│   │   ├── asset/
│   │   ├── investment/
│   │   ├── user/
│   │   └── accountability/
│   │
│   ├── application/
│   │   ├── commands/
│   │   │   ├── bus/
│   │   │   │   ├── ICommandBus.ts
│   │   │   │   └── InProcessCommandBus.ts
│   │   │   └── handlers/
│   │   │       ├── customer/
│   │   │       │   ├── CreateCustomerHandler.ts
│   │   │       │   ├── UpdateCustomerHandler.ts
│   │   │       │   └── ArchiveCustomerHandler.ts
│   │   │       ├── invoice/
│   │   │       └── ... (per module)
│   │   ├── queries/
│   │   │   ├── bus/
│   │   │   │   ├── IQueryBus.ts
│   │   │   │   └── InProcessQueryBus.ts
│   │   │   └── handlers/
│   │   │       ├── customer/
│   │   │       │   ├── GetCustomerListHandler.ts
│   │   │       │   └── GetCustomerDetailHandler.ts
│   │   │       └── ... (per module)
│   │   ├── events/
│   │   │   ├── bus/
│   │   │   │   ├── IEventBus.ts
│   │   │   │   └── InProcessEventBus.ts
│   │   │   └── reactors/
│   │   │       ├── InvoicePaidReactor.ts
│   │   │       ├── BillRecurrenceReactor.ts
│   │   │       └── SubscriptionRenewalReactor.ts
│   │   ├── dto/
│   │   │   ├── CustomerDTO.ts
│   │   │   ├── InvoiceDTO.ts
│   │   │   └── ...
│   │   └── ports/
│   │       ├── IEventStore.ts
│   │       ├── IReadModelRepository.ts
│   │       └── IFileStorage.ts
│   │
│   ├── infrastructure/
│   │   ├── firebase/
│   │   │   ├── firebaseAdmin.ts         # Firebase Admin SDK init
│   │   │   ├── FirestoreEventStore.ts   # IEventStore implementation
│   │   │   ├── FirestoreReadModelRepo.ts
│   │   │   └── FirebaseStorageAdapter.ts
│   │   ├── projections/
│   │   │   ├── ProjectionEngine.ts
│   │   │   ├── CustomerListProjection.ts
│   │   │   ├── InvoiceListProjection.ts
│   │   │   ├── DashboardKPIProjection.ts
│   │   │   └── ... (per read model)
│   │   ├── auth/
│   │   │   └── FirebaseAuthMiddleware.ts
│   │   ├── http/
│   │   │   ├── routes/
│   │   │   │   ├── customerRoutes.ts
│   │   │   │   ├── invoiceRoutes.ts
│   │   │   │   └── ...
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts
│   │   │   │   ├── requestId.ts
│   │   │   │   ├── rateLimiter.ts
│   │   │   │   └── validation.ts
│   │   │   └── controllers/
│   │   │       ├── CustomerController.ts
│   │   │       └── ...
│   │   └── di/
│   │       └── container.ts             # Dependency injection wiring
│   │
│   ├── shared/
│   │   ├── validation/
│   │   │   └── schemas.ts               # Zod schemas (shared w/ frontend)
│   │   └── constants/
│   │       └── enums.ts
│   │
│   └── main.ts                          # App entry point
│
├── functions/                           # Firebase Cloud Functions
│   ├── src/
│   │   ├── projectionTrigger.ts         # Firestore-triggered projection
│   │   ├── scheduledJobs.ts             # Cron: bill reminders, renewals
│   │   └── index.ts
│   └── package.json
│
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── tsconfig.json
├── package.json
└── vitest.config.ts
```

### Frontend

```
client/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── expenses/
│   │   ├── receipts/
│   │   ├── bills/
│   │   ├── subscriptions/
│   │   ├── utilities/
│   │   ├── orders/
│   │   ├── purchases/
│   │   ├── projects/
│   │   ├── assets/
│   │   ├── investments/
│   │   ├── accountability/
│   │   └── users/
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── preferencesStore.ts
│   ├── lib/
│   │   ├── api.ts                       # Axios instance + interceptors
│   │   ├── firebase.ts                  # Client SDK init
│   │   ├── queryClient.ts              # TanStack Query setup
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   │   ├── dto.ts                       # Shared with backend
│   │   └── enums.ts
│   └── styles/
│       ├── globals.css
│       └── tailwind.config.ts
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 20. Phased Roadmap

### Phase 1 — Foundation (Weeks 1–4)

- [ ] Project scaffolding (monorepo: client + server + functions + shared)
- [ ] Domain layer: shared base classes (AggregateRoot, DomainEvent, ValueObject, branded types)
- [ ] Event Store: Firestore implementation with optimistic concurrency
- [ ] Command Bus + Query Bus: in-process implementations
- [ ] Projection Engine: Firestore-backed with event dispatch
- [ ] Firebase Auth integration (backend middleware + React auth context)
- [ ] Express server bootstrap with error handling, logging, request ID
- [ ] React app scaffold with routing, Tailwind, Shadcn/UI, TanStack Query
- [ ] **Module: Users (IAM)** — full CRUD, roles, permissions

### Phase 2 — Core CRM (Weeks 5–8)

- [ ] **Module: Customers** — aggregate, events, projections, UI (list, detail, timeline)
- [ ] **Module: Invoices** — draft → issue → pay lifecycle, PDF generation, line items
- [ ] **Module: Payments** — record, reconcile, link to invoices, payment ledger
- [ ] **Module: Orders** — place, fulfill, link to customers + invoices
- [ ] Dashboard V1: revenue snapshot, recent activity feed

### Phase 3 — Financial Tracking (Weeks 9–12)

- [ ] **Module: Expenses** — record, categorize, project allocation, receipt linking
- [ ] **Module: Receipts** — upload, gallery view, link to expenses/payments
- [ ] **Module: Bills** — create, track due dates, recurrence, overdue alerts
- [ ] **Module: Subscriptions** — track providers, renewal dates, monthly burn
- [ ] **Module: Utilities** — register accounts, link bills, usage tracking
- [ ] Dashboard V2: cash flow chart, expense breakdown, subscription burn

### Phase 4 — Operations & Assets (Weeks 13–16)

- [ ] **Module: Purchases** — request → approve → receive workflow
- [ ] **Module: Projects** — create, milestones, budget tracking, link everything
- [ ] **Module: Assets** — register, depreciation engine, maintenance log, disposal
- [ ] **Module: Investments** — portfolio tracking, P&L, manual price updates
- [ ] Dashboard V3: project health, asset registry, investment portfolio

### Phase 5 — Governance & Polish (Weeks 17–20)

- [ ] **Module: Accountability** — goals, tasks, habits, evidence, scoring
- [ ] Cloud Functions: bill reminders, subscription renewals, depreciation cron
- [ ] Cross-module linking UI (e.g., customer → invoices → payments → receipts)
- [ ] Advanced reporting: monthly summaries, YTD comparisons, export to CSV
- [ ] Full audit trail UI per aggregate
- [ ] Performance optimization: Firestore indexes, pagination, caching
- [ ] Dashboard V4: full KPI suite, accountability score

### Phase 6 — Future (V2+)

- [ ] Receipt OCR (Cloud Vision API integration)
- [ ] Event Bus migration: Cloud Pub/Sub for async projections
- [ ] Email notifications (SendGrid / Firebase Extensions)
- [ ] API key auth for external integrations
- [ ] Mobile-responsive polish / PWA
- [ ] Data export: full event store backup + read model snapshots
- [ ] Investment price feeds (external API integration)

---

## 21. Appendix — Glossary

| Term | Definition |
|---|---|
| **Aggregate** | A cluster of domain objects treated as a single unit for data changes. Has a root entity and owns its invariants. |
| **Event Sourcing** | Persisting state as a sequence of immutable events rather than mutable rows. Current state is derived by replaying events. |
| **CQRS** | Command Query Responsibility Segregation — separate models for reads (projections) and writes (aggregates + events). |
| **Projection** | A denormalized read model built by processing domain events. Optimized for specific query patterns. |
| **Reactor** | An event handler that responds to domain events by issuing new commands (cross-aggregate side effects). |
| **Bounded Context** | A semantic boundary within which a particular domain model applies. Terms may have different meanings across contexts. |
| **Command** | An imperative instruction to change system state. May be accepted or rejected by the aggregate. |
| **Query** | A request for data that does not modify state. Always reads from projections. |
| **Value Object** | An immutable object defined by its attributes, not identity (e.g., Money, Email, Address). |
| **Branded Type** | A TypeScript pattern using intersection types to create nominally-typed IDs (e.g., `string & { __brand: 'CustomerId' }`). |
| **Anti-Corruption Layer (ACL)** | A translation layer between bounded contexts that prevents one context's model from leaking into another. |
| **Read Model** | Synonym for Projection — the denormalized data structure optimized for a specific query. |
| **Correlation ID** | A unique identifier that ties together all events and commands originating from a single user action. |
| **Causation ID** | The ID of the command or event that directly caused a given event. |

---

> **Next Steps:** Once this spec is reviewed and approved, break each module into individual Feature Specification documents following the BRD → Feature Spec → Implementation flow.
