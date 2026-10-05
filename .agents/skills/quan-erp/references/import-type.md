# `import type` (required for SWC / safe with TypeScript)

Quan ERP **core packages** export many **type-only** symbols (`interface` / `type`) with **no runtime export**:

- `@quan-erp/shared-backend-core`
- `@quan-erp/shared-types`
- `@quan-erp/shared-frontend-core` (pagination / DTO **types**)
- `@quan-erp/shared-ui` (locale and component **prop types**)

TypeScript usually elides type imports; **SWC with `decoratorMetadata` does not** when they are imported as values. **Vite/Rollup** on the frontend can treat value imports as required runtime bindings.

Symptom:

```text
SyntaxError: The requested module '@quan-erp/shared-backend-core' does not provide an export named 'Env'
SyntaxError: The requested module '@quan-erp/shared-backend-core' does not provide an export named 'WebsocketServer'
SyntaxError: The requested module '@quan-erp/shared-types' does not provide an export named 'IAppInstance'
SyntaxError: Named export 'Request' not found. The requested module 'express' is a CommonJS module...
```

## Rule

Use **`import type`** (or `import { type X }`) for every symbol that is only used as a **type annotation**. Keep runtime imports for decorators, classes, services, and functions.

```typescript
// BAD — value import of an interface → SWC keeps it → runtime crash
import { InjectEnv, Env } from "@quan-erp/shared-backend-core";
import { IAppInstance, PluginMetadata } from "@quan-erp/shared-types";

// GOOD
import { InjectEnv } from "@quan-erp/shared-backend-core";
import type { Env } from "@quan-erp/shared-backend-core";
import type { IAppInstance, PluginMetadata } from "@quan-erp/shared-types";
```

Same pattern with inline `type`:

```typescript
import { InjectEnv, type Env } from "@quan-erp/shared-backend-core";
import type { IAppInstance, PluginMetadata, GetMigrationsType } from "@quan-erp/shared-types";
```

When a file mixes many runtime and type symbols from the same package, prefer **two import lines** (values, then `import type`) for clarity:

```typescript
import {
  InjectWebsocketServer,
  Websocket,
  WebsocketClient,
  WebsocketMessageHandler,
} from "@quan-erp/shared-backend-core";
import type {
  ClientInfo,
  IWebsocket,
  WebsocketEvents,
  WebsocketServer,
} from "@quan-erp/shared-backend-core";
```

---

## `@quan-erp/shared-backend-core` — must use `import type`

| Symbol | Typical use |
|---|---|
| `Env` | `@InjectEnv() env: Env` |
| `SetPluginEnvOptions` | `env.set(..., options?: SetPluginEnvOptions)` |
| `EnvRegistryMetadata` | typing `env.all()` results |
| `Loggable` | `@InjectBuiltinLogger() logger: Loggable` |
| `ICache` | `@CacheClient(...) cache: ICache` |
| `IHealthCheck` | `@InjectHealthCheck() health: IHealthCheck` |
| `IPluginServiceEventManager` | `@InjectPluginServiceEventManager() …` |
| `RequestedUser` | `@User() user: RequestedUser` / param types |
| `TokenUserInfo` | JWT / sender info in services (type-only) |
| `CreateServiceProps<T>` | generic CRUD helper props in services |
| `IExpressMiddleware` | `implements IExpressMiddleware` on middleware classes |
| `WebsocketServer` | `@InjectWebsocketServer(path) server: WebsocketServer` |
| `IWebsocket` | `export class X implements IWebsocket` |
| `ClientInfo` | websocket handler `(client: ClientInfo, …)` |
| `WebsocketEvents` | typing event maps on websocket classes |
| DTO / pagination types | `Pagination<T>`, `IndexPagination<D>`, any `export type` / `export interface` |

**Keep as value imports:** `@Inject`, `@InjectEnv`, `@Controller`, `@Service`, `@InjectWebsocketServer`, `@Websocket`, `Websocket`, `WebsocketClient`, `WebsocketMessageHandler`, `WebsocketTextMessage`, `RequestDto`, `ResponseDto`, `DataSourceManager`, entity/service **classes**, etc.

### Websocket classes (common mistake)

`WebsocketServer` is injected via `@InjectWebsocketServer` but the **property type** must be `import type`. Do **not** value-import `WebsocketServer` next to `InjectWebsocketServer`.

---

## `express` — must use `import type`

Express is CommonJS. Named value imports like `Request`, `Response`, and `NextFunction` fail at runtime under Node ESM.

```typescript
// BAD
import { Request, Response } from "express";

// GOOD
import type { NextFunction, Request, Response } from "express";
```

Keep value imports only for the default app/router if your bundler resolves them (often `import express from "express"`).

---

## Plugin-local types (your plugin only)

Symbols from `*.types.ts`, feature `*.dto.ts`, or `export type` in the same plugin are still **type-only** at runtime. SWC will emit value imports if you use a normal import.

```typescript
// BAD
import { SampleItemDto, CreateSampleItemDto } from "./sample.types.js";

// GOOD
import type { SampleItemDto, CreateSampleItemDto } from "./sample.types.js";
```

### `backend/src/export.ts`

Re-export types with **`export type`**, not `export { … }`:

```typescript
export type { SampleItemDto } from "./feature/sample/sample.types.js";
export { SampleService } from "./feature/sample/sample.service.js";
```

---

## `@quan-erp/shared-types` — must use `import type`

Almost everything in this package is type-only. **Never value-import** these:

### Backend plugin contracts

| Symbol | Typical use |
|---|---|
| `IPlugin` | `export default class Plugin implements IPlugin` |
| `IAppInstance` | `onInstall(app: IAppInstance)`, `@InjectAppInstance() app: IAppInstance` |
| `PluginMetadata` | `getMetadata(): PluginMetadata` / cast `module.metadata.json` |
| `PluginExposedFeature` | `getAppModule(): PluginExposedFeature` |
| `IDatabaseMigration` | migration class `implements IDatabaseMigration` |
| `IDatabaseMigrationClass` | typing migration constructors |
| `GetMigrationsType` | `getMigrations(): GetMigrationsType` |
| `PluginType` / `BackendPluginType` / `WebPluginType` / … | metadata `type` field |
| `BaseDetail` | install / platform detail typing |
| `PluginDependencies` | dependency map typing |

### Frontend / registry contracts

| Symbol | Typical use |
|---|---|
| `PluginModule` | `const Plugin: PluginModule = { register(AppRegistry) { … } }` |
| `AppRegistryState` | `register(AppRegistry: AppRegistryState)` |
| `UserInfo` | logged-in user shape |
| `SettingComponents` | settings UI registration typing |
| `HttpMethod` / `ApiPermission` | permission / API metadata typing |
| `WithApiMetadataFetchFn` | typing `withApiMetadataFetchFn` payloads |
| `Route` / `PageRoute` / `RootRoute` | route registration typing |
| `Menu` / `SingleMenu` / `GroupMenu` / `NavMenuItem` | menu registration typing |
| `Component` | menu `name` / React element union |
| `DashboardItems` / `Report` / `PluginInfo` | dashboard / report / plugin info typing |
| `PagePermissionRouteStore` / `Optional<T, K>` / `PluginMetadataInfo` | utility / store typing |

### `@quan-erp/shared-types` — keep as **value** import

| Symbol | Why |
|---|---|
| `withApiMetadataFetchFn` | **Runtime function** used in `src/api/**` and `requiredApis` |

```typescript
import { withApiMetadataFetchFn } from "@quan-erp/shared-types";
import type { AppRegistryState, PluginModule, ApiPermission } from "@quan-erp/shared-types";
```

---

## `@quan-erp/shared-frontend-core`

| Kind | Examples | Import |
|---|---|---|
| **Classes (value)** | `RequestDto`, `ResponseDto`, `PluginAPI`, `Platforms`, `PluginAssets` | normal import |
| **Types only** | `RequestIndexPaginationDto`, `Pagination`, `IndexPagination`, `CursorPagination`, `RequestCursorPaginationDto` | `import type` |

```typescript
import { RequestDto, ResponseDto } from "@quan-erp/shared-frontend-core";
import type { RequestIndexPaginationDto } from "@quan-erp/shared-frontend-core";
```

---

## `@quan-erp/shared-ui`

| Kind | Examples | Import |
|---|---|---|
| **Components / hooks (value)** | `Button`, `Form`, `Page`, `useLazyLocaleTranslation`, `cn` | normal import |
| **Types only** | `LazyLocaleType`, `LocaleType`, `DesktopDialogType`, table/pagination helper types | `import type` |

```typescript
import { Button, useLazyLocaleTranslation } from "@quan-erp/shared-ui";
import type { LazyLocaleType } from "@quan-erp/shared-ui";
```

---

## Frontend API layer (`axios`)

Use **`import type`** for symbols that appear only in types (e.g. error handling, client typing):

```typescript
import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
```

Pair with core DTO types from `@quan-erp/shared-frontend-core` and local `*.types.ts` via `import type`.

---

## SWC + DI related notes

1. **Do not use `@rollup/plugin-swc`** for plugin backend watch — it drops decorated class fields (`service;`), so `PropertyInjectionHelper` never wires `@Inject`. Use `@swc/core` `transformSync` directly (see `plugins/sample-es/backend/rollup.config.js`) or `@rollup/plugin-typescript`.
2. SWC transpile **does not typecheck**. Run `npm run typecheck` (`tsc --noEmit`) separately / in CI.
3. Prefer `import type` even when using TypeScript emit — safer and matches SWC.
4. Backend `index.ts` should type-import plugin contracts:

```typescript
import type {
    GetMigrationsType,
    IAppInstance,
    IPlugin,
    PluginExposedFeature,
    PluginMetadata,
} from "@quan-erp/shared-types";
```

5. After fixing imports, ensure the running app loads **fresh** backend bundles (`base/backend/installed-plugins/<plugin>/<version>/backend/module.js` or dev watch output), not an older cached build.

### TypeORM `@Column` + string union aliases (SWC)

Entity fields typed as a **type alias union** (e.g. `type SampleStatus = "draft" | "active"`) get `design:type` metadata **`Object`** under SWC, not `String`. TypeORM then fails at startup:

```text
DataTypeNotSupportedError: Data type "Object" in "SampleEntity.status" is not supported by "postgres"
```

Set an explicit DB type on those columns:

```typescript
type SampleStatus = "draft" | "active";

@Column({ type: "varchar", length: 16 })
status: SampleStatus;
```

Plain `string` properties can often use `@Column({ length: N })`; union aliases and branded string types need `type: "varchar"` (or `text` / `enum` as appropriate).

---

## Quick check

If Node or Vite says `does not provide an export named 'X'` (or express named export errors):

1. Confirm `X` is an `interface` / `type` in a core package, `express`, or local `*.types.ts`.
2. Change the source to `import type { X }` or `export type { X }` for re-exports.
3. Rebuild backend (`quan-erp plugin watch` / `npm run build:dev`) or frontend (`MODE=dev vite build --watch`).
4. Search for other value imports: `rg "import \\{[^}]*\\bX\\b" plugins/<your-plugin>/`.

When editing many files, use **per-file** edits (StrReplace / Write). Do not rely on bulk rewrite scripts — easy to miss mixed value/type import lines.
