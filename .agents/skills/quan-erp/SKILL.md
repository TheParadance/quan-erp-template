---
name: quan-erp
description: >-
  Provides the knowledge, architecture, and patterns required to develop,
  maintain, and extend backend and frontend plugins for the Quan ERP system.
  Also covers local module table seeding (INSERT into module via base/backend/.env)
  when registering a new plugin for local/dev only.
---

# Quan ERP Development Skill

This skill provides the knowledge and patterns required to develop, maintain, and extend plugins for the Quan ERP system.

## Overview

Quan ERP is a plugin-based system where each module is a standalone plugin (e.g. `my-plugin`). Plugins follow a strict structure for both backend and frontend.

## CRITICAL INSTRUCTIONS FOR AI AGENTS
> [!IMPORTANT]
> **DO NOT GUESS OR HALLUCINATE QUAN-ERP PATTERNS.** This is a highly customized plugin architecture. 
> *   **Before starting ANY task:** You MUST review the list of references below and use the `view_file` tool to read **ALL** files that are even slightly relevant to the user's request. 
> *   **Do not rely on your pre-trained knowledge.** If you are touching the backend, you must read all backend references related to your task. If you are touching the frontend, you must read all frontend references related to your task.
> *   **Frontend API-backed work:** If a frontend task creates, moves, edits, or consumes backend API calls, you MUST read `references/frontend/react-query-api.md` and implement the `src/api/<domain>` pattern with React Query hooks before editing code. Page components must consume `.queries.ts` / `.mutations.ts` hooks; only those hook files should call API object `.fetchFn` methods. **List hooks MUST use `(query: RequestIndexPaginationDto, option?: UseQueryOptions)`** — never `(skip, limit, …)`. GET hooks return the unwrapped `payload` (`T` / `T[]`); consumers use `const { data: items = [] } = useXQuery(...)` with no `.payload`. Non-list keyed queries put ids in an object (e.g. `{ fromId, toId }`) plus options.
> *   **Entity dropdowns:** Prefer `*.dropdown.tsx` (Command + Popover/Drawer). `value` / `trigger` MUST use `id | TakeAndPartialRest<Dto, identityKey>` (e.g. `"id"` or `"shortId"`). When resolving that union, name helpers explicitly (`resolveMyItemId`, `resolveMyItemShortId`) — never vague `resolveId` / `resolveShortId`. See `.agents/rules/frontend-writing-style.md` §7.
> *   **No tiny wrapper helpers / pointless locals:** Do **not** create one-liner / few-line functions that only rename a call (`formatCount` → `toLocaleString()`, pointless `const TAB_VALUE = CONST`, etc.). Do **not** alias properties (`const rule = item.pricingRule` → use `item.pricingRule` after a guard), duplicate identical formula/ctx keys when values are equal, or Date↔dayjs round-trips (`toDate()` then `dayjs(asOf)` again). Keep dayjs for math; call `.toDate()` / `.valueOf()` only at the boundary (return / ctx). Extract only for real shared/domain logic. See `.agents/rules/frontend-writing-style.md` §8, `.agents/rules/backend-writing-style.md` §12, `.agents/rules/no-micro-functions.md`.
> *   **Public page authentication:** If a task involves login, signup, sessions, or tokens on a public (rootRoute) page, you MUST read `references/frontend/public-page-authentication.md` and follow the httpOnly cookie access/refresh token pattern — never store raw tokens (or a session/auth hint) in localStorage, and never send tokens through JavaScript-readable state. Auth is cookies only; protected pages rely on API success/401. Nested public route pages (login/signup/home) MUST be loaded with `React.lazy` + `Suspense` (shared-ui `LoadingState` fallback).
> *   **Dates:** Prefer `dayjs` for calendar math and formatting (frontend peer; backend when already used). Do NOT hand-roll `new Date()` + padStart string formatting. Do NOT convert to `Date` mid-calc only to wrap with `dayjs` again.
> *   **`useEffect` dependencies:** Do **not** add stable functions (`navigate`, Zustand actions, `queryClient`, etc.) to the dependency array unless their identity actually changes and should re-run the effect. Depend on the reactive values that matter (e.g. `query.error`, props/state).
> *   **CSS theme tokens:** If a frontend task introduces custom colors, branded public UI, light/dark theming, or styles sticky footers/sections inside `ResponsiveDialog` / Dialog / Sheet / Drawer, you MUST read `references/frontend/css-styling.md`. Use predefined base tokens from `base/frontend/src/index.css` (`--background`, `--dialog-background`, `--drawer-background`, `--sheet-background`, etc.). Match overlay footers to the surface: `bg-(--drawer-background)` on mobile drawer, `md:bg-(--dialog-background)` on desktop dialog — never `bg-background` inside portaled overlays. Declare plugin-only colors on `:root` / `.dark`, map in `@theme inline`, drive theme with Tailwind class strategy. When composing conditional Tailwind `className` values, ALWAYS use `cn` from `@quan-erp/shared-ui`.
> *   **Shared UI components:** For ANY frontend UI work (including public/rootRoute pages), you MUST read `references/frontend/ui-library.md` and `references/shared-ui/shared-ui.md`. Prefer `@quan-erp/shared-ui` primitives as much as possible (`Button`, `Card`, `Input`, `Badge`, `Alert`, `EmptyState`, `LoadingState`, `ErrorState`, `Item`, `ButtonGroup`, `Table`, etc.). Do NOT use raw `<button>`, `<input>`, or hand-rolled card/alert/empty markup when a shared-ui equivalent exists. Do **not** wrap shared-ui `<Table>` in an extra bordered shell (`rounded-lg border` / `border border-border`); overflow wrappers only (`overflow-x-auto`) when needed.
> *   **Page layout / Dialogs:** For ANY page using `<Page>`, read `references/frontend/page-layout.md`. Nest `<Dialog>`, `<Sheet>`, `ResponsiveDialog`, and similar overlays **inside** `<PageContent>` — never as siblings under `<Page>` after `</PageContent>`. **Outside `<PageContent>` the dialog will not work** (open state / portal / layout break). Always pass `pluginName={metadata.name}` on portaled content (`ResponsiveContent`, `DialogContent`, `SheetContent`, etc.). For `ResponsiveTitle` / `ResponsiveDescription`, **always wrap children in a `<div>`** (do not pass bare text or fragments).
> *   **Dashboard widgets:** When registering `AppRegistry.dashboard.add`, **inline `DashboardItem` in `index.tsx`**. Widget components export content only — never wrap with `DashboardItem` inside the widget file. `id` on registration and on `DashboardItem` must match. See `references/frontend/adding-dashboard-widget.md`.
> *   **Forms:** For ANY form (admin or public/rootRoute login/signup), you MUST use the full standard Shadcn form stack from `@quan-erp/shared-ui`: `<Form {...form}>` + `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`, driven by `react-hook-form` + `zod` + `zodResolver`. Do NOT wire forms with bare `register()` on `Field`/`Input` only, and do NOT skip `FormMessage` for validation errors. See `references/shared-ui/shared-ui.md` (Forms section).
> *   **Backend circular DI:** If two services import each other and you see `Cannot access 'X' before initialization`, read `references/backend/annotations.md` (§ `@Inject` → Circular service injection). Use `@Inject(() => OtherService)` with `prop: InstanceType<typeof OtherService>` — never plain `@Inject(OtherService)` + `prop: OtherService` on both sides.
> *   **`@AITool`:** When adding or editing `@AITool`, read `references/backend/add-ai-tools.md`. Always set `mcpAnnotations` (`readOnlyHint` / `openWorldHint` / `destructiveHint`) as a **sibling of `toolDetail`** (never inside `function` / `parameters`). Match real behavior: GET → read-only; DELETE → destructive; external APIs (e.g. FCM) → `openWorldHint: true`.
> *   **AI SDK / models / realtime:** When calling LLMs, adding a provider, configuring `ai_model.sdkType`, counting tokens (`onUsage`), or wiring speech-to-speech, read `references/backend/ai-sdk.md`. Prefer `AIModelService.getInstance` / `getRealtimeAgent` over constructing provider clients in plugins.
> *   **Backend `@Controller` paths:** The framework **already prefixes** every controller with `/{pluginName}` from `module.metadata.json`. Use resource-only paths: `@Controller("/item")` → full URL `/my-plugin/item`. **Never** `@Controller(\`/${metadata.name}/item\`)` or `@Controller("/my-plugin/item")` — that doubles the plugin segment (`/my-plugin/my-plugin/item`). Frontend axios/`withApiMetadataFetchFn` URLs **do** include `/${metadata.name}/...` and must match the full path. See [Annotations](./references/backend/annotations.md) (`@Controller`) and [Call Backend API](./references/frontend/call-backend-api.md).
> *   **`import type`:** Use `import type` (or `import { type X }`) for every symbol that is type-only at runtime. **Backend (SWC):** `@quan-erp/shared-backend-core` (`Env`, `Loggable`, `ICache`, `RequestedUser`, `WebsocketServer`, `IExpressMiddleware`, …), `@quan-erp/shared-types` (almost all exports; **value-only** `withApiMetadataFetchFn`), `express` (`Request`, `Response`, `NextFunction`), plugin `*.types.ts` and `export type` in `export.ts`. **Frontend (Vite):** `AxiosError` / `AxiosInstance` from `axios`, pagination/DTO types from `@quan-erp/shared-frontend-core`, locale/helper types from `@quan-erp/shared-ui`. Symptom: `does not provide an export named '…'`. See [Import type](./references/import-type.md).
> *   **Backend service CRUD:** For feature `create` / `update` / `remove`, read `references/backend/service-crud-patterns.md`. Create: `repo.insert({...})`, return `{ id }` from `identifiers` — no `create`+`save`, no post-insert `findOne`. Updates: `repo.update({ id }, { ...data, updateDate: new Date() })` and throw when `!result.affected`. Soft deletes: `repo.softDelete(id)` + `affected` check (not `softRemove`); `findOne` only when side effects need row fields.
> *   **Backend cron jobs:** For scheduled/background jobs, read `references/backend/cron-job.md`. **Always prefer Redis cron** via built-in `CronJobService` (BullMQ + Redis; inject with `ContainerRegistryManager.BUILTIN_PLUGIN`). Re-attach listeners on `@OnAllModuleLoaded` (callbacks are in-memory). Do not use `@CronJob` for new work unless explicitly requested.
> *   **CLI:** If the task uses `quan-erp` / `@quan-erp/cli`, read [CLI](./references/cli.md). Do not invent commands. **Creating a new plugin MUST use `quan-erp plugin new` (or `new` / `new-plugin`)** — never copy another plugin folder. Never invoke `./erp`. To register a plugin in the local DB, use `quan-erp plugin seed <plugin-name>` (or `seed-plugin`; see [Add module seed](./references/backend/add-module-seed.md)). To inspect plugin TypeScript / Vite / Rollup errors, run `quan-erp plugin build:dev:log <plugin-name>` (not `watch`). Local stack: `quan-erp run dev` (opens frontend after backend `:8080` + frontend `:80` are up; use `--no-open` in agent/CI). Cloud VM work uses `quan-erp deploy` (login required; see CLI reference).
> *   **Backend plugin env (`@InjectEnv`):** Env is **per-plugin**. Plugin A’s `env.get` cannot read keys registered for plugin B (or base/`builtin`). Keys used by a plugin’s services MUST be seeded in that plugin’s root `@OnInit` via `this.env.set(...)` + `await this.env.sync()` (e.g. `MY_APP_URL`, `S3_BUCKET`). Cross-plugin beans still need the **consumer** plugin to own any keys it reads. See [Plugin Env](./references/backend/plugin-env.md), [Plugin Root Module](./references/backend/plugin-root-module.md), and [Annotations](./references/backend/annotations.md) (`@InjectEnv`).
> *   **Mandatory Verification:** You must explicitly read these files using the `view_file` tool before writing a single line of code.

## Core Reference Documentation

Use these references to ensure consistency with the system's architecture:

### General
- [Folder Structure](./references/plugin-development-folder-structure.md): The standard layout for every plugin.
- [How Plugins Work](./references/how-plugins-work.md): The lifecycle and integration patterns for plugins.
- [Technology Stack](./references/technology-stack.md): The core technologies used in backend and frontend.
- [CLI](./references/cli.md): `quan-erp` / `@quan-erp/cli` commands (`plugin …`, new-project, `run dev [--no-open] [--backend|…]`, login/register, deploy).
- [Plugin Lifecycle & CLI](./references/plugin-lifecycle-cli.md): The build, distribution, and installation process.
- [Package Naming Convention](./references/package-json-naming.md): Standards for `package.json` naming in plugins.
### Backend Development
- [Backend Annotations](./references/backend/annotations.md): Essential decorators for Controllers and Services.
- [AI Tool Registration](./references/backend/add-ai-tools.md): How to expose service methods as AI tools using `@AITool` (includes required `mcpAnnotations` conventions).
- [AI Assistant SDK](./references/backend/ai-sdk.md): Chat LLM providers (`OpenAI` / `Gemini` / `Qwen`), `onUsage` token counts, `AISDKAPIType`, and realtime speech agents under `shared-backend-core` `ai-assistant/sdk`.
- [Entity Annotations](./references/backend/entity-annotation.md): TypeORM and AI-specific decorators for DB entities.
- [Backend Folder Structure](./references/backend/folder-structure.md): The standard backend layout.
- [Backend Assets](./references/backend/backend-assets.md): How to manage and retrieve plugin-specific backend assets.
- [File & Folder Management](./references/backend/plugin-folder-file-folder.md): How plugins handle runtime-generated data, temporary files, and bundled static assets.
- [Plugin Root Module](./references/backend/plugin-root-module.md): Configures the plugin entry point.
- [Plugin Env](./references/backend/plugin-env.md): Per-plugin `@InjectEnv` isolation, seeding, and `sync()`.
- [Module Metadata](./references/backend/module.metadata.md): Documentation for the `module.metadata.json` configuration.
- [DB Entity Definition](./references/backend/how-to-define-db-entity.md): Guidelines for defining database entities.
- [Service CRUD Patterns](./references/backend/service-crud-patterns.md): Create via `insert` + `{ id }`; update via `repo.update` + spread DTO + `affected`; soft delete via `softDelete` + `affected` (no `save` / field patches / post-write `findOne`).
- [Cross-Plugin Service Export](./references/backend/how-to-export-service-that-use-in-other-plugins.md): How to export and consume services across plugins.
- [Built-in Entities](./references/backend/builtin-entitites.md): Reference for core ERP entities (Auth, Location, etc.).
- [Built-in Services](./references/backend/builtin-service.md): Reference for core application services.
- [Request & Response DTOs](./references/backend/request-response-dto.md): Mandatory wrapping patterns for API communication.
- [Built-in Middleware](./references/backend/builtin-middleware.md): Reference for standard middleware like `@AuthenticatedUserOnly` and `@CheckAPIPermission`.
- [How to Create Middleware](./references/backend/how-to-create-middleware.md): Guidelines for custom decorators and class-based middleware.
- [How to Seed Data](./references/backend/how-to-seed-data.md): Patterns for initializing default data and configurations.
- [Add Module Seed (local DB)](./references/backend/add-module-seed.md): Insert a `module` table row for local/dev plugin registration (`psql` + `base/backend/.env` only).
- [How to Send Notifications](./references/backend/how-to-send-notification.md): How to trigger system and push notifications from backend services.
- [How to Create a Cron Job](./references/backend/cron-job.md): Prefer Redis cron via built-in `CronJobService` (BullMQ + Redis) from `@quan-erp/shared-backend-core`; avoid `@CronJob` unless explicitly requested.
- [How to Create Workflow Node (Backend)](./references/backend/how-to-create-workflow-node-backend.md): Guidelines, schema definitions, and lifecycle for custom workflow nodes in the backend.
### Frontend Development
- [Frontend Folder Structure](./references/frontend/folder-structure.md): The standard frontend layout.
- [Frontend Routing](./references/frontend/routing.md): How to define and register routes in the frontend.
- [API Permissions](./references/frontend/api-permissions.md): How to configure requiredApis for menu items and map routes accurately.
- [React Query API Declaration](./references/frontend/react-query-api.md): Standard for declaring APIs and React Query hooks using `withApiMetadataFetchFn`.
- [Frontend Page Standard](./references/frontend/page-layout.md): Standard structure using `<Page>`, `<PageTitle>`, and `<PageContent>`. **Dialogs/Sheets must be nested inside `<PageContent>`**, never as siblings under `<Page>` — outside `<PageContent>` the dialog will not work.
- [Responsive View Standard](./references/frontend/responsive-view.md): Patterns for mobile-first lists, Cupertino cards, and FAB integration.
- [Frontend Localization](./references/frontend/localization.md): How to use `useLazyLocaleTranslation` / `usePublicLazyLocaleTranslation` and `translation.get`.
- [Icon Selection](./references/frontend/icon-pack.md): Recommended icon packages for consistent UI.
- [IconParkMenuTabIcon](./references/frontend/icon-park-menu-tab-icon.md): Guide for wrapping IconPark menu icons.
- [Plugin Assets](./references/frontend/plugin-assets.md): How to resolve and use static assets in plugins.
- [Cross-Plugin Frontend Usage](./references/frontend/using-other-plugin-lib-or-component.md): How to share and consume components/logic across plugins.
- [Using Admin Settings](../quan-erp-plugins/base/references/using-admin-setting.md): How plugins read/update settings via `useSettingStore()` (double-call), `SettingKeys`, and related query/mutation APIs.
- [UI Library](./references/frontend/ui-library.md): Overview of components based on `@quan-erp/shared-ui`.
- [Call Backend API](./references/frontend/call-backend-api.md): Standards for frontend-to-backend communication.
- [Public Page Authentication](./references/frontend/public-page-authentication.md): Cookie-based access/refresh token pattern for public customer pages, including axios refresh interceptors and the backend middleware contract.
- [CSS Styling & Isolation](./references/frontend/css-styling.md): Mandatory scoping with `data-plugin` for Tailwind CSS.
- [Bottom Nav Visibility](./references/frontend/bottom-nav-visilibility-management.md): Managing mobile bottom navigation visibility and back buttons.
- [Adding Dashboard Widget](./references/frontend/adding-dashboard-widget.md): How to register and implement widgets for the main dashboard.
- [Adding Home Shortcut](./references/frontend/adding-home-shortcut.md): How to register quick-access shortcuts on the home screen.
- [Adding Sportlight Search](./references/frontend/adding-sportlight-search.md): How to contribute navigation and data search to the global search.
- [Notification Callback Registry](./references/frontend/notification-callback-registry.md): How to handle real-time notifications in the frontend.
- [Adding Report](./references/frontend/adding-report.md): How to contribute reports to the global report section.
- [Base Frontend Overview](./references/frontend/base-frontend.md): Overview of core platform services and components.
- [Floating Action Button (FAB)](./references/frontend/how-to-add-floating-action-button.md): Mobile FABs — **must** call `useIsContainInBottomNavBar` and set `!bottom-25` / `!bottom-5` (+ `<Page bottomNav>`) whenever adding a FAB.
- [How to Create Workflow Node (Frontend)](./references/frontend/how-to-create-workflow-node-frontend.md): Guidelines and UI components (`WorkflowNode`) for custom workflow nodes in the frontend.
### Shared Libraries
- [Import Type](./references/import-type.md): Required `import type` for shared packages, express, axios, and plugin-local types (SWC + Vite).
- [Shared Types](./references/shared-types/shared-types.md): Fundamental type definitions across the platform.
- [Shared Frontend Core](./references/shared-frontend-core/shared-frontend-core.md): API reference for hardware, sensors, and system services.
- [Shared UI](./references/shared-ui/shared-ui.md): Component and theme reference for the UI library.
- [Web Thermal Printer](./references/web-thermal-printer/web-thermal-printer.md): API reference for ESC/POS web thermal printing (Bluetooth/Serial).
- [External Plugins Skill](../quan-erp-plugins/SKILL.md): Master index for plugin skills — [Base](../quan-erp-plugins/base/SKILL.md) (`@quan-erp/base-frontend`; domain APIs in [base/references/](../quan-erp-plugins/base/references/)), [Accounting](../quan-erp-plugins/accounting/SKILL.md), [Products](../quan-erp-plugins/products/SKILL.md), [Sales & Purchases](../quan-erp-plugins/sales-and-purchases/SKILL.md), [Payment Method](../quan-erp-plugins/payment-method/SKILL.md), [Barcode Scanner](../quan-erp-plugins/barcode-scanner/SKILL.md).

## Development Guidelines

1. **Namespace isolation**: Always use the plugin's namespace for database entities, translations, and frontend API routes. Backend `@Controller` paths are resource-only (framework prefixes `/{pluginName}` — see CRITICAL INSTRUCTIONS).
2. **Dependency Awareness**: Before implementing features that rely on other modules, check the `pluginDependencies` in `module.metadata.json`.
3. **Core Library Usage**: Prefer utilities and decorators from `@quan-erp/shared-backend-core` and `@quan-erp/shared-frontend-core` instead of implementing custom logic for common ERP tasks.
4. **Standard Responses**: Always use `ResponseDto` for backend API responses to ensure a consistent experience for the frontend.
5. **Compile errors**: After changing plugin TypeScript / Vite / Rollup code, verify with `quan-erp plugin build:dev:log <plugin-name>`. Do **not** use `quan-erp plugin watch` to read build errors — it is a TUI that clears the terminal. Read the full stdout/stderr and the `=== SUMMARY ===` (`frontend: ok|failed`, `backend: ok|failed`). Exit code `1` means a side failed. This command does not copy artifacts; keep `watch` running separately to sync `available-plugins`.
