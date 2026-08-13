> Parent skill: [Base Plugin](../SKILL.md)

## 0. How `@quan-erp/base-frontend` expose works (`export.tsx`)

> [!IMPORTANT]
> **Source of truth for the public surface:** `base/frontend/src/export.tsx`.
> When adding, renaming, or documenting a base-frontend export, agents MUST read that file (and the matching `*.export.ts` + `setup-prod.ts` lines). Do **not** invent export names.

Exposing anything to other plugins is a **4-layer contract**. All four layers must stay in sync. Missing any one layer means plugins either cannot import the symbol, or get a runtime `PluginAPI` miss.

### 0.1 Architecture (runtime + package)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Plugin consumer                                                         │
│  import { CurrencyInput } from "@quan-erp/base-frontend"                 │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ package entry re-exports
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  base/frontend/src/export.tsx                                            │
│  • enum APINames { CurrencyInput = "CurrencyInput", ... }                │
│  • export * from './page/currency/currency.export'  (and other barrels)  │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌─────────────────────────────┐         ┌─────────────────────────────────┐
│  *.export.ts (thin wrapper) │         │  setup-prod.ts (runtime bind)   │
│  PluginAPI.use(             │         │  PluginAPI.expose(              │
│    'builtin',               │◄────────│    'builtin',                   │
│    APINames.CurrencyInput   │  lookup │    APINames.CurrencyInput,      │
│  )(props)                   │         │    CurrencyInputImpl            │
└─────────────────────────────┘         └─────────────────────────────────┘
                                                      ▲
                                                      │ imports real impl
                                                      │
                                        ┌─────────────┴──────────────┐
                                        │ component/*.tsx / *.api.ts │
                                        └────────────────────────────┘
```

| Layer | File(s) | Role |
|---|---|---|
| **1. Name registry** | `export.tsx` → `APINames` | Stable string keys used by `PluginAPI.expose` / `PluginAPI.use`. |
| **2. Package barrel** | `export.tsx` → `export * from '...*.export'` | What TypeScript / npm consumers can `import { X } from "@quan-erp/base-frontend"`. |
| **3. Consumer wrapper** | `api/**/*.export.ts`, `page/**/*.export.ts`, `components/**/*.export.ts`, `store/**/*.export.ts` | Thin functions that call `PluginAPI.use('builtin', APINames.X)(...)`. Must mirror the **real** implementation signature. |
| **4. Runtime expose** | `provide/setup-prod.ts` | Registers the **real** implementation: `PluginAPI.expose(pluginName, APINames.X, Impl)`. |

**Plugin name:** always `BUILTIN_PLUGIN.name` (`'builtin'`).

### 0.2 What lives in `export.tsx` (two halves)

#### A) `APINames` enum (runtime keys)

Every value that is `PluginAPI.expose`’d MUST have a matching enum member. Enum **member name** and **string value** are usually identical (e.g. `CurrencyInput = "CurrencyInput"`).

> [!WARNING]
> Do **not** rename `AllowedAPIPermissions = 'allowed-api-permission'` — that string is consumed by `@quan-erp/shared-ui`.

Full current catalog (grouped as in `export.tsx`):

| Group | `APINames` members |
|---|---|
| Core / app | `useAppRegistry`, `queryClient`, `navigate` |
| Notifications | `inAppNotificationRegistry`, `firebaseForegroundNotificationRegistry`, `firebaseBackgroundNotificationRegistry` |
| Nav / shell stores | `useNavMenuStore`, `useBottomNavBarStore`, `useWebEnvStore`, `useRootComponentStore` |
| Home shortcut | `useHomeShortcutStore`, `ShortcutItem` |
| Settings | `useSettingQuery`, `useUpdateSettingQuery`, `useSettingStore`, `useSettingContext`, `useIsContainInBottomNavBar` |
| Permission | `AllowedAPIPermissions`, `usePerimssionTemplateStore`, `Protected` |
| Branch | `useBranchQuery`, `useCreateBranchQuery`, `useUpdateBranchQuery`, `BranchDropdown` |
| Partner | `usePartnerQuery`, `useCreatePartnerQuery`, `useUpdatePartnerQuery`, `partnerDetailTabs`, `PartnerDropdown` |
| Location | `useCountriesQuery`, `useStatesQuery`, `useDivisionsQuery`, `useTownshipsQuery`, `CountryDropdown`, `StateDropdown`, `DivisionDropdown`, `TownshipDropdown` |
| Partner shipping | `useCreateParnterShippingAddressQuery`, `useUpdateParnterShippingAddressQuery`, `useDeleteParnterShippingAddressQuery` |
| Currency | `useCurrencyQuery`, `useCreateCurrencyQuery`, `useUpdateCurrencyQuery`, `CurrencyDropdown`, `CurrencyInput` |
| Exchange rate | `useFromCurrencyExchangeRate`, `useFromCurrencyExchangeRateWithTo`, `useUpdateCurrencyExchangeRate` |
| Media | `useMediaFilesQuery`, `useUploadMediaQuery`, `MediaDialog` |
| UOM | `useUnitMeasurementQuery`, `useUpdateUnitMeasurementQuery`, `useCreateUnitMeasurementQuery`, `useUnitMeasurementByCategoryQuery`, `UnitMeasurementDropdown`, `UnitMeasurementCategoryDropdown` |
| UOC | `useUnitOfConversionQuery`, `useUnitOfConversionToQuery`, `useAllUnitOfConversionQuery` |
| User | `useUserQuery`, `useUpdateUserQuery`, `useCreateUserQuery`, `UserDropdown` |
| Env | `getViteEnv` |
| Tag | `useCreateTagQuery`, `useTagQuery`, `useFindTagStartWithQuery`, `TagDropdown` |
| Dashboard | `useDashboardContext` |
| Change log | `ChangeLog`, `useChangeLogQuery`, `useInfiniteChangeLog`, `useReactChangeLogQuery`, `useRemoveReactChangeLogQuery`, `clearChangeLogCache` |
| Spotlight | `SportlightSearchCallback`, `SportligthSearchStore` |
| AI assistant | `useAvailableAssistantQuery`, `AssistantDropdown` |
| Role | `useRoleQuery`, `useUpdateRoleQuery` |
| Workflow | `WorkflowNode`, `workflowNodes`, `workflowGenericOnSave`, `workflowGenericOnLoad`, `createWorkflowNodeComponent` |

#### B) `export *` barrels (TypeScript / npm public API)

These re-exports are what make symbols available on `@quan-erp/base-frontend`. They are organized by concern:

**API / hooks** (`api/**/*.export.ts`, plus locale / plugin):

```text
./plugin/export
./locale/locale.export
./api/role-permission/role-permission.export
./api/setting/setting.export
./api/permission/permission.export
./api/currency-exchange/currency-exchange.export
./api/branch/branch.export
./api/location/location.export
./api/partner/partner.export
./api/partner-shipping-address/partner-shipping-adderss.export
./api/currency/currency.export
./api/file/file.export
./api/unit/uom.export
./api/unit/uoc.export
./api/user/user.export
./api/notification/notification.export
./api/tag/tag.export
./api/change-log/change-log.export
./api/firebase/firebase.export
./api/ai-assistant/ai-assistant.export
./api/workflow/workflow.export
```

**UI components** (`page/**` / `components/**`):

```text
./components/change-log/change-log.export
./components/home-shortcut-item/home-shortcut-item.export
./components/tag/tag.dropdown.export
./components/location/location.export
./page/partner/partner.export
./page/uoc/uoc.export
./page/user/user.export
./page/branch/branch.export
./page/ai-assistant/ai-assistant.export
./page/currency/currency.export          ← CurrencyDropdown, CurrencyInput (+ props types)
```

**Stores:**

```text
./store/nav-menu/nav-menu.export
./store/bottom-nav-bar/bottom-nav-bar.export
./store/web-env/web-env.export
./store/home-shortcut/home-shortcut.export
./store/root-component-store/root-component.export
./store/permission-template/permission-template.export
./store/partner-detail-tab-store/partner-detail-tab.export
./components/sportlight-search/sportlight-search.export
```

**Misc:**

```text
./export/index          ← navigate, dashboard helpers, bottom-nav helpers, types utils
./utils/index
```

> [!NOTE]
> Hook wrappers and UI wrappers for the same domain are often split:
> - hooks/types → `api/currency/currency.export.ts`
> - UI → `page/currency/currency.export.ts`
> Both must be re-exported from `export.tsx` if consumers need them.

### 0.3 Checklist: expose a new symbol (e.g. `CurrencyInput`)

When base adds a new hook/component for plugins, do **all** of these:

1. **Implement** the real function/component under `src/api/...` or `src/page/.../component/...`.
2. **Add `APINames.X`** in `export.tsx` (string value must match what `setup-prod` / wrappers use).
3. **Create or extend** the domain `*.export.ts` wrapper:
   ```typescript
   // page/currency/currency.export.ts
   export function CurrencyInput(props: CurrencyInputProps) {
     return PluginAPI.use<CurrencyInputType>(BUILTIN_PLUGIN.name, APINames.CurrencyInput)(props);
   }
   export type { CurrencyInputProps } from "./currency.type";
   ```
   - Wrapper signature MUST match the real implementation (including list-query `(query, option?)` shape).
   - Re-export prop/DTO types from the same file so consumers get types from `@quan-erp/base-frontend`.
4. **Re-export the barrel** from `export.tsx` if new:
   ```typescript
   export * from './page/currency/currency.export'
   ```
5. **Register runtime** in `provide/setup-prod.ts`:
   ```typescript
   import { CurrencyInput } from "../page/currency/component/currency.input";
   PluginAPI.expose(pluginName, APINames.CurrencyInput, CurrencyInput)
   ```
   - Expose the **implementation**, never the `PluginAPI.use` wrapper (avoid recursive lookup).
6. **Publish / rebuild** (`npm run build:export` in base frontend) so plugin `node_modules/@quan-erp/base-frontend` types refresh.

### 0.4 Common failure modes

| Symptom | Likely cause |
|---|---|
| TS: module has no exported member `X` | Missing `export * from '...*.export'` in `export.tsx`, or stale published package. |
| Runtime: PluginAPI cannot resolve `X` | Missing `PluginAPI.expose` in `setup-prod.ts`, or `APINames` string mismatch. |
| TS signature wrong in plugins | Wrapper in `*.export.ts` out of date vs real hook; or plugins still on old build. |
| Import works in base app, fails in plugin | Plugin imported internal path, or forgot package rebuild/publish. |

### 0.5 Consumer vs base-internal imports

| Context | Import from |
|---|---|
| Other plugins / published consumers | `@quan-erp/base-frontend` (wrapper via `PluginAPI.use`) |
| Inside base app pages that own the UI | Local implementation path is OK (e.g. currency page → `./component/currency.input`) |
| `setup-prod.ts` | Always import the **implementation**, then `PluginAPI.expose` |

---
