# Tasks — Module 15: Accountability

> **Phase:** 5 (Weeks 17–20)
> **Dependencies:** Module 00, optionally 11 (Projects), 13 (Investments)
> **Estimated Tasks:** 34

---

## 1. Domain Layer

- [ ] T-0620: Implement `EvidenceItem` entity — `evidenceId`, `type` (Note|Link|Attachment|Metric), `content`, `attachmentUrl?`, `addedAt`
- [ ] T-0621: Implement `AccountabilityRecurrence` value object — `frequency` (Daily|Weekly|Monthly), `streak`, `lastCompletedAt?`
- [ ] T-0622: Implement `AccountabilityEntry` aggregate root — `AccountabilityEntry.create(props)`, `when()` handler
- [ ] T-0623: Implement `AccountabilityEntry.create()` — validate title non-empty, if Habit require recurrence, emit `AccountabilityEntryCreated`
- [ ] T-0624: Implement `AccountabilityEntry.start()` — validate Open, emit `AccountabilityStarted`
- [ ] T-0625: Implement `AccountabilityEntry.complete(reviewNotes?)` — validate not Failed, emit `AccountabilityCompleted`
- [ ] T-0626: Implement `AccountabilityEntry.fail(reason?)` — validate not Completed, emit `AccountabilityFailed`
- [ ] T-0627: Implement `AccountabilityEntry.defer(newTargetDate?, reason?)` — emit `AccountabilityDeferred`
- [ ] T-0628: Implement `AccountabilityEntry.addEvidence(type, content, attachmentUrl?)` — emit `AccountabilityEvidenceAdded`
- [ ] T-0629: Implement `AccountabilityEntry.updateMetric(key, value)` — emit `AccountabilityMetricUpdated`
- [ ] T-0630: Implement `AccountabilityEntry.review(reviewNotes)` — emit `AccountabilityReviewed`
- [ ] T-0631: Implement `AccountabilityEntry.completeHabitOccurrence()` — check lastCompletedAt vs frequency window, increment or reset streak, emit `AccountabilityHabitCompleted` or `AccountabilityHabitStreakBroken`
- [ ] T-0632: Implement streak logic — within frequency window = increment, gap exceeds window = reset to 1
- [ ] T-0633: Define events, errors, repository port
- [ ] T-0634: Write unit tests for AccountabilityEntry aggregate — create, status transitions, evidence, metrics, habit streaks

---

## 2. Application + Infrastructure + Frontend

- [ ] T-0635: Implement command handlers — Create, Start, Complete, Fail, Defer, AddEvidence, UpdateMetric, Review, CompleteHabitOccurrence, Update
- [ ] T-0636: Wire `ProjectMilestoneReactor` (from Module 11) — on `ProjectMilestoneCompleted`, auto-create Accountability entry with type=Milestone, status=Completed
- [ ] T-0637: Register handlers
- [ ] T-0638: Implement query handlers — GetAccountabilityList, GetAccountabilityDetail, GetActiveGoals, GetHabits, GetAccountabilityScore, GetOverdueEntries
- [ ] T-0639: Implement `AccountabilityListProjection` — upsert `rm_accountability` with linked project/investment names, streak info
- [ ] T-0640: Implement `AccountabilityScoreProjection` — compute completionRate, activeStreaks, overdueCount; write to `rm_dashboard/{userId}` nested field
- [ ] T-0641: Register projections
- [ ] T-0642: Implement `AccountabilityController` and `accountabilityRoutes.ts` — 9 command + 6 query endpoints
- [ ] T-0643: Implement scheduled Cloud Function — daily: query habits where lastCompletedAt is outside expected window → emit `HabitStreakBroken`, reset streak to 0
- [ ] T-0644: Deploy habit streak Cloud Function
- [ ] T-0645: Implement `accountabilityApi.ts` and hooks
- [ ] T-0646: Implement `AccountabilityPage` — tabs: Goals, Tasks, Habits, Reviews + score card
- [ ] T-0647: Implement `AccountabilityTabs` — tab navigation by type with counts
- [ ] T-0648: Implement `GoalList` — goals with progress indicator (evidence count / metrics)
- [ ] T-0649: Implement `TaskList` — checklist-style with status toggle buttons
- [ ] T-0650: Implement `HabitTracker` — habit cards with streak counter, "Mark Done Today" button, streak fire icon
- [ ] T-0651: Implement `AccountabilityScoreCard` — completion rate percentage, active streaks list, overdue count
- [ ] T-0652: Implement `CreateEntryDialog` — type selector, title, description, target date, project/investment link, recurrence config for Habits
- [ ] T-0653: Implement `EvidenceTimeline` — chronological evidence items with type icons
- [ ] T-0654: Implement `MetricsDisplay` — key-value metrics with update inline edit
- [ ] T-0655: Implement `ReviewForm` — textarea for adding review notes
- [ ] T-0656: Implement `StreakBadge` — fire icon with streak count, green for active / gray for broken
- [ ] T-0657: Add route `/accountability` to router
- [ ] T-0658: Write integration tests — create goal, start, complete, fail lifecycle
- [ ] T-0659: Write integration test — habit streak increment and break logic
- [ ] T-0660: Write integration test — project milestone reactor creates accountability entry
