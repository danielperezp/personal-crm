# Module: Projects

## Purpose
Manage internal projects or client engagements. Track tasks, timelines, and associated financials (linked invoices/expenses).

## Aggregate: Project
- Attributes: name, description, clientId (optional customer), startDate, endDate, status (active, completed, on‑hold, cancelled), budgetAmount, tasks[] (embedded or separate aggregate?)

For simplicity, tasks as embedded list within Project aggregate initially.

## Commands
- `CreateProject`
- `UpdateProject`
- `AddTaskToProject`
- `UpdateTask`
- `CompleteProject`

## Events
- `ProjectCreated`, `ProjectUpdated`, `TaskAddedToProject`, `TaskUpdated`, `ProjectCompleted`

## Projections
- `projects` collection; each document contains tasks array for read simplicity.

## API
- `POST /api/projects`
- `GET /api/projects`
- `PUT /api/projects/:id`
- `POST /api/projects/:id/tasks`
- `PUT /api/projects/:id/tasks/:taskId`