---
name: quan-erp-plugins
description: >-
  Master index for Quan ERP plugin skills. Base (`@quan-erp/base-frontend`) is split into
  domain references under base/references/. Also Accounting, Products, Sales & Purchases,
  Payment Method, Barcode Scanner, Cron Scheduler.
---

# Quan ERP Plugin Skills

Plugin-specific APIs, exports, and patterns. Pair with the general [Quan ERP skill](../quan-erp/SKILL.md) (architecture, React Query, UI, folder structure).

## CRITICAL INSTRUCTIONS FOR AI AGENTS

> [!IMPORTANT]
> **DO NOT GUESS OR HALLUCINATE PLUGIN LOGIC.**
>
> 1. **Identify the plugin** (folder under `plugins/`, or import `@quan-erp/base-frontend` / `@quan-erp-plugins/<name>-frontend|backend`).
> 2. **`view_file` that plugin’s `SKILL.md` before coding.** For Base, also open the **matching domain file** under [base/references/](./base/references/) — do not load every base reference.
> 3. **Base expose changes** (`export.tsx`, `*.export.ts`, `setup-prod.ts`): read [base/SKILL.md](./base/SKILL.md) + [base/references/expose.md](./base/references/expose.md).
> 4. **Cross-plugin work:** read every skill that owns an API you call or extend.
> 5. **Imports:** only package entry points (`@quan-erp/base-frontend`, `@quan-erp-plugins/...`). Never another plugin’s internal `src/` paths.

## Available Plugin Skills

### Base (platform) — split by domain

| | |
|---|---|
| **Index** | [base/SKILL.md](./base/SKILL.md) |
| **Package** | `@quan-erp/base-frontend` · plugin name `builtin` |
| **Layout** | Slim index + **one file per domain** in [base/references/](./base/references/) |
| **Read when** | Using/exposing branches, partners, users, currency (`CurrencyInput` / `CurrencyDropdown`), UOM/UOC, tags, media, settings, nav stores, permissions, AI, workflow, notifications, change logs, spotlight, etc. Or changing public exports. |

**How to use Base**

1. Open [base/SKILL.md](./base/SKILL.md) (import rules + domain map).
2. Open **only** the domain file you need (plus [conventions.md](./base/references/conventions.md) for list queries / stores).
3. For new public symbols → [expose.md](./base/references/expose.md) checklist against `base/frontend/src/export.tsx`.

**Base domain references (quick map)**

| Need | File |
|---|---|
| Expose / `APINames` / `PluginAPI` | [expose.md](./base/references/expose.md) |
| Pagination, store double-call | [conventions.md](./base/references/conventions.md) |
| `navigate`, `useAppRegistry`, env | [core.md](./base/references/core.md) |
| Notifications | [notifications.md](./base/references/notifications.md) |
| Nav / bottom bar / shortcuts | [nav-stores.md](./base/references/nav-stores.md) |
| Settings | [settings.md](./base/references/settings.md) |
| `Protected` / permissions | [permission.md](./base/references/permission.md) |
| Branch | [branch.md](./base/references/branch.md) |
| Partner | [partner.md](./base/references/partner.md) |
| Location | [location.md](./base/references/location.md) |
| Shipping address | [shipping.md](./base/references/shipping.md) |
| Currency UI + hooks | [currency.md](./base/references/currency.md) |
| Exchange rates | [exchange.md](./base/references/exchange.md) |
| Media | [media.md](./base/references/media.md) |
| UOM | [uom.md](./base/references/uom.md) |
| UOC | [uoc.md](./base/references/uoc.md) |
| User | [user.md](./base/references/user.md) |
| Tags | [tags.md](./base/references/tags.md) |
| Dashboard | [dashboard.md](./base/references/dashboard.md) |
| Change log | [change-log.md](./base/references/change-log.md) |
| Spotlight | [spotlight.md](./base/references/spotlight.md) |
| AI assistant | [ai-assistant.md](./base/references/ai-assistant.md) |
| Role | [role.md](./base/references/role.md) |
| Workflow | [workflow.md](./base/references/workflow.md) |
| Locale | [locale.md](./base/references/locale.md) |
| Utils | [utils.md](./base/references/utils.md) |
| Known gaps | [caveats.md](./base/references/caveats.md) |

### Domain plugins

| Skill | Plugin name | Packages (typical) | Read when… |
|---|---|---|---|
| [Accounting](./accounting/SKILL.md) | `accounting` | `@quan-erp-plugins/accounting-*` | Chart of accounts, journals, books, banking, accounting reports/settings |
| [Products](./products/SKILL.md) | `products` | `@quan-erp-plugins/products-*` | Catalogue, variants, categories, price lists, tax, bundles; depends on `accounting` + `barcode-scanner` |
| [Sales & Purchases](./sales-and-purchases/SKILL.md) | `sales-and-purchases` | `@quan-erp-plugins/sales-and-purchases-*` | Invoices, bills, orders, credit notes, payments; depends on `accounting` + `products` + `payment-method` |
| [Payment Method](./payment-method/SKILL.md) | `payment-method` | `@quan-erp-plugins/payment-method-*` | Payment method CRUD, activate/default, metadata |
| [Barcode Scanner](./barcode-scanner/SKILL.md) | `barcode-scanner` | `@quan-erp-plugins/barcode-scanner-*` | Camera barcode/QR via `useBarcodeScannerStore` / `scan()` |
| [Cron Scheduler](./cron-schedular/SKILL.md) | `cron-schedular` | `@quan-erp-plugins/cron-schedular-*` | Register/stop cron jobs, listeners (`CronJobService`) |

## Dependency hints (read order)

```text
base (builtin)
  ├─ barcode-scanner
  ├─ payment-method
  ├─ cron-schedular
  └─ accounting
       └─ products  (also → barcode-scanner)
            └─ sales-and-purchases  (also → accounting, payment-method)
```

## Agent checklist

1. Match task → plugin `SKILL.md` → `view_file`.
2. **Base:** index → **one** domain reference (not all). Expose work → [expose.md](./base/references/expose.md) + `export.tsx`.
3. Domain plugins → that skill’s export / extension-point / package sections.
4. Do not invent PluginAPI names, DTOs, or service methods — verify in the skill and source.
5. After base expose changes → rebuild/publish `@quan-erp/base-frontend` before expecting plugins to see new types.
