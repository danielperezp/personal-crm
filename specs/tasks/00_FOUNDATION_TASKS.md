# Tasks — Module 00: Foundation & Shared Infrastructure

> **Phase:** 1 (Weeks 1–4)
> **Dependencies:** None — this is the root dependency
> **Estimated Tasks:** 68

---

## 1. Monorepo Scaffolding

- [ ] T-0001: Initialize root monorepo with npm/yarn/pnpm workspaces configuration
- [ ] T-0002: Create `server/` workspace with `package.json` and TypeScript config (`tsconfig.json` strict mode)
- [ ] T-0003: Create `client/` workspace with `package.json` and Vite + React + TypeScript scaffold
- [ ] T-0004: Create `functions/` workspace with `package.json` for Firebase Cloud Functions
- [ ] T-0005: Create `shared/` workspace with `package.json` for cross-workspace types and schemas
- [ ] T-0006: Configure workspace cross-references (shared → server, shared → client)
- [ ] T-0007: Add root-level scripts: `dev`, `build`, `test`, `lint` for all workspaces
- [ ] T-0008: Add `.gitignore`, `.editorconfig`, `.nvmrc` (Node 20+)
- [ ] T-0009: Add ESLint config with TypeScript strict rules across all workspaces
- [ ] T-0010: Add Prettier config shared across all workspaces

---

## 2. Domain Layer — Base Classes

- [ ] T-0011: Implement `AggregateRoot<TId>` abstract class — `apply()`, `rehydrate()`, `getUncommittedEvents()`, `clearUncommittedEvents()`, version tracking
- [ ] T-0012: Implement `DomainEvent<TPayload>` interface with `eventId`, `aggregateId`, `aggregateType`, `eventType`, `version`, `payload`, `metadata`
- [ ] T-0013: Implement `DomainEventMetadata` interface — `userId`, `correlationId`, `causationId`, `timestamp`
- [ ] T-0014: Implement `EventEnvelope<T, P>` discriminated union type helper
- [ ] T-0015: Implement `Entity<TId>` abstract class with `id` getter and `equals()` method
- [ ] T-0016: Implement `ValueObject<TProps>` abstract class with `equals()` comparison
- [ ] T-0017: Implement `DomainError` abstract base class extending `Error`
- [ ] T-0018: Implement `ApplicationError` abstract base class with `statusCode`
- [ ] T-0019: Implement concrete error classes: `NotFoundError` (404), `ConflictError` (409), `UnauthorizedError` (401), `ForbiddenError` (403)
- [ ] T-0020: Implement `ConcurrencyError` class for optimistic concurrency violations
- [ ] T-0021: Write unit tests for `AggregateRoot` — apply, rehydrate, version increment, uncommitted events
- [ ] T-0022: Write unit tests for `Entity.equals()` and `ValueObject.equals()`
- [ ] T-0023: Verify all base classes compile with zero external imports (no Firebase, no Express, no Node-specific APIs)

---

## 3. Branded Types

- [ ] T-0024: Implement `Brand<T, B>` generic type with `__brand` symbol
- [ ] T-0025: Define all 17 branded ID types: `CustomerId`, `InvoiceId`, `PaymentId`, `ExpenseId`, `ReceiptId`, `BillId`, `SubscriptionId`, `UtilityId`, `OrderId`, `PurchaseId`, `ProjectId`, `AssetId`, `InvestmentId`, `UserId`, `AccountabilityId`, `MilestoneId`, `InvoiceNumber`
- [ ] T-0026: Implement `createId<T>(prefix)` factory function using `crypto.randomUUID()`
- [ ] T-0027: Write compile-time tests verifying cross-assignment prevention (e.g., `CustomerId` cannot be assigned to `InvoiceId`)

---

## 4. Shared Value Objects

- [ ] T-0028: Implement `Money` value object — `create()`, `add()`, `subtract()`, `multiply()`, `isZero()`, `isPositive()`, `ensureSameCurrency()`
- [ ] T-0029: Implement `CurrencyCode` type union: USD, EUR, GBP, CAD, AUD, JPY, MXN, BRL, COP
- [ ] T-0030: Implement `InvalidMoneyError` and `CurrencyMismatchError` domain errors
- [ ] T-0031: Write unit tests for `Money` — arithmetic, rounding to 2 decimals, currency mismatch rejection, negative amount rejection
- [ ] T-0032: Implement `Email` value object — `create()` with regex validation and lowercase normalization
- [ ] T-0033: Implement `InvalidEmailError` domain error
- [ ] T-0034: Write unit tests for `Email` — valid emails, invalid emails, normalization
- [ ] T-0035: Implement `Phone` value object with basic validation
- [ ] T-0036: Implement `Address` value object — `create()` with required field validation (street, city, postalCode, country)
- [ ] T-0037: Implement `InvalidAddressError` domain error
- [ ] T-0038: Implement `Percentage` value object — `create()` with 0–100 range validation, `applyTo(amount)` method
- [ ] T-0039: Implement `Tag` type (trimmed, lowercased string)

---

## 5. Application Layer — Bus Interfaces

- [ ] T-0040: Define `Command` interface — `type`, `payload`, `metadata: CommandMetadata`
- [ ] T-0041: Define `CommandMetadata` interface — `commandId`, `userId`, `correlationId`, `timestamp`
- [ ] T-0042: Define `ICommandBus` interface — `execute()`, `register()`
- [ ] T-0043: Define `ICommandHandler<TCommand>` interface — `execute(command): Promise<void>`
- [ ] T-0044: Implement `InProcessCommandBus` — handler registry Map, dispatch with error propagation
- [ ] T-0045: Write unit tests for `InProcessCommandBus` — register, execute, unregistered command throws
- [ ] T-0046: Define `Query` interface — `type`, `payload`
- [ ] T-0047: Define `IQueryBus` interface — `execute()`, `register()`
- [ ] T-0048: Define `IQueryHandler<TQuery, TResult>` interface — `execute(query): Promise<TResult>`
- [ ] T-0049: Implement `InProcessQueryBus` — handler registry Map, dispatch with typed return
- [ ] T-0050: Write unit tests for `InProcessQueryBus`
- [ ] T-0051: Define `IEventBus` interface — `publish()`, `subscribe()`
- [ ] T-0052: Define `IEventHandler` interface — `handle(event): Promise<void>`
- [ ] T-0053: Implement `InProcessEventBus` using Node.js `EventEmitter` — subscribe by eventType, publish dispatches to all subscribers
- [ ] T-0054: Write unit tests for `InProcessEventBus` — subscribe, publish, multiple subscribers

---

## 6. Application Layer — Ports (Interfaces)

- [ ] T-0055: Define `IEventStore` interface — `save(aggregateId, aggregateType, events, expectedVersion)`, `load(aggregateId)`, `loadByType(aggregateType, fromTimestamp?)`
- [ ] T-0056: Define `IReadModelRepository` interface — `upsert()`, `update()`, `findById()`, `findMany()`, `delete()` with `QueryFilter`, `Pagination`, `OrderBy`, `PaginatedResult` types
- [ ] T-0057: Define `IFileStorage` interface — `upload()`, `download()`, `delete()`, `getSignedUrl()`

---

## 7. Infrastructure — Firebase

- [ ] T-0058: Initialize Firebase Admin SDK (`firebaseAdmin.ts`) — service account config from environment variables
- [ ] T-0059: Implement `FirestoreEventStore` — `save()` with Firestore transaction for optimistic concurrency, version check, event subcollection writes, post-commit event publishing
- [ ] T-0060: Implement `FirestoreEventStore.load()` — read events subcollection ordered by version ASC
- [ ] T-0061: Write integration tests for `FirestoreEventStore` — save, load, concurrency conflict rejection (409)
- [ ] T-0062: Implement `FirestoreReadModelRepo` — `upsert()`, `update()`, `findById()`, `findMany()` with Firestore query builder, `delete()`
- [ ] T-0063: Write integration tests for `FirestoreReadModelRepo` — CRUD, filtering, pagination
- [ ] T-0064: Implement `FirebaseStorageAdapter` — `upload()`, `download()`, `delete()`, `getSignedUrl()` wrapping Firebase Cloud Storage
- [ ] T-0065: Create `firestore.indexes.json` with events version index and collectionGroup eventType+timestamp index
- [ ] T-0066: Create initial `firestore.rules` restricting direct client access (all access via backend)

---

## 8. Infrastructure — Projection Engine

- [ ] T-0067: Implement `ProjectionEngine` — `register(projection)` maps eventTypes to projection handlers, `dispatch(event)` fans out to all matching projections via `Promise.allSettled()`
- [ ] T-0068: Define `IProjection` interface — `subscribedEvents: string[]`, `handle(event): Promise<void>`
- [ ] T-0069: Write unit tests for `ProjectionEngine` — register, dispatch to correct projections, error isolation between projections

---

## 9. Infrastructure — Express Server

- [ ] T-0070: Install Express dependencies: `express`, `cors`, `helmet`, `pino`, `pino-http`, `express-rate-limit`
- [ ] T-0071: Implement `requestId` middleware — generate UUID correlationId, attach to `req` and response header `X-Correlation-Id`
- [ ] T-0072: Implement Pino structured logging middleware with correlationId context
- [ ] T-0073: Implement `FirebaseAuthMiddleware` — extract Bearer token, verify via `firebase.auth().verifyIdToken()`, attach `userId` and decoded claims to `req.user`, skip for public routes
- [ ] T-0074: Implement rate limiting middleware with configurable windows
- [ ] T-0075: Implement `validation` middleware factory — accepts Zod schema, validates `req.body`, returns 400 with Zod errors on failure
- [ ] T-0076: Implement `errorHandlerMiddleware` — catch-all mapping `DomainError` → 422, `ApplicationError` → statusCode, `ConcurrencyError` → 409, unknown → 500
- [ ] T-0077: Implement `main.ts` — Express app bootstrap with middleware stack in correct order (CORS → Helmet → JSON → requestId → logging → auth → rateLimit → routes → errorHandler)
- [ ] T-0078: Verify server boots and responds to health check endpoint `GET /api/v1/health`
- [ ] T-0079: Write integration test — unauthenticated request returns 401
- [ ] T-0080: Write integration test — malformed JSON body returns 400

---

## 10. Infrastructure — DI Container

- [ ] T-0081: Implement `container.ts` — wire all dependencies: EventStore, ReadModelRepo, CommandBus, QueryBus, EventBus, ProjectionEngine, FileStorage
- [ ] T-0082: Export factory function `createContainer(firebaseApp)` returning fully wired dependency graph

---

## 11. Frontend — React Scaffold

- [ ] T-0083: Initialize Vite + React + TypeScript project in `client/`
- [ ] T-0084: Install and configure Tailwind CSS v3
- [ ] T-0085: Install and configure Shadcn/UI — init with default theme, add Button, Input, Card, Dialog, Toast, Badge, Avatar, Tooltip base components
- [ ] T-0086: Install TanStack Query and create `queryClient.ts` with default options (staleTime, retry, refetchOnWindowFocus)
- [ ] T-0087: Install Zustand and create `authStore.ts` — `user`, `token`, `role`, `isLoading`, `signIn()`, `signOut()`
- [ ] T-0088: Install Zustand and create `uiStore.ts` — `sidebarOpen`, `theme`, `toggleSidebar()`, `setTheme()`
- [ ] T-0089: Initialize Firebase client SDK (`client/src/lib/firebase.ts`) — config from environment variables
- [ ] T-0090: Implement `api.ts` Axios instance — base URL from env, request interceptor attaching Firebase JWT, response interceptor handling 401 → redirect to `/login`, 409 → toast notification
- [ ] T-0091: Implement `providers.tsx` — wrap app with `QueryClientProvider`, `AuthProvider`, `ThemeProvider`, `ToastProvider`
- [ ] T-0092: Implement `router.tsx` with React Router v6 — protected route wrapper checking auth state, login route, main layout route with sidebar
- [ ] T-0093: Implement `App.tsx` — compose Providers + Router
- [ ] T-0094: Create `LoginPage.tsx` — Firebase email/password sign-in form
- [ ] T-0095: Create `MainLayout.tsx` — sidebar navigation + top bar + content area
- [ ] T-0096: Create `SidebarNav.tsx` — links to all 15 module routes + Dashboard
- [ ] T-0097: Verify React app builds, renders login page, and redirects to dashboard on successful auth

---

## 12. Shared Workspace — Validation & Constants

- [ ] T-0098: Implement `shared/validation/schemas.ts` — `emailSchema`, `moneySchema`, `currencyCodeSchema`, `paginationSchema`, `addressSchema`
- [ ] T-0099: Implement `shared/constants/enums.ts` — all shared enums (CustomerStatus, InvoiceStatus, PaymentMethod, etc.) as TypeScript string unions and Zod enums
- [ ] T-0100: Verify shared workspace imports correctly from both `server/` and `client/` workspaces

---

## 13. Firebase Project Setup

- [ ] T-0101: Create Firebase project (or configure existing)
- [ ] T-0102: Enable Firebase Authentication with email/password provider
- [ ] T-0103: Create Firestore database in production mode
- [ ] T-0104: Create Cloud Storage bucket for file uploads
- [ ] T-0105: Generate service account key and configure environment variables for backend
- [ ] T-0106: Configure Firebase client SDK environment variables for frontend
- [ ] T-0107: Create `firebase.json` with hosting, firestore, functions, and storage configs
- [ ] T-0108: Deploy Firestore indexes from `firestore.indexes.json`
- [ ] T-0109: Deploy Firestore security rules from `firestore.rules`
