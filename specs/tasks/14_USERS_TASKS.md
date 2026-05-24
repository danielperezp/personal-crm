# Tasks — Module 14: Users (IAM)

> **Phase:** 1 (Weeks 1–4)
> **Dependencies:** Module 00 (Foundation)
> **Estimated Tasks:** 38

---

## 1. Domain Layer

- [ ] T-0571: Implement `UserPreferences` value object — `theme`, `currency`, `dateFormat`, `timezone`
- [ ] T-0572: Implement `User` aggregate root — `User.register(props)`, `when()` handler
- [ ] T-0573: Implement `User.register()` — validate email, emit `UserRegistered`
- [ ] T-0574: Implement `User.update(changes)` — emit `UserUpdated`
- [ ] T-0575: Implement `User.changeRole(newRole)` — validate not last Owner demotion, emit `UserRoleChanged`
- [ ] T-0576: Implement `User.updatePermissions(permissions)` — emit `UserPermissionsUpdated`
- [ ] T-0577: Implement `User.suspend(reason?)` — validate Active, validate not last Owner, emit `UserSuspended`
- [ ] T-0578: Implement `User.reactivate()` — validate Suspended, emit `UserReactivated`
- [ ] T-0579: Implement `User.deactivate(reason?)` — validate not last Owner, emit `UserDeactivated`
- [ ] T-0580: Implement `User.updatePreferences(changes)` — emit `UserPreferencesUpdated`
- [ ] T-0581: Implement `User.recordLogin()` — emit `UserLoggedIn`
- [ ] T-0582: Implement role → default permissions mapping (Owner=ALL, Admin=ALL except manage/config/replay, Viewer=read-only)
- [ ] T-0583: Define `User.events.ts` — all event type interfaces
- [ ] T-0584: Define `User.errors.ts` — `LastOwnerError`, `UserAlreadyActiveError`, `UserNotSuspendedError`
- [ ] T-0585: Define `IUserRepository` port — `findByFirebaseUid(uid)`, `countByRole(role)`, `getUserCount()`
- [ ] T-0586: Write unit tests for User aggregate — register, role change, suspend, last-owner protection

---

## 2. Application Layer

- [ ] T-0587: Implement `RegisterUserHandler` — check if first user (auto-Owner), validate email, create aggregate, save
- [ ] T-0588: Implement `UpdateUserHandler` — load, apply, save
- [ ] T-0589: Implement `ChangeUserRoleHandler` — load, check Owner count if demoting Owner, apply, save
- [ ] T-0590: Implement `UpdateUserPermissionsHandler` — load, apply, save
- [ ] T-0591: Implement `SuspendUserHandler` — load, check Owner count, apply, save
- [ ] T-0592: Implement `ReactivateUserHandler` — load, apply, save
- [ ] T-0593: Implement `DeactivateUserHandler` — load, check Owner count, apply, save
- [ ] T-0594: Implement `UpdateUserPreferencesHandler` — load, apply, save
- [ ] T-0595: Implement `RecordLoginHandler` — load, apply, save (called by auth middleware on successful auth)
- [ ] T-0596: Register all handlers
- [ ] T-0597: Implement query handlers — GetUserList, GetUserDetail, GetCurrentUser, GetUserPermissions
- [ ] T-0598: Define `UserListDTO`, `UserDetailDTO`

---

## 3. Infrastructure

- [ ] T-0599: Implement `UserListProjection` — upsert `rm_users`
- [ ] T-0600: Register projection
- [ ] T-0601: Implement `PermissionGuard` middleware factory — `requirePermission('invoices:write')` → checks `req.user.permissions`
- [ ] T-0602: Update `FirebaseAuthMiddleware` to look up UserId from `rm_users` by firebaseUid, attach full user context including role + permissions to `req.user`
- [ ] T-0603: Implement first-user bootstrap logic — if `getUserCount() === 0`, auto-register as Owner
- [ ] T-0604: Implement `UserController` and `userRoutes.ts` — 8 command endpoints + 4 query endpoints
- [ ] T-0605: Add `users:manage` permission guard to user management routes (Owner-only)

---

## 4. Frontend

- [ ] T-0606: Implement `userApi.ts` and hooks
- [ ] T-0607: Implement `UserManagementPage` — DataTable with role badges, status, last login (Owner-only page)
- [ ] T-0608: Implement `UserTable` — columns: name, email, role badge, status, last login, actions
- [ ] T-0609: Implement `InviteUserDialog` — email input, role selector, permission preview
- [ ] T-0610: Implement `UserRoleSelector` — dropdown with role description + permission summary
- [ ] T-0611: Implement `UserStatusActions` — Suspend, Reactivate, Deactivate action buttons
- [ ] T-0612: Implement `SettingsPage` — user preferences: theme toggle, currency select, date format, timezone
- [ ] T-0613: Implement `PreferencesForm` — React Hook Form with Zod validation, save to UpdateUserPreferences
- [ ] T-0614: Implement `UserAvatar` — avatar image with initials fallback
- [ ] T-0615: Add routes `/settings` and `/settings/users` to router

---

## 5. Testing

- [ ] T-0616: Write integration tests — register first user as Owner, register second user
- [ ] T-0617: Write integration test — cannot demote/deactivate last Owner
- [ ] T-0618: Write integration test — suspended user rejected by auth middleware
- [ ] T-0619: Write integration test — Viewer cannot access write endpoints
