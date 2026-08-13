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

Quan ERP is a plugin-based system where each module (Inventory, Accounting, HR, etc.) is a standalone plugin. Plugins follow a strict structure for both backend and frontend.

## CRITICAL INSTRUCTIONS FOR AI AGENTS
> [!IMPORTANT]
> **DO NOT GUESS OR HALLUCINATE QUAN-ERP PATTERNS.** This is a highly customized plugin architecture. 
> *   **Before starting ANY task:** You MUST review the list of references below and use the `view_file` tool to read **ALL** files that are even slightly relevant to the user's request. 
> *   **Do not rely on your pre-trained knowledge.** If you are touching the backend, you must read all backend references related to your task. If you are touching the frontend, you must read all frontend references related to your task.
> *   **Frontend API-backed work:** If a frontend task creates, moves, edits, or consumes backend API calls, you MUST read `references/frontend/react-query-api.md` and implement the `src/api/<domain>` pattern with React Query hooks before editing code. Page components must consume `.queries.ts` / `.mutations.ts` hooks; only those hook files should call API object `.fetchFn` methods. **List hooks MUST use `(query: RequestIndexPaginationDto, option?: UseQueryOptions)`** — never `(skip, limit, …)`. GET hooks return the unwrapped `payload` (`T` / `T[]`); consumers use `const { data: items = [] } = useXQuery(...)` with no `.payload`. Non-list keyed queries put ids in an object (e.g. `{ fromId, toId }`) plus options.
> *   **Entity dropdowns:** Prefer Branch-style `*.dropdown.tsx` (Command + Popover/Drawer). `value` / `trigger` MUST use `id | TakeAndPartialRest<Dto, identityKey>` (e.g. `"id"` or `"shortId"`). When resolving that union, name helpers explicitly (`resolveAssistantShortId`, `resolveBranchId`) — never vague `resolveId` / `resolveShortId`. See `.agents/rules/frontend-writing-style.md` §7.
> *   **No tiny wrapper helpers / pointless locals:** Do **not** create one-liner / few-line functions that only rename a call (`formatPoints` → `toLocaleString()`, pointless `const TAB_VALUE = CONST`, etc.). Do **not** alias properties (`const rule = pawn.interestRule` → use `pawn.interestRule` after a guard), duplicate identical formula/ctx keys (`elapsedDays` + `periodDay` when equal), or Date↔dayjs round-trips (`toDate()` then `dayjs(asOf)` again). Keep dayjs for math; call `.toDate()` / `.valueOf()` only at the boundary (return / ctx). Extract only for real shared/domain logic. See `.agents/rules/frontend-writing-style.md` §8, `.agents/rules/backend-writing-style.md` §12, `.agents/rules/no-micro-functions.md`.
> *   **Public page authentication:** If a task involves login, signup, sessions, or tokens on a public (rootRoute) page, you MUST read `references/frontend/public-page-authentication.md` and follow the httpOnly cookie access/refresh token pattern — never store raw tokens (or a session/auth hint) in localStorage, and never send tokens through JavaScript-readable state. Auth is cookies only; protected pages rely on API success/401. Nested public route pages (login/signup/home) MUST be loaded with `React.lazy` + `Suspense` (shared-ui `LoadingState` fallback).
> *   **Dates:** Prefer `dayjs` for calendar math and formatting (frontend peer; backend when already used). Do NOT hand-roll `new Date()` + padStart string formatting. Do NOT convert to `Date` mid-calc only to wrap with `dayjs` again.
> *   **`useEffect` dependencies:** Do **not** add stable functions (`navigate`, Zustand actions, `queryClient`, etc.) to the dependency array unless their identity actually changes and should re-run the effect. Depend on the reactive values that matter (e.g. `query.error`, props/state).
> *   **CSS theme tokens:** If a frontend task introduces custom colors, branded public UI, or light/dark theming, you MUST read `references/frontend/css-styling.md`. Declare light tokens on `:root` and dark overrides on `.dark` in `src/index.css`, map them in `@theme inline`, and drive theme with Tailwind’s class strategy (`class="dark"` on `<html>`) using preference options `light` | `dark` | `system`. Never hand-write `[data-plugin="..."]` around CSS variables, and avoid hardcoded hex classes when a theme token exists. When composing conditional Tailwind `className` values, ALWAYS use `cn` from `@quan-erp/shared-ui` (see `references/frontend/css-styling.md` and `references/shared-ui/shared-ui.md`) — never concatenate class strings with template literals.
> *   **Shared UI components:** For ANY frontend UI work (including public/rootRoute pages), you MUST read `references/frontend/ui-library.md` and `references/shared-ui/shared-ui.md`. Prefer `@quan-erp/shared-ui` primitives as much as possible (`Button`, `Card`, `Input`, `Badge`, `Alert`, `EmptyState`, `LoadingState`, `ErrorState`, `Item`, `ButtonGroup`, etc.). Do NOT use raw `<button>`, `<input>`, or hand-rolled card/alert/empty markup when a shared-ui equivalent exists.
> *   **Page layout / Dialogs:** For ANY page using `<Page>`, read `references/frontend/page-layout.md`. Nest `<Dialog>`, `<Sheet>`, and similar overlays **inside** `<PageContent>` — never as siblings under `<Page>` after `</PageContent>`.
> *   **Dashboard widgets:** When registering `AppRegistry.dashboard.add`, **inline `DashboardItem` in `index.tsx`**. Widget components export content only — never wrap with `DashboardItem` inside the widget file. `id` on registration and on `DashboardItem` must match. See `references/frontend/adding-dashboard-widget.md`.
> *   **Forms:** For ANY form (admin or public/rootRoute login/signup), you MUST use the full standard Shadcn form stack from `@quan-erp/shared-ui`: `<Form {...form}>` + `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`, driven by `react-hook-form` + `zod` + `zodResolver`. Do NOT wire forms with bare `register()` on `Field`/`Input` only, and do NOT skip `FormMessage` for validation errors. See `references/shared-ui/shared-ui.md` (Forms section).
> *   **Backend circular DI:** If two services import each other and you see `Cannot access 'X' before initialization`, read `references/backend/annotations.md` (§ `@Inject` → Circular service injection). Use `@Inject(() => OtherService)` with `prop: InstanceType<typeof OtherService>` — never plain `@Inject(OtherService)` + `prop: OtherService` on both sides.
> *   **Backend service CRUD:** For feature `create` / `update` / `remove`, read `references/backend/service-crud-patterns.md`. Create: `repo.insert({...})`, return `{ id }` from `identifiers` — no `create`+`save`, no post-insert `findOne`. Updates: `repo.update({ id }, { ...data, updateDate: new Date() })` and throw when `!result.affected`. Soft deletes: `repo.softDelete(id)` + `affected` check (not `softRemove`); `findOne` only when side effects need row fields.
> *   **Backend cron jobs:** For scheduled/background jobs, read `references/backend/cron-job.md`. **Always prefer Redis cron** via built-in `CronJobService` (BullMQ + Redis; inject with `ContainerRegistryManager.BUILTIN_PLUGIN`). Re-attach listeners on `@OnAllModuleLoaded` (callbacks are in-memory). Do not use `@CronJob` for new work unless explicitly requested. Do not use the `cron-schedular` plugin for new work.
> *   **CLI:** If the task uses `quan-erp` / `@quan-erp/cli`, read [CLI](./references/cli.md). Do not invent commands. **Creating a new plugin MUST use `quan-erp new` (or `new-plugin`)** — never copy another plugin folder. Never invoke `./erp`. To inspect plugin TypeScript / Vite / Rollup errors, run `quan-erp build:dev:log <plugin-name>` (not `watch`).
> *   **Mandatory Verification:** You must explicitly read these files using the `view_file` tool before writing a single line of code.

## Core Reference Documentation

Use these references to ensure consistency with the system's architecture:

### General
- [Folder Structure](./references/plugin-development-folder-structure.md): The standard layout for every plugin.
- [How Plugins Work](./references/how-plugins-work.md): The lifecycle and integration patterns for plugins.
- [Technology Stack](./references/technology-stack.md): The core technologies used in backend and frontend.
- [CLI](./references/cli.md): `quan-erp` / `@quan-erp/cli` commands (watch, build:dev:log, new, new-project, build:prod, pack:prod, base:dev).
- [Plugin Lifecycle & CLI](./references/plugin-lifecycle-cli.md): The build, distribution, and installation process.
- [Package Naming Convention](./references/package-json-naming.md): Standards for `package.json` naming in plugins.

### Backend Development
- [Backend Annotations](./references/backend/annotations.md): Essential decorators for Controllers and Services.
- [AI Tool Registration](./references/backend/add-ai-tools.md): How to expose service methods as AI tools using `@AITool`.
- [Entity Annotations](./references/backend/entity-annotation.md): TypeORM and AI-specific decorators for DB entities.
- [Backend Folder Structure](./references/backend/folder-structure.md): The standard backend layout.
- [Backend Assets](./references/backend/backend-assets.md): How to manage and retrieve plugin-specific backend assets.
- [File & Folder Management](./references/backend/plugin-folder-file-folder.md): How plugins handle runtime-generated data, temporary files, and bundled static assets.
- [Plugin Root Module](./references/backend/plugin-root-module.md): Configures the plugin entry point.
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
- [Frontend Page Standard](./references/frontend/page-layout.md): Standard structure using `<Page>`, `<PageTitle>`, and `<PageContent>`. **Dialogs/Sheets must be nested inside `<PageContent>`**, never as siblings under `<Page>`.
- [Responsive View Standard](./references/frontend/responsive-view.md): Patterns for mobile-first lists, Cupertino cards, and FAB integration.
- [Frontend Localization](./references/frontend/localization.md): How to use `useLazyLocaleTranslation` / `usePublicLazyLocaleTranslation` and `translation.get`.
- [Icon Selection](./references/frontend/icon-pack.md): Recommended icon packages for consistent UI.
- [IconParkMenuTabIcon](./references/frontend/icon-park-menu-tab-icon.md): Guide for wrapping IconPark menu icons.
- [Plugin Assets](./references/frontend/plugin-assets.md): How to resolve and use static assets in plugins.
- [Cross-Plugin Frontend Usage](./references/frontend/using-other-plugin-lib-or-component.md): How to share and consume components/logic across plugins.
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
- [Floating Action Button (FAB)](./references/frontend/how-to-add-floating-action-button.md): Implementing single and multi-button FABs for mobile.
- [How to Create Workflow Node (Frontend)](./references/frontend/how-to-create-workflow-node-frontend.md): Guidelines and UI components (`WorkflowNode`) for custom workflow nodes in the frontend.
### Shared Libraries
- [Shared Types](./references/shared-types/shared-types.md): Fundamental type definitions across the platform.
- [Shared Frontend Core](./references/shared-frontend-core/shared-frontend-core.md): API reference for hardware, sensors, and system services.
- [Shared UI](./references/shared-ui/shared-ui.md): Component and theme reference for the UI library.
- [Web Thermal Printer](./references/web-thermal-printer/web-thermal-printer.md): API reference for ESC/POS web thermal printing (Bluetooth/Serial).
- [External Plugins Skill](../quan-erp-plugins/SKILL.md): Master index for plugin skills — [Base](../quan-erp-plugins/base/SKILL.md) (`@quan-erp/base-frontend`; domain APIs in [base/references/](../quan-erp-plugins/base/references/)), [Accounting](../quan-erp-plugins/accounting/SKILL.md), [Products](../quan-erp-plugins/products/SKILL.md), [Sales & Purchases](../quan-erp-plugins/sales-and-purchases/SKILL.md), [Payment Method](../quan-erp-plugins/payment-method/SKILL.md), [Barcode Scanner](../quan-erp-plugins/barcode-scanner/SKILL.md), [Cron Scheduler](../quan-erp-plugins/cron-schedular/SKILL.md).

## Development Guidelines

1. **Namespace isolation**: Always use the plugin's namespace for database entities, translations, and API routes.
2. **Dependency Awareness**: Before implementing features that rely on other modules, check the `pluginDependencies` in `module.metadata.json`.
3. **Core Library Usage**: Prefer utilities and decorators from `@quan-erp/shared-backend-core` and `@quan-erp/shared-frontend-core` instead of implementing custom logic for common ERP tasks.
4. **Standard Responses**: Always use `ResponseDto` for backend API responses to ensure a consistent experience for the frontend.
5. **Compile errors**: After changing plugin TypeScript / Vite / Rollup code, verify with `quan-erp build:dev:log <plugin-name>`. Do **not** use `quan-erp watch` to read build errors — it is a TUI that clears the terminal. Read the full stdout/stderr and the `=== SUMMARY ===` (`frontend: ok|failed`, `backend: ok|failed`). Exit code `1` means a side failed. This command does not copy artifacts; keep `watch` running separately to sync `available-plugins`.
