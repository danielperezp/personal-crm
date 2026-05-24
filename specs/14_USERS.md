# Module 14 — Users (IAM)

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Users (Identity & Access Management)
> **Bounded Context:** Governance Context
> **Phase:** 1 (Weeks 1–4)
> **Status:** Draft

---

## 1. Overview

The Users module manages identity, authentication, and authorization for NexusCommand. It wraps Firebase Authentication with a domain-level User aggregate that tracks roles, permissions, preferences, and login activity. As the first module built (Phase 1), it provides the auth foundation that all other modules depend on.

---

## 2. Aggregate: `User`

```
User (Aggregate Root)
├── userId: UserId
├── firebaseUid: string              // Firebase Auth UID — immutable
├── email: Email
├── displayName: string
├── avatarUrl?: string
├── role: UserRole                   // Owner | Admin | Viewer
├── permissions: Permission[]
├── status: UserStatus               // Active | Suspended | Deactivated
├── lastLoginAt?: Timestamp
├── preferences: UserPreferences     // Value Object
│   ├── theme: 'light' | 'dark'
│   ├── currency: CurrencyCode       // Default currency for new entities
│   ├── dateFormat: string            // e.g., 'YYYY-MM-DD', 'MM/DD/YYYY'
│   └── timezone: string             // e.g., 'America/New_York'
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- There must always be at least one Owner in the system.
- Cannot deactivate the last remaining Owner.
- Cannot change an Owner's role unless another Owner exists.
- firebaseUid is immutable after registration.
- Email must match the Firebase Auth email.

### Enums

```typescript
type UserRole = 'Owner' | 'Admin' | 'Viewer';
type UserStatus = 'Active' | 'Suspended' | 'Deactivated';

type Permission =
  | 'customers:read' | 'customers:write'
  | 'invoices:read'  | 'invoices:write'
  | 'payments:read'  | 'payments:write'
  | 'expenses:read'  | 'expenses:write'
  | 'receipts:read'  | 'receipts:write'
  | 'bills:read'     | 'bills:write'
  | 'subscriptions:read' | 'subscriptions:write'
  | 'utilities:read' | 'utilities:write'
  | 'orders:read'    | 'orders:write'
  | 'purchases:read' | 'purchases:write'
  | 'projects:read'  | 'projects:write'
  | 'assets:read'    | 'assets:write'
  | 'investments:read' | 'investments:write'
  | 'accountability:read' | 'accountability:write'
  | 'users:manage'
  | 'system:config'
  | 'events:replay';
```

### Role → Default Permissions

```
Owner  → ALL permissions
Admin  → ALL except users:manage, system:config, events:replay
Viewer → All *:read permissions only
```

---

## 3. Domain Events

| Event | Payload |
|---|---|
| `UserRegistered` | `{ userId, firebaseUid, email, displayName, role }` |
| `UserUpdated` | `{ changes: { displayName?, avatarUrl? } }` |
| `UserRoleChanged` | `{ from, to, changedBy }` |
| `UserPermissionsUpdated` | `{ permissions }` |
| `UserSuspended` | `{ reason?, suspendedBy }` |
| `UserReactivated` | `{ reactivatedBy }` |
| `UserDeactivated` | `{ reason?, deactivatedBy }` |
| `UserPreferencesUpdated` | `{ changes }` |
| `UserLoggedIn` | `{ loginAt, ipAddress? }` |

---

## 4. Commands

| Command | Payload |
|---|---|
| `RegisterUser` | `{ firebaseUid, email, displayName, role? }` |
| `UpdateUser` | `{ userId, changes: { displayName?, avatarUrl? } }` |
| `ChangeUserRole` | `{ userId, newRole }` |
| `UpdateUserPermissions` | `{ userId, permissions }` |
| `SuspendUser` | `{ userId, reason? }` |
| `ReactivateUser` | `{ userId }` |
| `DeactivateUser` | `{ userId, reason? }` |
| `UpdateUserPreferences` | `{ userId, changes }` |
| `RecordLogin` | `{ userId }` — system command on auth |

---

## 5. Queries

| Query | Response |
|---|---|
| `GetUserList` | `PaginatedResult<UserListDTO>` — filters: role, status |
| `GetUserDetail` | `UserDetailDTO` |
| `GetCurrentUser` | `UserDetailDTO` — from auth context |
| `GetUserPermissions` | `Permission[]` — for auth middleware |

---

## 6. Read Model: `rm_users`

```typescript
interface UserListReadModel {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: number;
  createdAt: number;
}
```

---

## 7. Auth Flow Integration

```
1. User signs in via Firebase Auth SDK (client)
2. Client receives Firebase JWT
3. Client attaches JWT as Bearer token to all API requests
4. Express auth middleware verifies JWT via Firebase Admin SDK
5. Middleware extracts firebaseUid → looks up UserId from rm_users
6. Attaches userId, role, permissions to request context
7. Route-level permission checks: req.user.permissions.includes('invoices:write')
```

### First User Bootstrap

```
On first app launch (no users exist):
1. User signs up via Firebase Auth
2. Backend detects zero users in system
3. Auto-registers user as Owner with all permissions
4. Subsequent users must be invited by Owner
```

---

## 8. API Endpoints

```
POST   /api/v1/users/commands/RegisterUser
POST   /api/v1/users/commands/UpdateUser
POST   /api/v1/users/commands/ChangeUserRole
POST   /api/v1/users/commands/UpdateUserPermissions
POST   /api/v1/users/commands/SuspendUser
POST   /api/v1/users/commands/ReactivateUser
POST   /api/v1/users/commands/DeactivateUser
POST   /api/v1/users/commands/UpdateUserPreferences

GET    /api/v1/users
GET    /api/v1/users/:id
GET    /api/v1/users/:id/events
GET    /api/v1/users/me                              → Current user
```

---

## 9. Frontend

### Pages

| Route | Page |
|---|---|
| `/settings/users` | `UserManagementPage` — user list (Owner-only) |
| `/settings` | `SettingsPage` — user preferences, theme, currency, timezone |

### Key Components

- `UserTable.tsx` — Name, email, role badge, status, last login
- `InviteUserDialog.tsx` — Invite by email with role selector
- `UserRoleSelector.tsx` — Role dropdown with permission preview
- `UserStatusActions.tsx` — Suspend, reactivate, deactivate actions
- `PreferencesForm.tsx` — Theme toggle, currency select, date format, timezone
- `UserAvatar.tsx` — Avatar with initials fallback

---

## 10. Acceptance Criteria

- [ ] First sign-up auto-registers as Owner
- [ ] Can register additional users with role assignment
- [ ] Cannot deactivate or demote the last Owner
- [ ] Role changes update effective permissions immediately
- [ ] Suspended users cannot authenticate (middleware rejects)
- [ ] User preferences (theme, currency, timezone) persist and apply
- [ ] Login events are tracked
- [ ] Permission checks enforce access control on all API routes
- [ ] User management page is Owner-only
- [ ] All transitions produce domain events

---

## 11. File Manifest

```
server/src/domain/user/User.ts
server/src/domain/user/User.events.ts
server/src/domain/user/User.errors.ts
server/src/domain/user/IUserRepository.ts
server/src/domain/user/vo/UserPreferences.ts
server/src/application/commands/handlers/user/*
server/src/application/queries/handlers/user/*
server/src/application/dto/UserDTO.ts
server/src/infrastructure/projections/UserListProjection.ts
server/src/infrastructure/auth/FirebaseAuthMiddleware.ts
server/src/infrastructure/auth/PermissionGuard.ts
server/src/infrastructure/http/routes/userRoutes.ts
server/src/infrastructure/http/controllers/UserController.ts
client/src/features/users/**
client/src/stores/authStore.ts
```
