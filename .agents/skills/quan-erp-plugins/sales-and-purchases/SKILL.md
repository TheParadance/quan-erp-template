# 🛒 Sales & Purchases Plugin — Agent Skill

## Overview

The **Sales & Purchases Plugin** is the financial document engine for Quan ERP. It handles invoices, bills, sales orders, purchase orders, credit notes, and vendor credits. It integrates tightly with the `accounting` plugin for journal entries.

**Plugin name:** `sales-and-purchases`
**Version:** `1.0.0`
**Dependencies:** `accounting ^1.0.0`, `products ^1.0.0`, `payment-method ^1.0.0`

---

## Directory Structure

```
plugins/sales-and-purchases/
├── backend/src/
│   ├── const/          # App config, event config
│   ├── feature/        # Feature modules:
│   │   ├── financial-document/   # Core engine — createOrUpdateDocument
│   │   │   ├── dto/              # Request/response DTOs
│   │   │   ├── strategy/         # DocumentStrategy per doc kind
│   │   │   ├── helper/           # Totals, sign helpers
│   │   │   └── converter/        # Form ↔ entity converters
│   │   ├── invoice/
│   │   ├── bill/
│   │   ├── sales-order/
│   │   ├── purchase-order/
│   │   ├── credit-notes/
│   │   ├── payment/
│   │   ├── partners/
│   │   ├── payment-term/
│   │   ├── installment/
│   │   └── report/
│   ├── schema/         # TypeORM entities
│   ├── types/          # Shared TypeScript types
│   ├── util/           # Helpers (snowflake ID, accounting helpers)
│   └── index.ts        # Plugin entry point
├── frontend/src/
│   ├── extension/sales-and-purchases/   # Extension point types & registries
│   ├── features/       # UI feature pages
│   ├── shared-ui/      # Financial document form, details, dropdowns
│   ├── export.ts       # Exported components/types for other plugins
│   ├── export-name.ts  # ComponentName enum
│   ├── export-props.ts # Props types for exported components
│   ├── export-component-arr.ts  # Component registry array
│   └── index.tsx       # Plugin bootstrap & PluginAPI registrations
└── module.metadata.json
```

---

## Core Domain Concepts

### Document Kinds (Backend)

`DocumentKind` enum drives the Strategy pattern:

| Kind | Description |
|---|---|
| `INVOICE` | Customer invoice (money in) |
| `BILL` | Supplier bill (money out) |
| `CREDIT_NOTE` | Customer credit/refund |
| `VENDOR_CREDIT` | Vendor credit/refund |
| `SALES_ORDER` | Sales order (pre-billing) |
| `PURCHASE_ORDER` | Purchase order (pre-billing) |

### `FinancialDocumentMode` (Frontend)

```ts
export enum FinancialDocumentMode {
  INVOICE         = "Invoice",
  BILL            = "Bill",
  CREDIT_NOTE_CUSTOMER = "Credit Note",
  CREDIT_NOTE_VENDOR   = "Vendor Credit",
  SALES_ORDER     = "Sales Order",
  PURCHASE_ORDER  = "Purchase Order",
}
```

### Document Status

```ts
export enum DocumentStatus {
  DRAFT          = "DRAFT",
  ISSUED         = "ISSUED",
  PAID           = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  CANCELLED      = "CANCELLED",
}
```

---

## Backend — `createOrUpdateDocument`

This is the **core method** for programmatically creating any financial document from another plugin. It handles:
1. Resolving the active accounting book
2. Checking the accounting period
3. Saving the document header + lines + details
4. Auto-generating journal entries (if status ≠ `DRAFT`)

### Injection

```ts
import { FinancialDocumentService } from "@quan-erp-plugins/sales-and-purchases-backend";
import { Inject } from "@quan-erp/shared-backend-core";

@Inject(FinancialDocumentService, "sales-and-purchases")
financialDocumentService: FinancialDocumentService;
```

### Call Signature

```ts
await this.financialDocumentService.createOrUpdateDocument({
  entityManager,           // EntityManager — pass your transaction manager
  payload,                 // FinancialDocumentPayloadDto (see below)
  createdBy,               // number — user ID (optional for system-generated)
  documentKind,            // DocumentKind enum
  id,                      // string — omit for create, provide for update
  currentAccountingBook,   // AccountingBookEntity — optional, avoids extra query
});
// returns: documentId (string)
```

> **Retry logic:** `createOrUpdateDocument` internally retries up to 5 times on PostgreSQL unique-constraint violations (code `23505`) for document number generation conflicts.

### `FinancialDocumentPayloadDto` Shape

```ts
class FinancialDocumentPayloadDto {
  financialDocumentLines: FinancialDocumentLineDto[];
  details?: FinancialDetailDto[];         // document-level adjustments (discounts, fees…)
  subject: string;
  termsAndConditions: string;
  documentType: DocumentKind;             // same as documentKind param
  partnerId: number;                      // customer or vendor ID
  documentNumber: string;
  referencePrefix?: string;              // link to a source document prefix
  referencePlugin?: string;              // source plugin name
  referenceNumber?: string;              // source document number
  showCurrencyId?: number;
  showCurrencyExchangeRate: number;
  documentDate: string;                  // ISO date string
  dueDate: string;                       // ISO date string
  notes?: string;
  status: DocumentStatus;                // DRAFT = no journal; ISSUED = creates journal
  fileIds?: number[];
  paymentTerm?: PaymentTermDto;
  installmentTerm?: InstallmentTermDto;
  isAutoGeneratedReferenceNumber?: boolean; // auto-generate from sequence
  tags: TagDto[];
}
```

### `FinancialDocumentLineDto` Shape

```ts
class FinancialDocumentLineDto {
  rowType: FinancialRowType;             // "LINE" | "SECTION" | "NOTE"
  lineType?: LineType;                   // "PRODUCT" | "SERVICE" | "PLUGIN" | "MANUAL"
  productVariant?: { id: number };
  accountId?: string;                    // COA account UUID (falls back to system default)
  description?: string;
  order: number;
  quantity?: number;
  unitConversionId?: number;
  unitConversionCategoryId?: number;
  unitPrice?: number;
  currencyId?: number;
  exchangeRate?: number;                 // 1 if same as base currency
  details?: FinancialDetailDto[];        // line-level adjustments (tax, discount…)
  paymentTerm?: PaymentTermDto;
  isRewardLine?: boolean;
  isComboChild?: boolean;
  referenceId?: string;                  // link line back to source document line ID
  metadata?: any;
}
```

### `FinancialDetailDto` Shape (line-level & document-level)

```ts
class FinancialDetailDto {
  name: string;
  type: DetailType;       // "TAX" | "DISCOUNT" | "FEE" | "COMMISSION" | "REBATE"
                          // | "WITHHOLDING_TAX" | "ROUNDING" | "SHIPPING" | "MARKUP"
                          // | "SURCHARGE" | "PREPAYMENT"
  value: number;
  isPercent: boolean;
  accountId?: string;     // COA account UUID; system default used if omitted
  applyStage: ApplyStage; // "BEFORE_TAX" | "AFTER_TAX" | "BEFORE_GLOBAL_TAX" | ...
  base: DetailBase;       // "LINE_SUBTOTAL" | "ACCUMULATED"
  priority: number;
  exchangeRate?: number;
  currencyId?: number;
}
```

### Row Types (`FinancialRowType`)

| Value | Meaning |
|---|---|
| `LINE` | A real product/service/manual line (generates journal lines) |
| `SECTION` | A visual section header row (no accounting effect) |
| `NOTE` | A text note row (no accounting effect) |

### Example — Create an Invoice from Another Plugin

```ts
await this.financialDocumentService.createOrUpdateDocument({
  entityManager,
  documentKind: DocumentKind.INVOICE,
  createdBy: userId,
  payload: {
    documentType: DocumentKind.INVOICE,
    partnerId: customerId,
    documentNumber: "AUTO",
    isAutoGeneratedReferenceNumber: true,
    documentDate: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    status: DocumentStatus.ISSUED,  // ← generates a journal entry immediately
    subject: "Service Invoice",
    termsAndConditions: "",
    showCurrencyExchangeRate: 1,
    tags: [],
    fileIds: [],

    // Polymorphic back-link to your source document
    referencePlugin: "your-plugin-name",
    referencePrefix: "YOUR-",
    referenceNumber: "12345",

    financialDocumentLines: [
      {
        rowType: FinancialRowType.LINE,
        lineType: LineType.SERVICE,
        description: "Service Fee",
        quantity: 1,
        unitPrice: 500,
        currencyId: 1,
        exchangeRate: 1,
        order: 1,
        details: [
          {
            name: "VAT",
            type: DetailType.TAX,
            value: 10,
            isPercent: true,
            applyStage: ApplyStage.BEFORE_TAX,
            base: DetailBase.LINE_SUBTOTAL,
            priority: 1,
          },
        ],
      },
    ],
    details: [], // document-level adjustments
  },
});
```

### How Journals Are Created

When `status !== DRAFT`, `createOrUpdateDocument` internally calls `postDocument`, which:
1. Calls `DocumentStrategy.resolveMainAccount()` → AR (invoice) / AP (bill)
2. Calls `DocumentStrategy.resolveRevenueOrExpenseAccount()` → revenue / expense COA
3. Builds a balanced `JournalRequestDTO` via `buildJournal()`
4. Calls `JournalService.createJournal()` and links the journal ID to the document

---

## Optional Plugin Integration Pattern

If `sales-and-purchases` is **not a required dependency** of your plugin, guard all access with `isInstalled`:

```tsx
// In your plugin's frontend/src/index.tsx:

const Plugin: PluginModule = {
  register(AppRegistry) {
    // ... your own registrations
  },

  onAllPluginInstalled(AppRegistry) {
    if (AppRegistry.plugin.isInstalled("sales-and-purchases")) {
      // Safe to use sales-and-purchases APIs here
      (PluginAPI.use<FinancialDocumentExtensions>(
        "sales-and-purchases",
        "sales-and-purchases-financial-document",
      ) as any)?.registerSidebarSection({ ... });
    }
  },
};
```

---

## Frontend — Extension Points

The financial document detail view supports 3 extension mechanisms, all accessed via the same `PluginAPI` key.

### Extension Point Key

```ts
// from: extension/sales-and-purchases/index.ts
EXTENSION_POINTS.SALES_AND_PURCHASES_FINANCIAL_DOCUMENT
// = "sales-and-purchases-financial-document"
```

### `FinancialDocumentExtensions` Type

```ts
export type FinancialDocumentExtensions = {
  registerMenuItem:      (item: FinancialDocumentMenuItem)      => void;
  getMenuItems:          ()                                      => FinancialDocumentMenuItem[];

  registerSidebarSection:(section: FinancialDocumentSidebarSection) => void;
  getSidebarSections:    ()                                      => FinancialDocumentSidebarSection[];

  registerFinancialLineItem:(lineItem: FinancialDocumentLineItem) => void;
  getFinancialLineItems: ()                                      => FinancialDocumentLineItem[];
};
```

---

### 1. `registerSidebarSection` — Add a Sidebar Block

Injects a custom React component into the document detail sidebar.

```tsx
import {
  FinancialDocumentExtensions,
  FinancialDocumentMode,
} from "@quan-erp-plugins/sales-and-purchases-frontend";

PluginAPI.use<FinancialDocumentExtensions>(
  "sales-and-purchases",
  "sales-and-purchases-financial-document",
).registerSidebarSection({
  key: "UNIQUE_SECTION_KEY",          // globally unique
  mode: FinancialDocumentMode.SALES_ORDER,
  order: 1,                           // optional display order
  components(props) {
    // props: FinancialDocumentMenuItemProps
    //   { mode: FinancialDocumentMode, response: FinancialDocumentDetailsResponse }
    return <YourSidebarComponent response={props.response} />;
  },
});
```

**`FinancialDocumentSidebarSection` type:**
```ts
type FinancialDocumentSidebarSection = {
  key: string;
  mode: FinancialDocumentMode;
  order?: number;
  components: (props: FinancialDocumentMenuItemProps) => React.ReactNode;
};
```

---

### 2. `registerFinancialLineItem` — Add a Column to the Line Items Table

Injects a custom column into the financial document's line items table. Uses a `prepare` / `render` pattern:
- **`prepare`** runs **once** per document load — fetch any external data you need.
- **`render`** runs **per row** — use the pre-fetched context to render each cell.

```tsx
PluginAPI.use<FinancialDocumentExtensions>(
  "sales-and-purchases",
  "sales-and-purchases-financial-document",
).registerFinancialLineItem({
  key: "myColumn",                   // globally unique
  mode: FinancialDocumentMode.SALES_ORDER,
  header: "My Column",
  headerClass: "text-center",
  cellClass: "text-center font-mono font-medium",

  // Runs once per document load — return any data structure as ctx
  prepare: async (response: FinancialDocumentDetailsResponse) => {
    const docRef = `${response?.documentPrefix ?? ""}${response?.documentNumber ?? ""}`.trim();
    if (!docRef) return [];
    try {
      return await fetchMyExternalData(docRef);
    } catch {
      return [];
    }
  },

  // Runs per row — use ctx returned from prepare
  render: (row: FinancialDocumentLineFormValues, ctx, response) => {
    const found = Array.isArray(ctx)
      ? ctx.find((item) => String(item.rowid) === String(row.id))
      : undefined;
    const num = parseFloat(found?.myValue ?? "0");
    return num.toLocaleString();
  },
});
```

**`FinancialDocumentLineItem` type:**
```ts
type FinancialDocumentLineItem<TCtx = any> = {
  key: string;
  mode: FinancialDocumentMode;
  header: string;
  headerClass: string;
  cellClass: string;
  prepare?: (response: FinancialDocumentDetailsResponse) => TCtx;   // async ok
  render: (
    row: FinancialDocumentLineFormValues,
    ctx: TCtx,
    response?: FinancialDocumentDetailsResponse,
  ) => React.ReactNode;
};
```

---

### 3. `registerMenuItem` — Add a Menu Action Button

Injects a custom action into the document detail's action menu.

```tsx
PluginAPI.use<FinancialDocumentExtensions>(
  "sales-and-purchases",
  "sales-and-purchases-financial-document",
).registerMenuItem({
  key: "UNIQUE_MENU_KEY",
  mode: FinancialDocumentMode.INVOICE,
  order: 1,
  components(props) {
    return <button onClick={() => doAction(props.response)}>My Action</button>;
  },
});
```

**`FinancialDocumentMenuItem` type:**
```ts
type FinancialDocumentMenuItem = {
  key: string;
  mode: FinancialDocumentMode;
  order?: number;
  components: (props: FinancialDocumentMenuItemProps) => React.ReactNode;
};

type FinancialDocumentMenuItemProps = {
  mode: FinancialDocumentMode;
  response: FinancialDocumentDetailsResponse;
};
```

---

## Frontend — Exported Embedded Components

These components render a complete sales-and-purchases view **inside another plugin's UI**.

Install:
```jsonc
"@quan-erp-plugins/sales-and-purchases-frontend": "*"
```

---

### The `element` Prop — Custom UI with Fetched Data

All exported components accept an optional **`element`** prop. When provided, the component still handles all data fetching internally, but instead of rendering the default layout it calls your `element` function and renders whatever you return.

This is the primary pattern for **embedding financial document data inside a completely custom UI** (e.g. a chat message bubble, a dashboard card, a sidebar summary).

```
element: (data: ResponseType, metadata?: Record<string, ReactNode>) => ReactNode
```

- **`data`** — the fully-fetched response object (e.g. `PaymentResponse`, `FinancialDocumentDetailsResponse`)
- **`metadata`** — the `metadata` prop object you passed in, forwarded as-is

#### Real-World Example — `PaymentDetails` inside a Chat Message (social-media-sale plugin)

```tsx
import { PaymentDetails } from "@quan-erp-plugins/sales-and-purchases-frontend";

<PaymentDetails
  id={paymentId}           // The component fetches the payment data for you
  element={(data) => {     // You render a completely custom card using that data
    if (!data) return null;

    const total = new bigDecimal(data.totalAmount || 0);
    const allocationsCount = data.allocations?.length || 0;

    return (
      <div className="rounded-2xl border shadow-sm overflow-hidden">

        {/* Header — uses data.prefix, data.paymentNumber */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b">
          <span className="text-xs font-black uppercase">
            {data.prefix}-{data.paymentNumber}
          </span>
          <button onClick={handleOpenDetails}>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Body — uses data.paymentType, data.partner, data.status, data.totalAmount, data.currency */}
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-extrabold text-muted-foreground">
                {data.paymentType === "RECEIPT" ? "From Customer" : "To Supplier"}
              </span>
              <span className="text-xs font-bold truncate">
                {data.partner?.firstName} {data.partner?.lastName}
              </span>
            </div>
            <Badge>{data.status || "Completed"}</Badge>
          </div>

          {/* Amount */}
          <div className="rounded-xl border p-2">
            <span className="text-lg font-black tabular-nums">
              {formatCurrencyFlat(total, data.currency)}
            </span>
          </div>

          {/* Allocation count — uses data.allocations */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Layers size={12} className="opacity-60" />
            <span className="text-[10px] italic opacity-80">
              Applied to {allocationsCount} document{allocationsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Footer action */}
        <div className="border-t p-1.5">
          <button onClick={handleOpenDetails} className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold py-2">
            <FileText size={12} />
            View Receipt
          </button>
        </div>
      </div>
    );
  }}
/>
```

> **Pattern summary:** The component fetches and owns the data lifecycle. You own the presentation. Use `element` whenever you need a non-standard layout — cards, bubbles, summaries, previews — while still getting the full response object without writing your own query.

---

### `SalesOrderDetails`

```tsx
import { SalesOrderDetails } from "@quan-erp-plugins/sales-and-purchases-frontend";

<SalesOrderDetails
  id="document-uuid"                  // string — document ID (required)
  onSubmitCompleteFn={() => refetch()} // optional callback after submit
  element={(data, metadata) => <CustomHeader data={data} />}  // optional slot
  metadata={{ myKey: "myValue" }}     // optional extra data passed to element
/>
```

### `SalesOrderList`

```tsx
import { SalesOrderList } from "@quan-erp-plugins/sales-and-purchases-frontend";

<SalesOrderList
  partnerId={123}                     // optional — filter by partner
  element={(data, metadata) => <CustomRow />}  // optional slot
  metadata={{}}
/>
```

### `PaymentDetails`

```tsx
import { PaymentDetails } from "@quan-erp-plugins/sales-and-purchases-frontend";

<PaymentDetails
  id="payment-uuid"
  element={(data, metadata) => <CustomView data={data} />}
  metadata={{}}
/>
```

### `PaymentReceivedList`

```tsx
import { PaymentReceivedList } from "@quan-erp-plugins/sales-and-purchases-frontend";

<PaymentReceivedList
  partnerId={123}
  element={(data, metadata) => <CustomRow />}
  metadata={{}}
/>
```

### `PartnerPaymentCard`

```tsx
import { PartnerPaymentCard } from "@quan-erp-plugins/sales-and-purchases-frontend";

<PartnerPaymentCard
  partnerId={123}                          // required
  isInstallmentCalculated={false}          // optional
  isPaymentTermCalculated={false}          // optional
  excludedId="document-uuid"               // optional — exclude a specific document
/>
```

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `backend/src/feature/financial-document/financial-document.service.ts` | Core engine — `createOrUpdateDocument`, `postDocument`, `buildJournal` |
| `backend/src/feature/financial-document/dto/request.dto.ts` | `FinancialDocumentPayloadDto`, `FinancialDocumentLineDto`, all enums |
| `backend/src/feature/financial-document/strategy/document-strategy.ts` | `DocumentStrategy` base + `DocumentKind` enum |
| `frontend/src/extension/sales-and-purchases/index.ts` | Extension point types, `FinancialDocumentMode`, registries |
| `frontend/src/export.ts` | `FinancialDocumentExtensions`, exported component functions |
| `frontend/src/export-props.ts` | Props types for all exported components |
| `frontend/src/export-name.ts` | `ComponentName` enum |
| `frontend/src/index.tsx` | Plugin bootstrap, extension point registration |

---

## Rules & Conventions

1. **Always use `createOrUpdateDocument`** from a sibling plugin — never write directly to financial document entities.
2. **`status: DRAFT`** = no journal entry created. Use `ISSUED` or `OPEN` to trigger the accounting engine.
3. **Polymorphic back-link** — always set `referencePlugin`, `referencePrefix`, and `referenceNumber` so the document can be traced back to its source.
4. **Extension keys must be globally unique** — duplicate keys produce a console warning and the second registration is silently ignored.
5. **`prepare()` is async-safe** — it runs once before the table renders. Keep it fast; avoid blocking UI.
6. **Optional dependency guard** — if `sales-and-purchases` is not a hard dependency, always check `AppRegistry.plugin.isInstalled("sales-and-purchases")` inside `onAllPluginInstalled()` before using any of its APIs.
7. **`FinancialDocumentMode` ≠ `DocumentKind`** — frontend uses `FinancialDocumentMode` strings; backend uses the `DocumentKind` enum. They map 1-to-1 but are separate types.
