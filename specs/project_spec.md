# Business Overview Specification

This document outlines the architecture, technology stack, and module specifications for a **Personal CRM + Admin Management System**. The system handles customers, financial transactions, projects, and assets using event sourcing and CQRS patterns, implemented with a clean architecture and powered by Firebase.

## Technology Stack

- **Frontend**: React (hosted on Firebase Hosting)
- **Backend**: Express.js with TypeScript, Clean Architecture (layers: application, domain, infrastructure)
- **Patterns**: Event Sourcing, CQRS
- **Persistence**: Firebase Firestore (event store & read models), Firebase Storage (file attachments)
- **Authentication**: Firebase Authentication
- **Event Processing**: Firebase Cloud Functions (for asynchronous projections)
- **Monitoring**: Firebase Crashlytics, Google Cloud Logging

## Architecture Overview

- **Command side**: Express routes receive commands, validate them, load aggregates from the event store, execute domain logic, persist new events, and emit events (via Firestore writes) to trigger projections.
- **Query side**: Express routes serve pre-built read models stored in Firestore. Read models are updated asynchronously by Cloud Functions that listen to new events in the event store.
- **Event Store**: A Firestore collection (`events`) where each document represents an event. Documents are keyed by `{aggregateType}/{aggregateId}/events/{eventId}` or as a flat collection with fields `aggregateType`, `aggregateId`, `eventType`, `data`, `timestamp`, `version`.
- **Aggregates**: Each aggregate is event-sourced; its state is rebuilt from its event stream. No direct mutation of state; all changes captured as events.
- **Projections**: Dedicated Firestore collections for each read model, kept in sync by event handlers (Cloud Functions or triggered background jobs).

## Multi-Tenancy & Authorization

The system supports multiple users (e.g., family members, small team). Each record is scoped by `userId` (Firebase Auth UID).

- Roles: `user` (manages own data), `admin` (can manage all users and system settings).
- Auth enforced via Firebase Auth tokens verified in Express middleware.

## Module List

1. Users & Authentication  
2. Customers (contacts)  
3. Invoices  
4. Payments (received)  
5. Spendings (expenses)  
6. Receipts  
7. Bills  
8. Subscriptions  
9. Utilities  
10. Orders (customer sales orders)  
11. Accountability (budgets, financial tracking)  
12. Purchases (procurement/suppliers)  
13. Projects  
14. Assets  
15. Investments  

Each module follows a uniform specification format:

- **Domain Purpose**
- **Aggregate(s)**
- **Commands**
- **Events**
- **Read Models (Projections)**
- **API Endpoints**
- **Firebase Integration**