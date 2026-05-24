# Module 01 — Customers

> **Parent Spec:** NexusCommand — Personal CRM & Admin Management Platform
> **Module:** Customers
> **Bounded Context:** Customer Context
> **Phase:** 2 (Weeks 5–8)
> **Status:** Draft

---

## 1. Overview

The Customers module is the relational backbone of NexusCommand. Every invoice, order, project, and payment ultimately ties back to a customer. This module manages the full customer lifecycle — from prospect acquisition through active engagement to archival — with a complete interaction timeline aggregated from all linked modules.

---

## 2. Scope

### In Scope

- Customer CRUD (create, read, update, archive, reactivate)
- Multi-address management (billing, shipping)
- Tagging and segmentation
- Notes / interaction log
- Acquisition source tracking
- Customer 360° detail view with cross-module timeline
- Customer list with search, filter, sort, pagination

### Out of Scope

- Email campaigns or marketing automation
- Customer portal / self-service
- Lead scoring or pipeline management (V2)

---

## 3. Aggregate: `Customer`

```
Customer (Aggregate Root)
├── customerId: CustomerId
├── name: string
├── email: Email                    // Value Object
├── phone?: Phone                   // Value Object
├── company?: string
├── tags: Tag[]
├── addresses: Address[]            // Value Object[]
├── notes: Note[]                   // Entity
│   ├── noteId: string
│   ├── content: string
│   ├── createdBy: UserId
│   └── createdAt: Timestamp
├── status: CustomerStatus          // Active | Archived | Prospect
├── source: AcquisitionSource       // Referral | Organic | Direct | Other
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Invariants

- Email must be unique across all customers with status ≠ Archived.
- At least one address is required before the customer can be linked to an invoice.
- Cannot archive a customer who has open (Draft, Issued, Overdue) invoices.
- Cannot delete a customer — only archive (event sourcing preserves all history).
- A customer must have a non-empty name.
- Tags are case-insensitive and deduplicated.

### Enums

```typescript
type CustomerStatus = 'Active' | 'Archived' | 'Prospect';
type AcquisitionSource = 'Referral' | 'Organic' | 'Direct' | 'Other';
```

---

## 4. Domain Events

| Event | Payload | Triggered When |
|---|---|---|
| `CustomerCreated` | `{ name, email, phone?, company?, address, source, tags }` | New customer is added |
| `CustomerUpdated` | `{ changes: Partial<CustomerFields> }` | Name, email, phone, company updated |
| `CustomerAddressAdded` | `{ address: Address }` | New address added |
| `CustomerAddressRemoved` | `{ addressIndex: number }` | Address removed |
| `CustomerTagged` | `{ tag: string }` | Tag added |
| `CustomerUntagged` | `{ tag: string }` | Tag removed |
| `CustomerNoteAdded` | `{ noteId, content, createdBy }` | Interaction note logged |
| `CustomerArchived` | `{ reason?: string }` | Customer archived |
| `CustomerReactivated` | `{}` | Archived customer reactivated |
| `CustomerStatusChanged` | `{ from: CustomerStatus, to: CustomerStatus }` | Prospect → Active, etc. |

### Integration Events (published to other contexts)

| Event | Consumed By | Effect |
|---|---|---|
| `CustomerCreated` | Financial Context | Auto-create billing profile in read models |
| `CustomerArchived` | Financial, Operations | Flag linked entities, prevent new invoices/orders |

---

## 5. Commands

| Command | Payload | Validation |
|---|---|---|
| `CreateCustomer` | `{ name, email, phone?, company?, address, source?, tags? }` | Email format, uniqueness check, name non-empty |
| `UpdateCustomer` | `{ customerId, changes: { name?, email?, phone?, company? } }` | If email changed, uniqueness check |
| `AddCustomerAddress` | `{ customerId, address: AddressDTO }` | All required address fields present |
| `RemoveCustomerAddress` | `{ customerId, addressIndex }` | Index exists, at least one address remains if linked to invoices |
| `AddCustomerTag` | `{ customerId, tag }` | Tag non-empty, not already present |
| `RemoveCustomerTag` | `{ customerId, tag }` | Tag exists |
| `AddCustomerNote` | `{ customerId, content }` | Content non-empty |
| `ArchiveCustomer` | `{ customerId, reason? }` | No open invoices |
| `ReactivateCustomer` | `{ customerId }` | Status is Archived |
| `ChangeCustomerStatus` | `{ customerId, newStatus }` | Valid transition |

---

## 6. Queries

| Query | Response | Filters |
|---|---|---|
| `GetCustomerList` | `PaginatedResult<CustomerListDTO>` | status, source, tags, search (name/email), sort, pagination |
| `GetCustomerDetail` | `CustomerDetailDTO` | customerId |
| `GetCustomerTimeline` | `TimelineEntry[]` | customerId, pagination |
| `GetCustomersByTag` | `CustomerListDTO[]` | tag |
| `SearchCustomers` | `CustomerListDTO[]` | query (full-text on name, email, company) |

---

## 7. Read Model Projections

### `CustomerListProjection`

**Collection:** `rm_customers`

```typescript
interface CustomerListReadModel {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  source: AcquisitionSource;
  tags: string[];
  addressCount: number;
  noteCount: number;
  // Cross-module aggregated counts (updated by other module projections)
  invoiceCount: number;
  orderCount: number;
  projectCount: number;
  totalRevenue: number;        // Sum of paid invoices
  lastInteractionAt?: number;
  createdAt: number;
  updatedAt: number;
}
```

**Subscribed Events:** `CustomerCreated`, `CustomerUpdated`, `CustomerArchived`, `CustomerReactivated`, `CustomerTagged`, `CustomerUntagged`, `CustomerNoteAdded`, `CustomerAddressAdded`, `CustomerAddressRemoved`

### `CustomerDetailProjection`

**Collection:** `rm_customer_details`

```typescript
interface CustomerDetailReadModel {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  source: AcquisitionSource;
  tags: string[];
  addresses: Address[];
  notes: Note[];
  // Cross-module linked data (IDs + summary info)
  recentInvoices: InvoiceSummary[];   // Last 10
  recentOrders: OrderSummary[];       // Last 10
  recentPayments: PaymentSummary[];   // Last 10
  activeProjects: ProjectSummary[];
  totalRevenue: number;
  outstandingBalance: number;
  createdAt: number;
  updatedAt: number;
}
```

**Subscribed Events:** All Customer events + `InvoiceIssued`, `InvoiceMarkedPaid`, `OrderPlaced`, `OrderDelivered`, `PaymentCompleted`, `ProjectCreated`

---

## 8. API Endpoints

```
POST   /api/v1/customers/commands/CreateCustomer
POST   /api/v1/customers/commands/UpdateCustomer
POST   /api/v1/customers/commands/AddCustomerAddress
POST   /api/v1/customers/commands/RemoveCustomerAddress
POST   /api/v1/customers/commands/AddCustomerTag
POST   /api/v1/customers/commands/RemoveCustomerTag
POST   /api/v1/customers/commands/AddCustomerNote
POST   /api/v1/customers/commands/ArchiveCustomer
POST   /api/v1/customers/commands/ReactivateCustomer

GET    /api/v1/customers                          → Paginated list
GET    /api/v1/customers/:id                      → Detail view
GET    /api/v1/customers/:id/timeline             → Cross-module timeline
GET    /api/v1/customers/:id/events               → Audit trail
GET    /api/v1/customers/search?q=                → Full-text search
```

---

## 9. Frontend Pages & Components

### Pages

| Route | Page | Description |
|---|---|---|
| `/customers` | `CustomerListPage` | DataTable with filters, search, bulk actions |
| `/customers/:id` | `CustomerDetailPage` | Tabbed view: Overview, Invoices, Orders, Projects, Timeline, Notes |

### Feature Components

```
features/customers/
├── components/
│   ├── CustomerTable.tsx              # TanStack Table with columns config
│   ├── CustomerFilters.tsx            # Status, source, tag filter bar
│   ├── CustomerCreateDialog.tsx       # Modal form for new customer
│   ├── CustomerEditForm.tsx           # Inline edit form
│   ├── CustomerDetailHeader.tsx       # Name, status badge, actions dropdown
│   ├── CustomerAddressCard.tsx        # Address display + add/remove
│   ├── CustomerTagManager.tsx         # Tag chips with add/remove
│   ├── CustomerNotesList.tsx          # Notes timeline
│   ├── CustomerNoteForm.tsx           # Add note textarea
│   ├── CustomerTimeline.tsx           # Cross-module activity feed
│   └── CustomerStatsBar.tsx           # Revenue, invoices, orders quick stats
├── hooks/
│   ├── useCustomers.ts                # TanStack Query — list
│   ├── useCustomerDetail.ts           # TanStack Query — detail
│   ├── useCustomerTimeline.ts         # TanStack Query — timeline
│   ├── useCreateCustomer.ts           # TanStack Mutation
│   ├── useUpdateCustomer.ts           # TanStack Mutation
│   └── useArchiveCustomer.ts          # TanStack Mutation
├── api/
│   └── customerApi.ts                 # Typed Axios calls
└── types/
    └── customer.types.ts              # DTOs, enums
```

### UI Behavior

- **List Page**: Default sorted by `lastInteractionAt DESC`. Status badges color-coded (Active=green, Prospect=blue, Archived=gray). Click row → navigate to detail. Bulk archive via checkbox selection.
- **Detail Page**: Tabbed layout. Overview tab shows stats bar + addresses + notes. Each linked module tab (Invoices, Orders, Projects) shows a mini-table with links. Timeline tab shows unified event feed.
- **Create Dialog**: Modal with required fields (name, email) and optional fields. Form validated with React Hook Form + Zod. On success, navigate to new customer detail.

---

## 10. Zod Schemas

```typescript
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: emailSchema,
  phone: z.string().optional(),
  company: z.string().optional(),
  address: addressSchema,
  source: z.enum(['Referral', 'Organic', 'Direct', 'Other']).default('Direct'),
  tags: z.array(z.string()).default([]),
});

export const updateCustomerSchema = z.object({
  customerId: z.string(),
  changes: z.object({
    name: z.string().min(1).max(200).optional(),
    email: emailSchema.optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
  }).refine(obj => Object.keys(obj).length > 0, 'At least one change required'),
});
```

---

## 11. Acceptance Criteria

- [ ] Can create a customer with name, email, address, and optional fields
- [ ] Email uniqueness enforced — duplicate email returns 422
- [ ] Can update customer name, email, phone, company independently
- [ ] Can add/remove addresses; cannot remove last address if customer has invoices
- [ ] Can add/remove tags; tags are case-insensitive and deduplicated
- [ ] Can add notes with author tracking
- [ ] Can archive a customer; archiving blocked if open invoices exist
- [ ] Can reactivate an archived customer
- [ ] Customer list supports filtering by status, source, tags with pagination
- [ ] Full-text search works on name, email, company
- [ ] Customer detail page shows 360° view with linked invoices, orders, projects
- [ ] Timeline shows cross-module events in chronological order
- [ ] Audit trail endpoint returns all domain events for the customer aggregate
- [ ] All state changes produce domain events; no direct state mutation

---

## 12. File Manifest

```
server/src/domain/customer/Customer.ts
server/src/domain/customer/Customer.events.ts
server/src/domain/customer/Customer.errors.ts
server/src/domain/customer/ICustomerRepository.ts
server/src/domain/customer/vo/                          # Value objects specific to customer
server/src/application/commands/handlers/customer/CreateCustomerHandler.ts
server/src/application/commands/handlers/customer/UpdateCustomerHandler.ts
server/src/application/commands/handlers/customer/ArchiveCustomerHandler.ts
server/src/application/commands/handlers/customer/ReactivateCustomerHandler.ts
server/src/application/commands/handlers/customer/AddCustomerNoteHandler.ts
server/src/application/commands/handlers/customer/AddCustomerTagHandler.ts
server/src/application/commands/handlers/customer/AddCustomerAddressHandler.ts
server/src/application/queries/handlers/customer/GetCustomerListHandler.ts
server/src/application/queries/handlers/customer/GetCustomerDetailHandler.ts
server/src/application/queries/handlers/customer/GetCustomerTimelineHandler.ts
server/src/application/dto/CustomerDTO.ts
server/src/infrastructure/projections/CustomerListProjection.ts
server/src/infrastructure/projections/CustomerDetailProjection.ts
server/src/infrastructure/http/routes/customerRoutes.ts
server/src/infrastructure/http/controllers/CustomerController.ts
client/src/features/customers/**
```
