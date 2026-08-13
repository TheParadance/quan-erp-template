# 🧾 Accounting Plugin — Agent Skill

## Overview

The **Accounting Plugin** is a self-contained double-entry bookkeeping engine for the Quan ERP system. It is implemented as an `IPlugin` and exposes its logic through a NestJS-style module (`AccountingModule`) on the backend and a Vite/React component tree on the frontend.

**Plugin name:** `accounting`
**Version:** `1.0.0`
**Entry class (backend):** `AccountingPlugin` → `AccountingModule`

---

## Directory Structure

```
plugins/accounting/
├── backend/src/
│   ├── const/          # App config, developer config, event config
│   ├── dto/            # Request/response DTOs
│   ├── feature/        # Feature modules (account, journal, report, setting, dashboard, accounting-book)
│   ├── migrations/     # TypeORM migrations
│   ├── schema/         # TypeORM entity definitions
│   ├── types/          # Shared TypeScript types
│   ├── util/           # Utility helpers (plugin name, built-in service names)
│   ├── export.ts       # Public API surface for other plugins
│   └── index.ts        # Plugin entry point (implements IPlugin)
├── frontend/src/
│   ├── features/       # UI feature pages (chart-of-accounts, journals, banking, reports, settings, customer)
│   ├── shared-ui/      # Reusable React components
│   ├── store/          # Zustand stores (accounting-book-store)
│   ├── hooks/          # Custom React hooks
│   ├── helper/         # Frontend utility helpers
│   ├── lib/            # Metadata, constants
│   ├── types/          # Shared frontend types
│   ├── routes.tsx      # Plugin route definitions
│   ├── export.ts       # Exported API / shared components for other plugins
│   └── index.tsx       # Frontend plugin entry / PluginAPI registrations
├── module.metadata.json
├── features.md
└── readme.md
```

---

## Core Domain Concepts

### Chart of Accounts (COA)
Five account types, managed via `AccountService`:

| Type      | Description                    |
|-----------|--------------------------------|
| Asset     | Things the company owns        |
| Liability | Money owed to others           |
| Equity    | Owner's net value              |
| Income    | Revenue from operations        |
| Expense   | Costs incurred                 |

**Limits** are enforced by developer config keys:
- `DEVELOPER_CONFIG.NO_OF_CUSTOM_COAs` (default: 10)
- `DEVELOPER_CONFIG.NO_OF_ACCOUNTING_BOOKS` (default: 3)

### Accounting Book
An `AccountingBookEntity` is the top-level container scoped to a currency and fiscal year. On first init, a default **"Main Operating Book"** is seeded automatically via `AccountingModule.init()`.

### Journal Entry (Core Engine)
**Every financial transaction** is recorded as a `JournalEntry` linked to its source via a **polymorphic reference**:

```
plugin_name  +  table_name  +  reference_id
```

Each `JournalEntry` has one or more `JournalLine` rows (debit/credit pairs) that must balance to zero. Do **not** allow direct manual writes to the ledger — always go through `JournalService`.

**Entities involved:**
- `JournalEntryEntity` — header record
- `JournalLineEntity` — debit/credit lines
- `JournalEntryHistoryEntity` — audit trail
- `JournalEntryFileEntity` — attached files

---

## Backend Patterns

### Plugin Lifecycle (IPlugin)
The `AccountingPlugin` class in `index.ts` implements:

```ts
onInstall(appInstance)  // saves app instance
getRootModule()         // returns AccountingModule
getMigrations()         // returns [InitialMigration]
getMetadata()           // reads module.metadata.json
```

Hooks `onMigrate`, `onReady`, `isCompatible`, `isReady`, `isHealthy` are implemented (currently stubs / always-true).

### Module Setup
`AccountingModule` uses decorator-based DI (`@Module`, `@Cache`, `@Inject`, `@InjectDatabaseSource`). On `@OnInit()`, it seeds COAs and accounting books if not already done (checked via `DataSeedHistoryService`).

### Services
| Service                    | Responsibility                                  |
|----------------------------|-------------------------------------------------|
| `AccountService`           | CRUD for chart of accounts, system accounts     |
| `JournalService`           | Create/read/update journal entries & lines      |
| `ReportService`            | Balance Sheet, P&L, Cash Flow generation        |
| `AccountingSettingAPIService` | Seed accounts, manage accounting book settings |

### Adding a New Backend Feature
1. Create a directory under `backend/src/feature/<name>/`.
2. Add `<name>.controller.ts` and `<name>.service.ts`.
3. Register in `backend/src/const/app-config.ts` under `CONTROLLER_LIST` and `SERVICE_LIST`.
4. Export public types/DTOs from `backend/src/export.ts`.

---

## Frontend Patterns

### PluginAPI Registration (index.tsx)
Shared components and queries are registered on the `PluginAPI` bus using `APINames` enum keys defined in `export.ts`:

```ts
export enum APINames {
  JournalDetails        = "accounting-journal-details",
  AccountList           = "accounting-account-list",
  AccountingBookStore   = "accounting-book-store",
  UOMDropDown           = "accounting-uom-dropdown",
  AccountDropdown       = "accounting-account-dropdown",
  CurrencyInput         = "accounting-currency-input",
  SubJournal            = "accounting-sub-journal",
}
```

**To consume from another plugin**, import from `@quan-erp/accounting` and call the exported function:

```ts
import { AccountDropdown, CurrencyInput, SubJournalSection } from "@quan-erp/accounting";
```

### Shared Exported Components

| Export                      | Props summary                                                   |
|-----------------------------|-----------------------------------------------------------------|
| `AccountDropdown`           | `value`, `setValue`, `accountType`, `disabled`, ...            |
| `CurrencyInput`             | `value`, `onChange`, `basedCurrencyId`, `exchangeRate`, ...    |
| `SubJournalSection`         | `journalId`                                                     |
| `UOCDropdown`               | `value`, `setValue`, `isCompact`, `orgCategoryId`, ...         |
| `useAccountingBookStore()`  | Zustand store hook for active accounting book state            |
| `getExportAccountListQuery` | Infinite query for account list (type + pagination)            |
| `getExportJournalDetailsQuery` | Query for a single journal entry by ID                      |

### State Management
Global accounting book state lives in a Zustand store (`AccountingBookStore`). Access it via `useAccountingBookStore()` from any plugin.

### Adding a New Frontend Feature
1. Create a directory under `frontend/src/features/<name>/`.
2. Add page components and any API hooks.
3. Register routes in `frontend/src/routes.tsx`.
4. If the feature exposes shared UI to other plugins, add an `APINames` entry and register in `index.tsx`.

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | Plugin entry, lifecycle hooks |
| `backend/src/feature/accounting.module.ts` | NestJS module, DI setup, seeding |
| `backend/src/const/app-config.ts` | CONTROLLER_LIST, SERVICE_LIST, SCHEMA_LIST |
| `backend/src/feature/journal/journal.service.ts` | Core journal/ledger logic |
| `backend/src/feature/account/account.service.ts` | COA management |
| `backend/src/feature/report/report.service.ts` | Financial report generation |
| `frontend/src/export.ts` | Cross-plugin shared API surface |
| `frontend/src/index.tsx` | Frontend plugin bootstrap & PluginAPI registrations |
| `frontend/src/routes.tsx` | Route definitions |
| `frontend/src/store/accounting-book-store.ts` | Global accounting book Zustand store |
| `module.metadata.json` | Plugin name, version, dependencies |

---

## Rules & Conventions

1. **Never write directly to journal lines** — always use `JournalService` methods to ensure debits = credits.
2. **Polymorphic references are mandatory** on every `JournalEntry`: `pluginName + tableName + referenceId`.
3. **Developer config limits** (max COAs, max books) must be respected; read from `DeveloperConfigService` before creating new entities.
4. **Seeding is idempotent** — guarded by `DataSeedHistoryService.find()` before any seed operation.
5. **Exports from `export.ts`** are the public contract. Do not import internal service files across plugin boundaries.
6. **Multi-currency** is first-class — every journal line and COA is currency-aware.
7. **Accounting periods** are tracked via `AccountingPeriodEntity`; do not post to a closed period.

---

## Integration Guide for Other Plugins

This section describes how a **third-party / sibling plugin** integrates with the accounting engine.

---

### 1. Installation

**Backend** — add to your plugin's `package.json`:
```jsonc
"@quan-erp-plugins/accounting-backend": "*"
```

**Frontend** — add to your plugin's `package.json`:
```jsonc
"@quan-erp-plugins/accounting-frontend": "*"
```

---

### 2. Creating a Journal Entry (Backend)

Inject `JournalService` from the `"accounting"` container scope and call `createJournal` inside your existing `EntityManager` transaction.

```ts
import { JournalService } from "@quan-erp-plugins/accounting-backend";
import { Inject } from "@quan-erp/shared-backend-core";

@Inject(JournalService, "accounting")
journalService: JournalService;

// Inside a transaction:
const journal = await this.journalService.createJournal({
  entityManager,          // EntityManager — must be inside a transaction
  payload: journalPayload, // JournalRequestDTO (see below)
  createdBy,              // number — user ID
});

// Store the returned journal ID on your own entity:
myEntity.journalId = journal.id;
await entityManager.save(myEntity);
```

#### `JournalRequestDTO` shape

```ts
// from: backend/src/feature/journal/dto/journal.request.dto.ts

class JournalRequestDTO {
  postingDate: string;                          // ISO date, e.g. "2026-01-15"
  status: "DRAFT" | "POSTED";
  reportingMethod: "ACCRUAL_AND_CASH" | "ACCRUAL_ONLY" | "CASH_ONLY";

  // Polymorphic link — identifies YOUR document
  referenceKey?: string;    // your record's ID (string)
  referencePrefix?: string; // your table/entity prefix
  referencePlugin?: string; // your plugin name

  // Optional back-link to a source document
  sourcePlugin?: string;
  sourcePrefix?: string;
  sourceKey?: string;

  notes?: string;
  fileIds: number[];
  tags?: { id: number; name: string }[];
  journalLines: JournalLinesRequestDTO[];
}

class JournalLinesRequestDTO {
  accountId: string;          // UUID of the COA account
  debit?: number;
  credit?: number;
  currencyId: number;
  exchangeRate: number;       // 1 if same as base currency
  order: number;              // display order
  isReconciled: boolean;

  type?: JournalLineType;
  description?: string;
  partnerId?: number;
  partnerType?: "CUSTOMER" | "VENDOR" | "EMPLOYEE";

  taxRate?: {
    id: number;
    name: string;
    rate: number;
    taxAccountId: string;
    calculationType: "PERCENTAGE" | "FIXED";
    isCreditTrigger: boolean;
    isDebitTrigger: boolean;
  };

  // Optional source/reference per-line
  sourcePrefix?: string;
  sourceKey?: string;
  referencePrefix?: string;
  referenceKey?: string;

  reconciledAt?: string;
  reconciledBy?: number;
}
```

> **Tip:** `debit` and `credit` across all lines must balance to zero. The service will throw if they don't.

---

### 3. Getting Default System Accounts

System accounts are pre-seeded global COA entries. Retrieve them via `AccountingSettingService`:

```ts
import { AccountingSettingService } from "@quan-erp-plugins/accounting-backend";
import { Inject } from "@quan-erp/shared-backend-core";

@Inject(AccountingSettingService, "accounting")
settingService: AccountingSettingService;

// Returns: { key: SystemKey; description: string; account?: AccountEntity }[]
const systemAccounts = await this.settingService.getSystemAccounts({
  entityManager,
});

// To get a single account by key:
const receivablesAccount = await this.settingService.getSystemAccount({
  entityManager,
  systemKey: SystemKey.accounts_receivable,
  accountingBookId,     // obtain via getActiveAccountingBook (see §6)
});
```

#### Available `SystemKey` values

| Category | Keys |
|---|---|
| **Core** | `cash`, `bank`, `accounts_receivable`, `accounts_payable` |
| **Payment Flow** | `customer_payment_clearing`, `supplier_payment_clearing`, `undeposited_funds` |
| **Customer/Supplier** | `customer_credit`, `supplier_advance` |
| **Inventory** | `inventory_asset`, `inventory_purchases`, `inventory_adjustment`, `stock_loss` |
| **Tax** | `tax_receivable`, `tax_payable`, `input_tax`, `output_tax`, `withholding_tax_payable`, `withholding_tax_receivable` |
| **Revenue & Cost** | `sales_revenue`, `cogs`, `sales_return`, `purchase_return` |
| **Discounts** | `sales_discount`, `purchase_discount`, `rounding_adjustment`, `write_off` |
| **Shipping** | `shipping_income`, `shipping_expense` |
| **Other** | `misc_income_account`, `expense` |
| **Financial** | `bank_fees`, `interest_income`, `interest_expense` |
| **Commission/Service** | `commission_expense`, `commission_income`, `service_fee_expense`, `service_fee_income`, `rebate_expense`, `rebate_income` |
| **Pricing** | `markup_income`, `surcharge_income` |
| **Equity** | `retained_earnings`, `opening_balance_equity`, `owner_capital`, `owner_drawings` |
| **Dynamic** | `plugins_{pluginName}_{feature}_account`, `partner_invoice_account_{partnerId}` |

---

### 4. Getting Plugin-Specific System Accounts

Use `getPluginSystemAccounts` to retrieve accounts registered by your plugin:

```ts
@Inject(AccountingSettingService, "accounting")
settingService: AccountingSettingService;

// Returns: { key: string; accountId: string | null; accountInfo: AccountEntity | null }[]
const pluginAccounts = await this.settingService.getPluginSystemAccounts({
  entityManager,
  pluginName: "your-plugin-name",   // e.g. "payment-request"
  pluginFeature: ["revenue", "expense"], // feature strings (see key format below)
  accountingBookId,
});
```

**Key format** for plugin accounts:
```
plugins_{pluginName}_{feature}_account
```
Example: `plugins_payment-request_revenue_account`

You can also pass a full `SystemKey` string directly in `pluginFeature` — it will not be further interpolated if it already starts with `"plugins_"`.

---

### 5. Creating Plugin-Specific Accounts & Linking Them

**Step 1** — Create the COA accounts using `AccountService.createPluginAccounts`:

```ts
import { AccountService } from "@quan-erp-plugins/accounting-backend";
import { Inject } from "@quan-erp/shared-backend-core";

@Inject(AccountService, "accounting")
accountService: AccountService;

// pluginAccountId: a short unique code for your plugin (used in account code generation)
const savedAccounts = await this.accountService.createPluginAccounts({
  entityManager,
  pluginAccountId: "PR",      // short plugin code, baked into the account code
  pluginName: "payment-request",
  createdBy,                  // number — user ID
  payload: [
    {
      name: "Payment Revenue",
      code: "001",            // will be prefixed internally
      accountTypeId: 4,       // Income type
      isFeatured: false,
      isAutoReconciled: false,
    },
  ] satisfies AccountRequestDTO[],
});
```

**Step 2** — Register the account IDs as system account keys using `AccountingSettingService.upsertPluginSystemAccounts`:

```ts
@Inject(AccountingSettingService, "accounting")
settingService: AccountingSettingService;

await this.settingService.upsertPluginSystemAccounts({
  entityManager,
  updatedBy: createdBy,
  payload: savedAccounts.map((acc, i) => ({
    accountId: acc.id,
    pluginFeature: "revenue",       // matches the feature string used in §4
    pluginName: "payment-request",
  })),
});
```

---

### 6. Getting the Active Accounting Book ID

Most accounting service calls require `accountingBookId`. Obtain it from `AccountingBookService`:

```ts
import { AccountingBookService } from "@quan-erp-plugins/accounting-backend";
import { Inject } from "@quan-erp/shared-backend-core";

@Inject(AccountingBookService, "accounting")
accountingBookService: AccountingBookService;

const book = await this.accountingBookService.getActiveAccountingBook({
  entityManager,
});
const accountingBookId = book.id;  // number
```

> **Also available:** `checkAccountingPeriod({ entityManager, postedDate, accountingBookId })` — throws `BadRequestError` if the posting date falls in a closed period. Call this before creating any journal entry.

---

### 7. Account Dropdown (Frontend)

Use `AccountDropdown` to let users pick a COA account:

```tsx
import { AccountDropdown } from "@quan-erp-plugins/accounting-frontend";

<AccountDropdown
  value={field.value}           // string | undefined — selected account UUID
  setValue={field.onChange}     // (value: string, accountDetails: AccountResponse | null) => void
  accountType="all"             // filter: "all" | "active" | "asset" | "liability" | "equity" | "income" | "expense"
  disabled={false}              // optional
  isCreateDisabled={false}      // optional — hides the "Create new" button
  className=""                  // optional
/>
```

---

### 8. Display Journal in Frontend

Use `SubJournalSection` to render a read-only journal entry view linked to your record:

```tsx
import { SubJournalSection } from "@quan-erp-plugins/accounting-frontend";

// journalId comes from the journal created in §2, stored on your entity
<SubJournalSection journalId={yourEntity.journalId} />
```
