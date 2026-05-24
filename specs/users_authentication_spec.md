# Module: Users & Authentication

## Purpose
Manage user identities, roles, and profiles. Integration with Firebase Authentication for sign‑up/login. A user record is created upon first login.

## Aggregate: User
- State: userId, email, displayName, role (user | admin), createdAt, updatedAt, isActive

## Commands
- `RegisterUser` (triggered by Firebase Auth onCreate – handled by Cloud Function)
- `UpdateProfile` (userId, displayName)
- `ChangeRole` (admin only; userId, newRole)
- `DeactivateUser` (admin only; userId)
- `ReactivateUser` (admin only; userId)

## Events
- `UserRegistered` (userId, email, timestamp)
- `UserProfileUpdated` (userId, displayName, timestamp)
- `UserRoleChanged` (userId, newRole, changedBy, timestamp)
- `UserDeactivated` (userId, timestamp)
- `UserReactivated` (userId, timestamp)

## Projections
- `users` collection: id = userId, fields: email, displayName, role, isActive, createdAt

## API Endpoints (Express)
- `GET /api/users/me` – get current user profile
- `PUT /api/users/me` – update profile
- `GET /api/users` – admin list users
- `PUT /api/users/:id/role` – admin change role
- `PUT /api/users/:id/activate|deactivate` – admin toggle active

## Firebase Setup
- Firebase Auth for email/password (or Google sign‑in)
- Cloud Function `onUserCreate` → dispatches `RegisterUser` command to backend (or directly publishes `UserRegistered` event)
- Firestore `users` collection populated by projection handler