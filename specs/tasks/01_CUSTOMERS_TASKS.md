# Tasks — Module 01: Customers

> **Phase:** 2 (Weeks 5–8)
> **Dependencies:** Module 00 (Foundation)
> **Estimated Tasks:** 52

---

## 1. Domain Layer

- [ ] T-0110: Implement `Customer` aggregate root — constructor, factory method `Customer.create(props)`, internal state properties
- [ ] T-0111: Implement `Customer.when(event)` state transition handler for all customer events
- [ ] T-0112: Implement `Customer.create()` — validate name non-empty, create `CustomerCreated` event
- [ ] T-0113: Implement `Customer.update(changes)` — validate email format if changed, emit `CustomerUpdated`
- [ ] T-0114: Implement `Customer.addAddress(address)` — validate address VO, emit `CustomerAddressAdded`
- [ ] T-0115: Implement `Customer.removeAddress(index)` — validate index exists, emit `CustomerAddressRemoved`
- [ ] T-0116: Implement `Customer.addTag(tag)` — normalize to lowercase, deduplicate, emit `CustomerTagged`
- [ ] T-0117: Implement `Customer.removeTag(tag)` — validate tag exists, emit `CustomerUntagged`
- [ ] T-0118: Implement `Customer.addNote(content, createdBy)` — validate non-empty, emit `CustomerNoteAdded`
- [ ] T-0119: Implement `Customer.archive(reason?)` — validate no open invoices (passed as param from handler), emit `CustomerArchived`
- [ ] T-0120: Implement `Customer.reactivate()` — validate status is Archived, emit `CustomerReactivated`
- [ ] T-0121: Implement `Customer.changeStatus(newStatus)` — validate valid transition, emit `CustomerStatusChanged`
- [ ] T-0122: Define `Customer.events.ts` — all event type interfaces with typed payloads using `EventEnvelope`
- [ ] T-0123: Define `Customer.errors.ts` — `CustomerEmailConflictError`, `CustomerNotFoundError`, `CustomerHasOpenInvoicesError`, `CustomerAlreadyArchivedError`
- [ ] T-0124: Define `ICustomerRepository` port — `ensureEmailUnique(email, excludeId?)`, `hasOpenInvoices(customerId)`
- [ ] T-0125: Write unit tests for `Customer` aggregate — create, update, add/remove address, add/remove tag, add note, archive (success + failure), reactivate

---

## 2. Application Layer — Command Handlers

- [ ] T-0126: Implement `CreateCustomerHandler` — validate email uniqueness via repo, create aggregate, save to event store
- [ ] T-0127: Implement `UpdateCustomerHandler` — load aggregate from event store, apply update, check email uniqueness if changed, save
- [ ] T-0128: Implement `AddCustomerAddressHandler` — load, apply, save
- [ ] T-0129: Implement `RemoveCustomerAddressHandler` — load, validate index, apply, save
- [ ] T-0130: Implement `AddCustomerTagHandler` — load, apply, save
- [ ] T-0131: Implement `RemoveCustomerTagHandler` — load, apply, save
- [ ] T-0132: Implement `AddCustomerNoteHandler` — load, apply, save
- [ ] T-0133: Implement `ArchiveCustomerHandler` — load, check open invoices via repo, apply, save
- [ ] T-0134: Implement `ReactivateCustomerHandler` — load, apply, save
- [ ] T-0135: Register all customer command handlers in DI container / command bus

---

## 3. Application Layer — Query Handlers

- [ ] T-0136: Define `CustomerListDTO` and `CustomerDetailDTO` in `CustomerDTO.ts`
- [ ] T-0137: Implement `GetCustomerListHandler` — query `rm_customers` with filters (status, source, tags, search), pagination, sort
- [ ] T-0138: Implement `GetCustomerDetailHandler` — query `rm_customer_details` by ID
- [ ] T-0139: Implement `GetCustomerTimelineHandler` — query `rm_activity_timeline` filtered by customerId, paginated
- [ ] T-0140: Implement `SearchCustomersHandler` — full-text search on name, email, company fields in `rm_customers`
- [ ] T-0141: Register all customer query handlers in DI container / query bus

---

## 4. Application Layer — Zod Schemas

- [ ] T-0142: Implement `createCustomerSchema` — name (required, min 1, max 200), email, phone?, company?, address, source, tags
- [ ] T-0143: Implement `updateCustomerSchema` — customerId, changes (at least one field required)
- [ ] T-0144: Implement `addCustomerNoteSchema` — customerId, content (non-empty)
- [ ] T-0145: Implement `archiveCustomerSchema` — customerId, reason?

---

## 5. Infrastructure — Projections

- [ ] T-0146: Implement `CustomerListProjection` — subscribe to `CustomerCreated`, `CustomerUpdated`, `CustomerArchived`, `CustomerReactivated`, `CustomerTagged`, `CustomerUntagged`, `CustomerNoteAdded`, `CustomerAddressAdded`, `CustomerAddressRemoved`; upsert/update `rm_customers`
- [ ] T-0147: Implement `CustomerDetailProjection` — subscribe to all Customer events + cross-module events (`InvoiceIssued`, `InvoiceMarkedPaid`, `OrderPlaced`, `PaymentCompleted`, `ProjectCreated`); upsert/update `rm_customer_details`
- [ ] T-0148: Register both projections in ProjectionEngine via DI container

---

## 6. Infrastructure — HTTP Layer

- [ ] T-0149: Implement `CustomerController` — methods for each command and query endpoint
- [ ] T-0150: Implement `customerRoutes.ts` — POST routes for 9 commands, GET routes for list, detail, timeline, search, events (audit trail)
- [ ] T-0151: Add Zod validation middleware to each command route
- [ ] T-0152: Add permission guards — `customers:write` for commands, `customers:read` for queries
- [ ] T-0153: Implement audit trail endpoint `GET /customers/:id/events` — loads raw events from event store for aggregate

---

## 7. Frontend — API & Hooks

- [ ] T-0154: Implement `customerApi.ts` — typed Axios calls for all endpoints
- [ ] T-0155: Implement `useCustomers` hook — TanStack Query for paginated list with filters
- [ ] T-0156: Implement `useCustomerDetail` hook — TanStack Query for single customer
- [ ] T-0157: Implement `useCustomerTimeline` hook — TanStack Query for timeline with pagination
- [ ] T-0158: Implement `useCreateCustomer` mutation hook — invalidates customer list on success
- [ ] T-0159: Implement `useUpdateCustomer` mutation hook — invalidates list + detail on success
- [ ] T-0160: Implement `useArchiveCustomer` mutation hook

---

## 8. Frontend — Components & Pages

- [ ] T-0161: Implement `CustomerListPage` — page layout with filters bar + data table + create button
- [ ] T-0162: Implement `CustomerTable` — TanStack Table with columns: name, email, company, status badge, tags, revenue, actions
- [ ] T-0163: Implement `CustomerFilters` — status dropdown, source dropdown, tag multi-select, search input
- [ ] T-0164: Implement `CustomerCreateDialog` — modal form with React Hook Form + Zod, fields: name, email, phone, company, address, source, tags
- [ ] T-0165: Implement `CustomerDetailPage` — tabbed layout: Overview, Invoices, Orders, Projects, Timeline, Notes
- [ ] T-0166: Implement `CustomerDetailHeader` — name, status badge, email, company, actions dropdown (edit, archive, reactivate)
- [ ] T-0167: Implement `CustomerEditForm` — inline edit form for name, email, phone, company
- [ ] T-0168: Implement `CustomerAddressCard` — list of addresses with add/remove actions
- [ ] T-0169: Implement `CustomerTagManager` — tag chips with add/remove, typeahead
- [ ] T-0170: Implement `CustomerNotesList` — chronological notes with author and timestamp
- [ ] T-0171: Implement `CustomerNoteForm` — textarea + submit button for adding notes
- [ ] T-0172: Implement `CustomerTimeline` — cross-module activity feed with module icons and links
- [ ] T-0173: Implement `CustomerStatsBar` — total revenue, invoice count, order count, project count
- [ ] T-0174: Add routes `/customers` and `/customers/:id` to router

---

## 9. Testing

- [ ] T-0175: Write integration tests for customer command endpoints — create, update, archive, reactivate
- [ ] T-0176: Write integration tests for customer query endpoints — list with filters, detail, search
- [ ] T-0177: Write integration test — email uniqueness violation returns 422
- [ ] T-0178: Write integration test — archive with open invoices returns 422
