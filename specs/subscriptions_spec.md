# Module: Subscriptions

## Purpose
Track active service subscriptions (streaming, SaaS). Record billing cycles, costs, and renewal dates.

## Aggregate: Subscription
- Attributes: serviceName, plan, cost, currency, billingCycle (monthly/annual), nextBillingDate, status (active, paused, cancelled), provider, notes

## Commands
- `StartSubscription`
- `UpdateSubscription`
- `RenewSubscription` (auto or manual, triggers spending)
- `PauseSubscription`
- `CancelSubscription`

## Events
- `SubscriptionStarted`, `SubscriptionUpdated`, `SubscriptionRenewed`, `SubscriptionPaused`, `SubscriptionCancelled`

## Projections
- `subscriptions` collection

## API
- `POST /api/subscriptions`
- `GET /api/subscriptions`
- `PUT /api/subscriptions/:id`
- `POST /api/subscriptions/:id/renew`
- `POST /api/subscriptions/:id/pause|cancel`