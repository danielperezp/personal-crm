# Module 15 — Accountability

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Accountability
> **Bounded Context:** Governance Context
> **Phase:** 5 (Weeks 17–20)
> **Status:** Draft

---

## 1. Overview

The Accountability module is the personal governance layer of NexusCommand. It tracks goals, tasks, habits, milestones, and periodic reviews — providing a structured framework for self-accountability. Entries can link to Projects and Investments, and are automatically created when project milestones are reached. The module produces a personal "Accountability Score" that surfaces on the dashboard.

---

## 2. Aggregate: `AccountabilityEntry`

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
├── metrics?: Record<string, number> // KPIs — e.g., { revenue: 50000, clients: 10 }
├── evidence: EvidenceItem[]         // Entity
│   ├── evidenceId: string
│   ├── type: EvidenceType           // Note | Link | Attachment | Metric
│   ├── content: string              // Text content or URL
│   ├── attachmentUrl?: string
│   └── addedAt: Timestamp
├── recurrence?: AccountabilityRecurrence  // For habits
│   ├── frequency: 'Daily' | 'Weekly' | 'Monthly'
│   ├── streak: number
│   └── lastCompletedAt?: Timestamp
├── reviewNotes?: string
├── completedAt?: Timestamp
├── failedAt?: Timestamp
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Cannot complete a Failed entry (must create a new one).
- Cannot fail a Completed entry.
- Habits must have a recurrence configuration.
- Goals should have a targetDate (warning, not blocking).
- Title must be non-empty.
- Metrics keys must be unique within an entry.

### Enums

```typescript
type AccountabilityType = 'Goal' | 'Task' | 'Habit' | 'Milestone' | 'Review';
type AccountabilityStatus = 'Open' | 'InProgress' | 'Completed' | 'Failed' | 'Deferred';
type EvidenceType = 'Note' | 'Link' | 'Attachment' | 'Metric';
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `AccountabilityEntryCreated` | `{ entryId, userId, type, title, description?, targetDate?, linkedProjectId?, linkedInvestmentId?, recurrence? }` |
| `AccountabilityStatusChanged` | `{ from, to, reason? }` |
| `AccountabilityStarted` | `{}` — Open → InProgress |
| `AccountabilityCompleted` | `{ completedAt, reviewNotes? }` |
| `AccountabilityFailed` | `{ failedAt, reason? }` |
| `AccountabilityDeferred` | `{ newTargetDate?, reason? }` |
| `AccountabilityEvidenceAdded` | `{ evidenceId, type, content, attachmentUrl? }` |
| `AccountabilityMetricUpdated` | `{ key, oldValue?, newValue }` |
| `AccountabilityReviewed` | `{ reviewNotes, reviewedBy }` |
| `AccountabilityHabitCompleted` | `{ streak, completedAt }` — for recurring habits |
| `AccountabilityHabitStreakBroken` | `{ oldStreak }` |
| `AccountabilityUpdated` | `{ changes }` |

---

## 4. Commands

| Command | Payload |
|---|---|
| `CreateAccountabilityEntry` | `{ type, title, description?, targetDate?, linkedProjectId?, linkedInvestmentId?, metrics?, recurrence? }` |
| `StartEntry` | `{ entryId }` |
| `CompleteEntry` | `{ entryId, reviewNotes? }` |
| `FailEntry` | `{ entryId, reason? }` |
| `DeferEntry` | `{ entryId, newTargetDate?, reason? }` |
| `AddEvidence` | `{ entryId, type, content, attachmentUrl? }` |
| `UpdateMetric` | `{ entryId, key, value }` |
| `ReviewEntry` | `{ entryId, reviewNotes }` |
| `CompleteHabitOccurrence` | `{ entryId }` — marks today's occurrence |
| `UpdateEntry` | `{ entryId, changes }` |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetAccountabilityList` | `PaginatedResult<AccountabilityListDTO>` — filters: type, status, linkedProjectId |
| `GetAccountabilityDetail` | `AccountabilityDetailDTO` — includes evidence, metrics |
| `GetActiveGoals` | `AccountabilityListDTO[]` — Open/InProgress goals |
| `GetHabits` | `AccountabilityListDTO[]` — with streak info |
| `GetAccountabilityScore` | `{ totalEntries, completed, failed, deferred, completionRate, activeStreaks }` |
| `GetOverdueEntries` | `AccountabilityListDTO[]` — past targetDate, not completed |

---

## 6. Read Model: `rm_accountability`

```typescript
interface AccountabilityListReadModel {
  id: string;
  userId: string;
  type: AccountabilityType;
  title: string;
  description?: string;
  targetDate?: number;
  status: AccountabilityStatus;
  linkedProjectId?: string;
  linkedProjectName?: string;
  linkedInvestmentId?: string;
  linkedInvestmentName?: string;
  evidenceCount: number;
  metricsCount: number;
  recurrence?: {
    frequency: string;
    streak: number;
    lastCompletedAt?: number;
  };
  completedAt?: number;
  createdAt: number;
}
```

### `AccountabilityScoreProjection`

**Collection:** `rm_dashboard/{userId}` (nested field)

```typescript
interface AccountabilityScoreReadModel {
  totalEntries: number;
  completedCount: number;
  failedCount: number;
  deferredCount: number;
  openCount: number;
  completionRate: number;            // completedCount / (completedCount + failedCount) * 100
  activeHabitStreaks: { title: string; streak: number }[];
  overdueCount: number;
}
```

---

## 7. API Endpoints

```
POST   /api/v1/accountability/commands/CreateAccountabilityEntry
POST   /api/v1/accountability/commands/StartEntry
POST   /api/v1/accountability/commands/CompleteEntry
POST   /api/v1/accountability/commands/FailEntry
POST   /api/v1/accountability/commands/DeferEntry
POST   /api/v1/accountability/commands/AddEvidence
POST   /api/v1/accountability/commands/UpdateMetric
POST   /api/v1/accountability/commands/ReviewEntry
POST   /api/v1/accountability/commands/CompleteHabitOccurrence

GET    /api/v1/accountability
GET    /api/v1/accountability/:id
GET    /api/v1/accountability/:id/events
GET    /api/v1/accountability/active-goals
GET    /api/v1/accountability/habits
GET    /api/v1/accountability/score
GET    /api/v1/accountability/overdue
```

---

## 8. Frontend

### Pages

| Route | Page |
|---|---|
| `/accountability` | `AccountabilityPage` — tabs: Goals, Tasks, Habits, Reviews + score card |

### Key Components

- `AccountabilityTabs.tsx` — Tab navigation by type
- `GoalList.tsx` — Goals with progress bar (based on metrics/evidence)
- `TaskList.tsx` — Checklist-style task list with status toggles
- `HabitTracker.tsx` — Habit cards with streak counter and "Mark Done" button
- `AccountabilityScoreCard.tsx` — Completion rate, streaks, overdue count
- `CreateEntryDialog.tsx` — Modal form with type selector, project/investment link
- `EvidenceTimeline.tsx` — Evidence items in chronological order
- `MetricsDisplay.tsx` — Key-value metrics with progress visualization
- `ReviewForm.tsx` — Add review notes to an entry
- `StreakBadge.tsx` — Visual streak indicator (fire icon, count)

---

## 9. Auto-Creation via Reactors

The `ProjectMilestoneReactor` listens for `ProjectMilestoneCompleted` events and auto-creates an Accountability entry:

```typescript
// When a project milestone is completed:
// → CreateAccountabilityEntry({
//     type: 'Milestone',
//     title: `Milestone: ${milestone.title}`,
//     linkedProjectId: projectId,
//     status: 'Completed',
//     completedAt: milestone.completedAt,
//   })
```

---

## 10. Habit Streak Logic

```typescript
// On CompleteHabitOccurrence:
// 1. Check lastCompletedAt vs. now
// 2. If within expected frequency window → increment streak
// 3. If gap exceeds frequency → streak resets to 1, emit HabitStreakBroken

// Scheduled Cloud Function (daily):
// 1. Query habits where lastCompletedAt is outside the expected window
// 2. For each, emit HabitStreakBroken and reset streak to 0
```

---

## 11. Acceptance Criteria

- [ ] Can create goals, tasks, habits, milestones, and reviews
- [ ] Status transitions follow the state machine
- [ ] Can add evidence (notes, links, attachments) to entries
- [ ] Can track custom metrics per entry
- [ ] Habits track streaks correctly (increment on time, break on miss)
- [ ] Accountability score computes completion rate, streak counts, overdue count
- [ ] Project milestone completion auto-creates accountability entry via reactor
- [ ] Can link entries to projects and investments
- [ ] Overdue entries (past targetDate, not completed) are surfaced
- [ ] Score card renders on dashboard
- [ ] All transitions produce domain events

---

## 12. File Manifest

```
server/src/domain/accountability/AccountabilityEntry.ts
server/src/domain/accountability/AccountabilityEntry.events.ts
server/src/domain/accountability/AccountabilityEntry.errors.ts
server/src/domain/accountability/IAccountabilityRepository.ts
server/src/domain/accountability/entities/EvidenceItem.ts
server/src/domain/accountability/vo/AccountabilityRecurrence.ts
server/src/application/commands/handlers/accountability/*
server/src/application/queries/handlers/accountability/*
server/src/application/dto/AccountabilityDTO.ts
server/src/application/events/reactors/ProjectMilestoneReactor.ts
server/src/infrastructure/projections/AccountabilityListProjection.ts
server/src/infrastructure/projections/AccountabilityScoreProjection.ts
server/src/infrastructure/http/routes/accountabilityRoutes.ts
server/src/infrastructure/http/controllers/AccountabilityController.ts
functions/src/habitStreakScheduledJob.ts
client/src/features/accountability/**
```
