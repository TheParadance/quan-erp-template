---
name: quan-erp-base
description: Base plugin (`@quan-erp/base-frontend` / builtin) — expose contract via export.tsx, and domain API catalogs (currency, branch, partner, UOM, settings, workflow, etc.).
---

# Base Plugin API Guide (Frontend)

> [!NOTE]
> Specialized skill for the **Base Plugin**. General plugin patterns: [Quan ERP Plugins index](../SKILL.md). Architecture: [Quan ERP skill](../../quan-erp/SKILL.md).

This skill documents APIs, hooks, components, and stores from `@quan-erp/base-frontend` (plugin name `builtin`).

> [!IMPORTANT]
> **Strict Import Rule**: Import only from `@quan-erp/base-frontend`. Never import base internal paths.
>
> **Do not guess APIs.** Open the domain reference below (and `base/frontend/src/export.tsx` when exposing). Use `view_file` on the relevant reference **before** coding.

```typescript
// CORRECT
import { useBranchQuery, CurrencyInput, useNavMenuStore } from "@quan-erp/base-frontend";

// INCORRECT
import { CurrencyInput } from "../../../base/frontend/src/page/currency/component/currency.input";
```

## Mandatory reads

| Task | Read first |
|---|---|
| Any base public API usage | [Shared conventions](./references/conventions.md) + the domain file below |
| Add / rename / expose a symbol | [Expose contract (`export.tsx`)](./references/expose.md) |
| Stale types / PluginAPI miss | [Expose](./references/expose.md) + [Caveats](./references/caveats.md) |

## Domain references

### Platform

| Domain | File |
|---|---|
| Expose / `export.tsx` / `PluginAPI` | [expose.md](./references/expose.md) |
| Shared conventions (pagination, stores) | [conventions.md](./references/conventions.md) |
| Core / app (`navigate`, `useAppRegistry`, env) | [core.md](./references/core.md) |
| Notifications (in-app + FCM registries) | [notifications.md](./references/notifications.md) |
| Nav / shell stores (nav menu, bottom bar, shortcuts) | [nav-stores.md](./references/nav-stores.md) |
| Settings | [settings.md](./references/settings.md) |
| Permission / `Protected` | [permission.md](./references/permission.md) |
| Locale | [locale.md](./references/locale.md) |
| Utils (`resolveIndexPagination`, `TakeAndPartialRest`) | [utils.md](./references/utils.md) |
| Known gaps / caveats | [caveats.md](./references/caveats.md) |

### Master data & UI

| Domain | File |
|---|---|
| Branch | [branch.md](./references/branch.md) |
| Partner | [partner.md](./references/partner.md) |
| Location | [location.md](./references/location.md) |
| Partner shipping address | [shipping.md](./references/shipping.md) |
| Currency (`CurrencyDropdown`, `CurrencyInput`) | [currency.md](./references/currency.md) |
| Exchange rates | [exchange.md](./references/exchange.md) |
| Media / files | [media.md](./references/media.md) |
| Units of measurement (UOM) | [uom.md](./references/uom.md) |
| Unit of conversion (UOC) | [uoc.md](./references/uoc.md) |
| User | [user.md](./references/user.md) |
| Tags | [tags.md](./references/tags.md) |

### System features

| Domain | File |
|---|---|
| Dashboard | [dashboard.md](./references/dashboard.md) |
| Change log | [change-log.md](./references/change-log.md) |
| Spotlight search | [spotlight.md](./references/spotlight.md) |
| AI assistant | [ai-assistant.md](./references/ai-assistant.md) |
| Role | [role.md](./references/role.md) |
| Workflow | [workflow.md](./references/workflow.md) |

## Agent checklist

1. Match the task to a domain file above → `view_file` that reference.
2. New/changed public exports → follow [expose.md](./references/expose.md) checklist (`APINames` ↔ `*.export.ts` ↔ `setup-prod.ts` ↔ `export *` barrels).
3. Rebuild/publish base-frontend after expose changes so plugins see new types.
4. Prefer documenting new APIs in the matching `references/<domain>.md`, not only in this index.
