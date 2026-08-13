# 📦 Products Plugin — Agent Skill

## Overview

The **Products Plugin** is the core product catalogue engine for Quan ERP. It manages products, variants, categories, attributes, price lists, bundles, and product templates. It depends on the `accounting` and `barcode-scanner` plugins.

**Plugin name:** `products`
**Version:** `1.0.0`
**Dependencies:** `accounting ^1.0.0`, `barcode-scanner ^1.0.0`

---

## Directory Structure

```
plugins/products/
├── backend/src/
│   ├── const/          # App config, event config
│   ├── dto/            # Request/response DTOs
│   ├── feature/        # Feature modules (product, categories, attributes, brands,
│   │                   #   price-list, tax, product-bundle, product-template, migration)
│   ├── migrations/     # TypeORM migrations
│   ├── schema/         # TypeORM entity definitions (23 entities)
│   ├── types/          # Shared TypeScript types
│   ├── util/           # Utility helpers
│   ├── export.ts       # Public API surface (SCHEMA_LIST, DTOs, entities)
│   └── index.ts        # Plugin entry point (implements IPlugin)
├── frontend/src/
│   ├── extension/      # Extension point definitions (ProductDetailTab, EXTENSION_POINTS)
│   ├── features/       # UI feature pages (product-listing, categories, attributes,
│   │                   #   brands, bundles, price-list, tax, product-template, ...)
│   ├── shared-ui/      # Reusable dropdowns and components
│   ├── store/          # Zustand stores
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Metadata, URL helpers, price helpers
│   ├── types/          # Shared frontend types
│   ├── routes.tsx      # Plugin route definitions
│   ├── export.ts       # Exported API / shared components for other plugins
│   └── index.tsx       # Frontend plugin entry / PluginAPI registrations
├── module.metadata.json
└── sample_products.xlsx
```

---

## Core Domain Concepts

### Product
A `ProductEntity` is the base product record. It has a **type**:

| Type | Description |
|---|---|
| `stockable` | Physical product with inventory tracking |
| `consumable` | Physical product, no inventory tracking |
| `service` | Intangible service |
| `combo` | Bundle of other products |

### Product Variant
`ProductVariantEntity` is a specific SKU (e.g. Size: L / Color: Red). A product always has at least one variant. Variants have their own price rules, tax rates, and branch-level stock.

### Product Template
`ProductTemplateEntity` is a reusable product configuration (think a product catalog entry for a store). Templates can be instantiated into product variants for sales.

### Price List
`PriceListEntity` stores custom pricing rules per customer segment or channel.

### Attributes & Categories
Hierarchical `ProductCategoryEntity` and `ProductAttributeEntity` / `ProductAttributeValueEntity` for product classification and variant generation.

---

## Key Schema Entities

| Entity | Purpose |
|---|---|
| `ProductEntity` | Base product (type, name, COA links) |
| `ProductVariantEntity` | Individual SKU (price, stock, attributes) |
| `ProductCategoryEntity` | Hierarchical category |
| `ProductAttributeEntity` | Attribute definition (e.g. "Color") |
| `ProductAttributeValueEntity` | Value option (e.g. "Red") |
| `PriceListEntity` | Named price list |
| `ProductVariantPriceRuleEntity` | Price overrides per variant + price list |
| `ProductBundleEntity` | Combo/bundle header |
| `ProductBundleItemEntity` | Combo line items |
| `ProductTemplateEntity` | Reusable product template |
| `TaxEntity` | Tax rate definitions |

---

## Frontend — Exported API

Install:
```jsonc
// package.json of consumer plugin
"@quan-erp-plugins/products-frontend": "*"
```

All exports come from `frontend/src/export.ts`. Import from `@quan-erp-plugins/products-frontend`.

### Exported Types

```ts
export type ProductType = "stockable" | "consumable" | "service" | "combo";

export type ProductVariantDropdownType = {
  variant?: ProductVariantResponse;
  description: string;
  product?: ProductResponse;
};
```

Also re-exports: `ProductResponse`, `ProductVariantResponse`, `CategoryResponse`, `ProductsQueryParams`.

### `APINames` Enum

| Key | Value | Purpose |
|---|---|---|
| `Products` | `"products"` | Product list query |
| `PriceList` | `"price-lists"` | Price list query |
| `Categories` | `"product-categories"` | Category list query |
| `ProductBundles` | `"product-bundles"` | Bundle list query |
| `ProductTemplates` | `"product-template-list"` | Template list query |
| `ProductTemplateDetails` | `"product-template-details"` | Single template query |
| `CreateProductTemplate` | `"create-product-template"` | Template create mutation |
| `PriceListDropdown` | `"price-list-dropdown"` | Dropdown component |
| `ProductBarcodeScan` | `"barcode-scan"` | Barcode scan component |
| `ProductDropdown` | `"product-dropdown"` | Product picker component |
| `ProductVariantDropdown` | `"product-variant-dropdown"` | Variant picker component |
| `ProductTemplateDropdown` | `"product-template-dropdown"` | Template picker component |
| `ProductTemplatePublicView` | `"product-template-public-view"` | Public template view |

---

### Query Functions

```ts
import {
  getExportProductsQuery,
  getExportProductCategoriesQuery,
  getExportProductBundlesQuery,
  getExportPriceListQuery,
  getExportProductTemplatesQuery,
  getExportProductTemplateDetailsQuery,
  createExportProductTemplatesQuery,
} from "@quan-erp-plugins/products-frontend";

// Product list (paginated)
const query = getExportProductsQuery({ /* ProductsQueryParams */ });

// Single template details
const details = getExportProductTemplateDetailsQuery({ id: 123 });

// Create template mutation
const mutation = createExportProductTemplatesQuery();
```

---

### Dropdown Components

#### `ProductDropdown`
```tsx
import { ProductDropdown } from "@quan-erp-plugins/products-frontend";

<ProductDropdown
  value={selectedProduct}           // ProductResponse | undefined
  setValue={(product) => {}}        // (value: ProductResponse) => void
  className=""                      // optional
  isComboIncluded={false}           // optional — include combo/bundle products
/>
```

#### `ProductVariantDropdown`
```tsx
import { ProductVariantDropdown } from "@quan-erp-plugins/products-frontend";

<ProductVariantDropdown
  value={selectedVariant}           // ProductVariantDropdownType | undefined
  setValue={(v) => {}}              // (value: ProductVariantDropdownType) => void
  className=""                      // optional
  categoryId={1}                    // optional — filter by category
  isComboIncluded={false}           // optional
  isSales={true}                    // optional — sales context (shows sales price)
  type="stockable"                  // optional — filter: "stockable" | "consumable" | "service"
  priceListId={1}                   // optional — apply specific price list
  formMode="sales"                  // optional — FinancialDocumentMode
/>
```

#### `PriceListDropdown`
```tsx
import { PriceListDropdown } from "@quan-erp-plugins/products-frontend";

<PriceListDropdown
  value={priceListId}               // string | number | undefined
  setValue={(v) => {}}              // (v?: PriceListResponse) => void
  isDisabled={false}                // optional
  className=""                      // optional
  variant="default"                 // optional — "default" | "compact"
  isDefault={false}                 // optional — auto-select default price list
/>
```

#### `ProductTemplateDropdown`
```tsx
import { ProductTemplateDropdown } from "@quan-erp-plugins/products-frontend";

<ProductTemplateDropdown
  value={templateId}                // string | number | undefined
  setValue={(v) => {}}              // (v?: ProductTemplatePayload) => void
  isDisabled={false}                // optional
  className=""                      // optional
  variant="default"                 // optional — "default" | "compact"
/>
```

#### `ProductBarcodeScan`
```tsx
import { ProductBarcodeScan } from "@quan-erp-plugins/products-frontend";

<ProductBarcodeScan
  setValue={(product, variant) => {}}
  // (product: ProductResponse | null, productVariant?: ProductVariantResponse | null) => void
/>
```

#### `ProductTemplatePublicView`
```tsx
import { ProductTemplatePublicView } from "@quan-erp-plugins/products-frontend";

<ProductTemplatePublicView
  id={123}                           // number — template ID (required)
  renderActions={({ template, quantities, finalPrice }) => <button>Add to Cart</button>}
  extraSections={<div>...</div>}     // optional extra content
  headerIcon={<Icon />}             // optional icon in header
/>
```

---

## Extending the Product Form — Custom Tabs

The product detail page supports a **tab extension system**. Any sibling plugin can inject additional tabs into the product detail view.

### How It Works

The products plugin exposes an extension point `"product-detail-tabs"` via `PluginAPI`. Other plugins call `registerTab` on it during their `register()` lifecycle.

### Registration (in your plugin's `frontend/src/index.tsx`)

```tsx
import { PluginAPI } from "@quan-erp/shared-frontend-core";
import { YourCustomTab } from "./features/your-feature/your-tab";

// Inside the Plugin.register() function:
(PluginAPI.use("products", "product-detail-tabs") as any)?.registerTab({
  key: "your-unique-tab-key",        // must be globally unique
  label: "Your Tab Label",
  description: "Short description shown in optional tabs popover",
  order: 3,                          // display order (lower = earlier)
  icon: <YourIcon size={14} />,     // JSX icon element
  content: [YourCustomTab],          // array of ForwardRef components (see below)
  requiresVariant: false,            // optional — only show if product has variants
  requiresSale: false,               // optional — only show if product has sale enabled
  requiresPurchase: true,            // optional — only show if product has purchase enabled
  isRequired: false,                 // optional — always show (not hideable by user)
});
```

### `ProductDetailTab` Type

```ts
// from: frontend/src/extension/index.ts
export type ProductDetailTab = {
  key: string;                       // unique identifier
  label: string;                     // tab display name
  description: string;               // shown in optional-tabs selector
  content: React.ForwardRefExoticComponent<React.RefAttributes<any>>[];
  icon: JSX.Element;
  requiresVariant?: boolean;         // tab only shown when product has variants
  requiresSale?: boolean;            // tab only shown when product is for sale
  requiresPurchase?: boolean;        // tab only shown when product has purchase
  isRequired?: boolean;              // always-visible tab (cannot be hidden)
};
```

### Writing a Tab Component

Tabs **must** be `forwardRef` components that expose a `submit` handle via `useImperativeHandle`. The product form calls `ref.submit()` on all tabs when the user saves; **do not add your own submit button**.

```tsx
import { forwardRef, useImperativeHandle } from "react";
import type { ProductResponse } from "@quan-erp-plugins/products-frontend";

export const YourCustomTab = forwardRef<
  any,
  {
    productId?: number;
    product?: ProductResponse;
  }
>(({ productId, product }, ref) => {

  // Expose the submit handle — called automatically by the product form on save
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const isValid = await form.trigger();

      // Scroll to first invalid field if validation fails
      if (!isValid) {
        const firstError = document.querySelector('[aria-invalid="true"]');
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      try {
        const values = form.getValues();

        if (productId) {
          await updateYourData.mutateAsync({
            id: productId,
            payload: values as any,
          });
          refetch();           // re-fetch your tab's data
        }
      } catch {
        return false;          // returning false signals save failure
      }

      return isValid;          // true = save succeeded, false = validation failed
    },

    getValues: () => form.getValues(),   // optionally expose form values
  }));

  return (
    <div>
      {/* Your tab content — no submit button needed */}
    </div>
  );
});

YourCustomTab.displayName = "YourCustomTab";
```

### `TabHandle` Type

```ts
// from: frontend/src/extension/index.ts
export type TabHandle = {
  submit: () => Promise<boolean>;
};
```

### Rules for Tab Components

1. **Always `forwardRef`** — the product form holds a ref to each tab and calls `ref.submit()`.
2. **Return `true` from `submit()`** if save succeeds, `false` if it fails.
3. **No submit button** — the top-level product save button triggers all tabs.
4. **Scroll to errors** — on validation failure, scroll the first invalid field into view.
5. **`displayName` is required** — set `YourTab.displayName` for React DevTools and internal tab identification.
6. **Props shape** — always accept `{ productId?: number; product?: ProductResponse }` at minimum.

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `backend/src/index.ts` | Plugin entry, lifecycle hooks |
| `backend/src/feature/products.module.ts` | NestJS module, DI setup |
| `backend/src/feature/product/` | Product CRUD service & controller |
| `backend/src/feature/price-list/` | Price list management |
| `backend/src/feature/product-template/` | Template management |
| `backend/src/schema/product.entity.ts` | Core product entity |
| `backend/src/schema/product-variant.entity.ts` | Variant entity |
| `frontend/src/export.ts` | Cross-plugin shared API surface |
| `frontend/src/index.tsx` | Frontend plugin bootstrap & PluginAPI registrations |
| `frontend/src/extension/index.ts` | Extension point types & `productDetailTabs` registry |
| `frontend/src/routes.tsx` | Route definitions |
| `module.metadata.json` | Plugin name, version, dependencies |

---

## Rules & Conventions

1. **Variants are always present** — every product has at least one `ProductVariantEntity`. Never access pricing directly on the product; always go via a variant.
2. **Price list is optional** — if no price list is provided, fall back to the variant's base price.
3. **Tab `key` must be globally unique** — collisions cause the tab's `content` arrays to be merged, which may produce unexpected UI.
4. **Tab `submit()` must be idempotent-safe** — it is called on every top-level save, even if the user didn't interact with the tab.
5. **Do not mutate `productDetailTabs` directly** — always use `registerTab` via the extension point.
6. **Plugin dependencies** — this plugin requires `accounting` and `barcode-scanner`. Ensure both are installed before this plugin loads.
