# Module 07 — Subscriptions

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Subscriptions
> **Bounded Context:** Financial Context
> **Phase:** 3 (Weeks 9–12)
> **Status:** Draft

---

## 1. Overview

The Subscriptions module tracks all recurring service subscriptions — SaaS tools, media services, professional memberships, and more. It provides visibility into monthly burn rate, upcoming renewals, and cost optimization opportunities. Subscriptions can auto-generate linked Bills on each billing cycle.

---

## 2. Aggregate: `Subscription`

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
├── url?: string                     // Service URL
├── notes?: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot pause a Cancelled or Expired subscription.
- Cannot renew a Cancelled subscription.
- nextBillingDate must be > startDate.
- Amount must be > 0.

### Enums

```typescript
type BillingCycle = 'Monthly' | 'Quarterly' | 'Annual';
type SubscriptionCategory = 'Software' | 'Service' | 'Media' | 'Other';
type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled' | 'Expired';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `SubscriptionStarted` | `{ subscriptionId, provider, plan, amount, currency, billingCycle, startDate, nextBillingDate, autoRenew, category }` |
| `SubscriptionRenewed` | `{ renewedAt, nextBillingDate, linkedBillId? }` |
| `SubscriptionPaused` | `{ pausedAt, reason? }` |
| `SubscriptionResumed` | `{ resumedAt, nextBillingDate }` |
| `SubscriptionCancelled` | `{ cancelledAt, reason?, effectiveDate }` |
| `SubscriptionExpired` | `{ expiredAt }` |
| `SubscriptionPlanChanged` | `{ oldPlan, newPlan, oldAmount, newAmount }` |
| `SubscriptionUpdated` | `{ changes }` |

### Integration Events

| Event | Consumed By | Effect |
|---|---|---|
| `SubscriptionStarted` | Subscription Burn Projection | Add to monthly burn |
| `SubscriptionRenewed` | Bill Module (Reactor) | Auto-create bill for this cycle |
| `SubscriptionCancelled` | Subscription Burn Projection | Remove from burn rate |
| `SubscriptionPlanChanged` | Subscription Burn Projection | Update burn amount |

---

## 4. Commands

| Command | Payload |
|---|---|
| `StartSubscription` | `{ provider, plan, amount, currency, billingCycle, startDate, nextBillingDate?, autoRenew?, category, url?, notes? }` |
| `RenewSubscription` | `{ subscriptionId }` — system or manual |
| `PauseSubscription` | `{ subscriptionId, reason? }` |
| `ResumeSubscription` | `{ subscriptionId }` |
| `CancelSubscription` | `{ subscriptionId, reason?, effectiveDate? }` |
| `ChangeSubscriptionPlan` | `{ subscriptionId, newPlan, newAmount }` |
| `UpdateSubscription` | `{ subscriptionId, changes }` |
| `ExpireSubscription` | `{ subscriptionId }` — system command |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetSubscriptionList` | `PaginatedResult<SubscriptionListDTO>` — filters: status, category, billingCycle |
| `GetSubscriptionDetail` | `SubscriptionDetailDTO` |
| `GetMonthlyBurnRate` | `{ totalMonthly, byCategory: { category, amount }[] }` |
| `GetUpcomingRenewals` | `SubscriptionListDTO[]` — next 30 days |
| `GetSubscriptionsByCategory` | `{ category, count, totalMonthly }[]` |

---

## 6. Read Model: `rm_subscriptions`

```typescript
interface SubscriptionListReadModel {
  id: string;
  provider: string;
  plan: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  monthlyEquivalent: number;    // Normalized to monthly cost
  nextBillingDate: number;
  autoRenew: boolean;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  url?: string;
  startDate: number;
  createdAt: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/subscriptions/commands/StartSubscription
POST   /api/v1/subscriptions/commands/RenewSubscription
POST   /api/v1/subscriptions/commands/PauseSubscription
POST   /api/v1/subscriptions/commands/ResumeSubscription
POST   /api/v1/subscriptions/commands/CancelSubscription
POST   /api/v1/subscriptions/commands/ChangeSubscriptionPlan

GET    /api/v1/subscriptions
GET    /api/v1/subscriptions/:id
GET    /api/v1/subscriptions/:id/events
GET    /api/v1/subscriptions/burn-rate
GET    /api/v1/subscriptions/upcoming-renewals
GET    /api/v1/subscriptions/by-category
```

---

## 8. Scheduled Cloud Functions

```typescript
// Daily
// 1. Query rm_subscriptions where status = 'Active' AND nextBillingDate <= today
//    → RenewSubscription (creates next billing date, auto-generates Bill)
// 2. Query rm_subscriptions where status = 'Active' AND endDate <= today AND !autoRenew
//    → ExpireSubscription
```

---

## 9. Frontend

### Pages

| Route | Page |
|---|---|
| `/subscriptions` | `SubscriptionListPage` — card grid + burn rate summary |

### Key Components

- `SubscriptionGrid.tsx` — Card-based layout with provider logos/initials
- `SubscriptionCard.tsx` — Provider, plan, amount, next billing, status
- `BurnRateSummary.tsx` — Total monthly burn + category breakdown bar chart
- `UpcomingRenewals.tsx` — Timeline of next 30 days renewals
- `AddSubscriptionDialog.tsx` — Modal form
- `SubscriptionDetailDrawer.tsx` — Side drawer with history + actions

---

## 10. Acceptance Criteria

- [ ] Can create subscriptions with provider, plan, amount, billing cycle
- [ ] Monthly equivalent normalizes quarterly/annual to monthly cost
- [ ] Burn rate summary correctly totals all active subscription costs
- [ ] Renewal Cloud Function advances nextBillingDate and optionally creates Bill
- [ ] Can pause, resume, cancel subscriptions with correct state transitions
- [ ] Plan changes update amount and are tracked in event history
- [ ] Upcoming renewals view shows next 30 days
- [ ] All transitions produce domain events

---

## 11. File Manifest

```
server/src/domain/subscription/Subscription.ts
server/src/domain/subscription/Subscription.events.ts
server/src/domain/subscription/Subscription.errors.ts
server/src/domain/subscription/ISubscriptionRepository.ts
server/src/application/commands/handlers/subscription/*
server/src/application/queries/handlers/subscription/*
server/src/application/dto/SubscriptionDTO.ts
server/src/application/events/reactors/SubscriptionRenewalReactor.ts
server/src/infrastructure/projections/SubscriptionListProjection.ts
server/src/infrastructure/projections/SubscriptionBurnProjection.ts
server/src/infrastructure/http/routes/subscriptionRoutes.ts
server/src/infrastructure/http/controllers/SubscriptionController.ts
functions/src/subscriptionScheduledJobs.ts
client/src/features/subscriptions/**
```
