# Module 00 — Foundation & Shared Infrastructure

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Foundation
> **Bounded Context:** Shared Kernel
> **Phase:** 1 (Weeks 1–4)
> **Status:** Draft

---

## 1. Overview

The Foundation module provides the shared building blocks that every other module depends on: the event store, command/query/event buses, base aggregate classes, branded types, value objects, and the Express server bootstrap. No feature module can be built without this layer being in place first.

---

## 2. Scope

### In Scope

- Monorepo scaffolding (client + server + functions + shared)
- Domain layer base classes (AggregateRoot, Entity, ValueObject, DomainEvent, DomainError)
- Branded types for all aggregate IDs
- Shared value objects (Money, Email, Phone, Address, Percentage, CurrencyCode, Tag)
- Event Store — Firestore implementation with optimistic concurrency
- Command Bus — in-process with middleware pipeline
- Query Bus — in-process
- Event Bus — in-process EventEmitter (V1)
- Projection Engine — Firestore-backed with event dispatch
- Express server bootstrap (middleware stack, error handling, request ID, logging)
- React app scaffold (routing, providers, Tailwind, Shadcn/UI, TanStack Query, Zustand)
- Firebase client + admin SDK initialization
- Auth middleware (Firebase JWT verification)
- Shared Zod validation schemas
- DI container wiring

### Out of Scope

- Any specific feature module aggregate or UI
- Cloud Pub/Sub event bus (V2)
- AI/ML features

---

## 3. Domain Layer — Base Classes

### 3.1 AggregateRoot

```typescript
// src/domain/shared/AggregateRoot.ts
export abstract class AggregateRoot<TId> {
  private _uncommittedEvents: DomainEvent[] = [];
  private _version: number = 0;

  protected constructor(protected readonly _id: TId) {}

  get id(): TId { return this._id; }
  get version(): number { return this._version; }

  getUncommittedEvents(): ReadonlyArray<DomainEvent> {
    return [...this._uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  protected apply(event: DomainEvent): void {
    this.when(event);
    this._version++;
    this._uncommittedEvents.push(event);
  }

  // Replay: apply without pushing to uncommitted
  protected rehydrate(events: DomainEvent[]): void {
    for (const event of events) {
      this.when(event);
      this._version++;
    }
  }

  // Each aggregate implements its own state transitions
  protected abstract when(event: DomainEvent): void;
}
```

### 3.2 DomainEvent Envelope

```typescript
// src/domain/shared/DomainEvent.ts
export interface DomainEventMetadata {
  userId: string;
  correlationId: string;
  causationId: string;
  timestamp: number; // Unix ms
}

export interface DomainEvent<TPayload = unknown> {
  eventId: string;           // UUID v4
  aggregateId: string;
  aggregateType: string;
  eventType: string;         // Discriminated union tag
  version: number;
  payload: TPayload;
  metadata: DomainEventMetadata;
}

export type EventEnvelope<T extends string, P> = DomainEvent<P> & {
  eventType: T;
};
```

### 3.3 Entity & ValueObject

```typescript
// src/domain/shared/Entity.ts
export abstract class Entity<TId> {
  protected constructor(protected readonly _id: TId) {}
  get id(): TId { return this._id; }

  equals(other: Entity<TId>): boolean {
    return this._id === other._id;
  }
}

// src/domain/shared/ValueObject.ts
export abstract class ValueObject<TProps> {
  protected constructor(protected readonly props: Readonly<TProps>) {}

  equals(other: ValueObject<TProps>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

### 3.4 DomainError

```typescript
// src/domain/shared/DomainError.ts
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export abstract class ApplicationError extends Error {
  abstract readonly statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends ApplicationError {
  readonly statusCode = 404;
}

export class ConflictError extends ApplicationError {
  readonly statusCode = 409;
}

export class UnauthorizedError extends ApplicationError {
  readonly statusCode = 401;
}

export class ForbiddenError extends ApplicationError {
  readonly statusCode = 403;
}
```

### 3.5 Branded Types

```typescript
// src/domain/shared/types/branded.ts
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type CustomerId       = Brand<string, 'CustomerId'>;
export type InvoiceId        = Brand<string, 'InvoiceId'>;
export type PaymentId        = Brand<string, 'PaymentId'>;
export type ExpenseId        = Brand<string, 'ExpenseId'>;
export type ReceiptId        = Brand<string, 'ReceiptId'>;
export type BillId           = Brand<string, 'BillId'>;
export type SubscriptionId   = Brand<string, 'SubscriptionId'>;
export type UtilityId        = Brand<string, 'UtilityId'>;
export type OrderId          = Brand<string, 'OrderId'>;
export type PurchaseId       = Brand<string, 'PurchaseId'>;
export type ProjectId        = Brand<string, 'ProjectId'>;
export type AssetId          = Brand<string, 'AssetId'>;
export type InvestmentId     = Brand<string, 'InvestmentId'>;
export type UserId           = Brand<string, 'UserId'>;
export type AccountabilityId = Brand<string, 'AccountabilityId'>;
export type MilestoneId      = Brand<string, 'MilestoneId'>;
export type InvoiceNumber    = Brand<string, 'InvoiceNumber'>;

// Factory helper
export function createId<T extends string>(prefix: string): Brand<string, T> {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}` as Brand<string, T>;
}
```

### 3.6 Shared Value Objects

```typescript
// src/domain/shared/types/money.ts
export class Money extends ValueObject<{ amount: number; currency: CurrencyCode }> {
  get amount(): number { return this.props.amount; }
  get currency(): CurrencyCode { return this.props.currency; }

  static create(amount: number, currency: CurrencyCode): Money {
    if (amount < 0) throw new InvalidMoneyError('Amount cannot be negative');
    return new Money({ amount: Math.round(amount * 100) / 100, currency });
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  isZero(): boolean { return this.amount === 0; }
  isPositive(): boolean { return this.amount > 0; }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'MXN' | 'BRL' | 'COP';

// src/domain/shared/types/email.ts
export class Email extends ValueObject<{ value: string }> {
  get value(): string { return this.props.value; }

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    return new Email({ value: normalized });
  }
}

// src/domain/shared/types/address.ts
export class Address extends ValueObject<{
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}> {
  get street(): string { return this.props.street; }
  get city(): string { return this.props.city; }
  get state(): string | undefined { return this.props.state; }
  get postalCode(): string { return this.props.postalCode; }
  get country(): string { return this.props.country; }

  static create(props: Address['props']): Address {
    if (!props.street || !props.city || !props.postalCode || !props.country) {
      throw new InvalidAddressError('All required address fields must be provided');
    }
    return new Address(props);
  }
}

// src/domain/shared/types/percentage.ts
export class Percentage extends ValueObject<{ value: number }> {
  get value(): number { return this.props.value; }

  static create(value: number): Percentage {
    if (value < 0 || value > 100) throw new Error('Percentage must be between 0 and 100');
    return new Percentage({ value });
  }

  applyTo(amount: number): number {
    return amount * (this.value / 100);
  }
}
```

---

## 4. Application Layer — Buses

### 4.1 Command Bus

```typescript
// src/application/commands/bus/ICommandBus.ts
export interface ICommandBus {
  execute<TCommand extends Command>(command: TCommand): Promise<void>;
  register<TCommand extends Command>(
    commandType: string,
    handler: ICommandHandler<TCommand>,
  ): void;
}

export interface ICommandHandler<TCommand extends Command> {
  execute(command: TCommand): Promise<void>;
}

export interface Command {
  type: string;
  payload: unknown;
  metadata: CommandMetadata;
}

export interface CommandMetadata {
  commandId: string;      // UUID — for idempotency
  userId: string;
  correlationId: string;
  timestamp: number;
}
```

### 4.2 Query Bus

```typescript
// src/application/queries/bus/IQueryBus.ts
export interface IQueryBus {
  execute<TQuery extends Query, TResult>(query: TQuery): Promise<TResult>;
  register<TQuery extends Query, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>,
  ): void;
}

export interface IQueryHandler<TQuery extends Query, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

export interface Query {
  type: string;
  payload: unknown;
}
```

### 4.3 Event Bus

```typescript
// src/application/events/bus/IEventBus.ts
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: IEventHandler): void;
}

export interface IEventHandler {
  handle(event: DomainEvent): Promise<void>;
}
```

---

## 5. Infrastructure Layer — Ports

### 5.1 Event Store Port

```typescript
// src/application/ports/IEventStore.ts
export interface IEventStore {
  save(
    aggregateId: string,
    aggregateType: string,
    events: ReadonlyArray<DomainEvent>,
    expectedVersion: number,
  ): Promise<void>;

  load(aggregateId: string): Promise<DomainEvent[]>;

  loadByType(
    aggregateType: string,
    fromTimestamp?: number,
  ): Promise<DomainEvent[]>;
}
```

### 5.2 Read Model Repository Port

```typescript
// src/application/ports/IReadModelRepository.ts
export interface IReadModelRepository {
  upsert<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    data: T,
  ): Promise<void>;

  update<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    partial: Partial<T>,
  ): Promise<void>;

  findById<T>(collection: string, id: string): Promise<T | null>;

  findMany<T>(
    collection: string,
    filters?: QueryFilter[],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<PaginatedResult<T>>;

  delete(collection: string, id: string): Promise<void>;
}

export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: unknown;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 5.3 File Storage Port

```typescript
// src/application/ports/IFileStorage.ts
export interface IFileStorage {
  upload(path: string, file: Buffer, contentType: string): Promise<string>; // returns URL
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresInMs: number): Promise<string>;
}
```

---

## 6. Infrastructure — Firestore Event Store

```typescript
// src/infrastructure/firebase/FirestoreEventStore.ts
export class FirestoreEventStore implements IEventStore {
  constructor(
    private readonly db: Firestore,
    private readonly eventBus: IEventBus,
  ) {}

  async save(
    aggregateId: string,
    aggregateType: string,
    events: ReadonlyArray<DomainEvent>,
    expectedVersion: number,
  ): Promise<void> {
    const aggregateRef = this.db.collection('events').doc(aggregateId);

    await this.db.runTransaction(async (tx) => {
      const metaDoc = await tx.get(aggregateRef);
      const currentVersion = metaDoc.exists
        ? metaDoc.data()?.latestVersion ?? 0
        : 0;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Expected version ${expectedVersion}, got ${currentVersion}`,
        );
      }

      // Write metadata
      tx.set(aggregateRef, {
        aggregateType,
        latestVersion: expectedVersion + events.length,
        updatedAt: Date.now(),
      }, { merge: true });

      // Write each event to subcollection
      for (const event of events) {
        const eventRef = aggregateRef.collection('events').doc(event.eventId);
        tx.set(eventRef, {
          ...event,
          _timestamp: Date.now(), // Firestore server timestamp
        });
      }
    });

    // Publish events after successful commit
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }

  async load(aggregateId: string): Promise<DomainEvent[]> {
    const snapshot = await this.db
      .collection('events')
      .doc(aggregateId)
      .collection('events')
      .orderBy('version', 'asc')
      .get();

    return snapshot.docs.map(doc => doc.data() as DomainEvent);
  }
}
```

---

## 7. Infrastructure — Express Bootstrap

### Middleware Stack

```typescript
// Middleware execution order:
// 1. CORS
// 2. Helmet (security headers)
// 3. Body parser (JSON, 10MB limit)
// 4. Request ID (attaches correlationId to req)
// 5. Structured logging (Pino)
// 6. Auth (Firebase JWT verification — skips public routes)
// 7. Rate limiting
// 8. Routes
// 9. Error handler (catches all, maps to HTTP status)
```

### Error Handler Middleware

```typescript
// src/infrastructure/http/middleware/errorHandler.ts
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const logger = req.log; // Pino child logger

  if (err instanceof DomainError) {
    logger.warn({ err }, 'Domain error');
    res.status(422).json({ error: err.name, message: err.message });
  } else if (err instanceof ApplicationError) {
    logger.warn({ err }, 'Application error');
    res.status(err.statusCode).json({ error: err.name, message: err.message });
  } else if (err instanceof ConcurrencyError) {
    logger.warn({ err }, 'Concurrency conflict');
    res.status(409).json({ error: 'ConcurrencyConflict', message: err.message });
  } else {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'InternalServerError', message: 'An unexpected error occurred' });
  }
}
```

---

## 8. Projection Engine

```typescript
// src/infrastructure/projections/ProjectionEngine.ts
export class ProjectionEngine {
  private projections: Map<string, IProjection[]> = new Map();

  register(projection: IProjection): void {
    for (const eventType of projection.subscribedEvents) {
      const existing = this.projections.get(eventType) ?? [];
      existing.push(projection);
      this.projections.set(eventType, existing);
    }
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.projections.get(event.eventType) ?? [];
    await Promise.allSettled(
      handlers.map(p => p.handle(event)),
    );
  }
}

export interface IProjection {
  readonly subscribedEvents: string[];
  handle(event: DomainEvent): Promise<void>;
}
```

---

## 9. React App Scaffold

### Providers

```typescript
// src/app/providers.tsx
// Wraps the app with:
// 1. QueryClientProvider (TanStack Query)
// 2. AuthProvider (Firebase Auth context)
// 3. ThemeProvider (light/dark)
// 4. ToastProvider (notifications)
```

### Auth Context

```typescript
// src/stores/authStore.ts (Zustand)
interface AuthState {
  user: FirebaseUser | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

### API Client

```typescript
// src/lib/api.ts
// Axios instance with:
// - Base URL from environment
// - Request interceptor: attach Firebase JWT as Bearer token
// - Response interceptor: handle 401 → redirect to login
// - Response interceptor: handle 409 → concurrency conflict toast
// - Typed request/response generics
```

---

## 10. Shared Validation Schemas (Zod)

```typescript
// shared/validation/schemas.ts
// Shared between frontend and backend via monorepo workspace

export const emailSchema = z.string().email().transform(s => s.toLowerCase().trim());
export const moneySchema = z.object({ amount: z.number().nonnegative(), currency: currencyCodeSchema });
export const currencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN', 'BRL', 'COP']);
export const paginationSchema = z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(100).default(20) });
export const addressSchema = z.object({ street: z.string().min(1), city: z.string().min(1), state: z.string().optional(), postalCode: z.string().min(1), country: z.string().min(1) });
```

---

## 11. Firestore Indexes

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "version", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "eventType", "order": "ASCENDING" },
        { "fieldPath": "metadata.timestamp", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 12. Acceptance Criteria

- [ ] Monorepo initializes with `client/`, `server/`, `functions/`, `shared/` workspaces
- [ ] `AggregateRoot`, `Entity`, `ValueObject`, `DomainEvent`, `DomainError` base classes compile with zero external imports
- [ ] All 15 branded ID types compile and prevent cross-assignment
- [ ] `Money` value object handles arithmetic, currency validation, and rounding
- [ ] Event Store saves events to Firestore with optimistic concurrency and rejects version conflicts with 409
- [ ] Event Store loads and replays events in version order
- [ ] Command Bus routes commands to registered handlers
- [ ] Query Bus routes queries to registered handlers
- [ ] Event Bus publishes events to subscribed projections
- [ ] Projection Engine dispatches events to correct projections
- [ ] Express server boots with full middleware stack
- [ ] Auth middleware rejects requests without valid Firebase JWT
- [ ] React app renders with routing, auth context, and theme provider
- [ ] Axios client attaches JWT and handles 401 redirect
- [ ] Zod schemas validate shared types between frontend and backend

---

## 13. File Manifest

```
server/src/domain/shared/AggregateRoot.ts
server/src/domain/shared/Entity.ts
server/src/domain/shared/ValueObject.ts
server/src/domain/shared/DomainEvent.ts
server/src/domain/shared/DomainError.ts
server/src/domain/shared/types/branded.ts
server/src/domain/shared/types/money.ts
server/src/domain/shared/types/email.ts
server/src/domain/shared/types/phone.ts
server/src/domain/shared/types/address.ts
server/src/domain/shared/types/percentage.ts
server/src/application/commands/bus/ICommandBus.ts
server/src/application/commands/bus/InProcessCommandBus.ts
server/src/application/queries/bus/IQueryBus.ts
server/src/application/queries/bus/InProcessQueryBus.ts
server/src/application/events/bus/IEventBus.ts
server/src/application/events/bus/InProcessEventBus.ts
server/src/application/ports/IEventStore.ts
server/src/application/ports/IReadModelRepository.ts
server/src/application/ports/IFileStorage.ts
server/src/infrastructure/firebase/firebaseAdmin.ts
server/src/infrastructure/firebase/FirestoreEventStore.ts
server/src/infrastructure/firebase/FirestoreReadModelRepo.ts
server/src/infrastructure/firebase/FirebaseStorageAdapter.ts
server/src/infrastructure/projections/ProjectionEngine.ts
server/src/infrastructure/http/middleware/errorHandler.ts
server/src/infrastructure/http/middleware/requestId.ts
server/src/infrastructure/http/middleware/rateLimiter.ts
server/src/infrastructure/http/middleware/validation.ts
server/src/infrastructure/auth/FirebaseAuthMiddleware.ts
server/src/infrastructure/di/container.ts
server/src/main.ts
shared/validation/schemas.ts
shared/constants/enums.ts
client/src/app/App.tsx
client/src/app/router.tsx
client/src/app/providers.tsx
client/src/stores/authStore.ts
client/src/stores/uiStore.ts
client/src/lib/api.ts
client/src/lib/firebase.ts
client/src/lib/queryClient.ts
```
