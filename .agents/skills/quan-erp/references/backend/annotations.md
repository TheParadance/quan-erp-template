# Backend Annotations Reference

This reference documents the common decorators (annotations) used in NestJS-style backend development within the Quan ERP system. Most of these are imported from `@quan-erp/shared-backend-core`.

For database-specific annotations (TypeORM and AI metadata), please refer to the **[Entity Annotations Reference](./entity-annotation.md)** guide.

> [!IMPORTANT]
> **Constructor annotations are NOT supported** in the Quan ERP backend framework. All injection decorators (e.g., `@Inject`, `@InjectDatabaseSource`, `@InjectBuiltinLogger`) MUST be applied to class properties. Using these decorators within a constructor will result in injection failures.

## Service Setup

### `@Service()`
Marks a class as a service that can be injected into other components.

```typescript
@Service()
export class MyService { ... }
```

### `@InjectLogger(LoggerClass)`
Injects a logger instance into a service.

```typescript
@InjectLogger(BuiltinLogger)
logger: BuiltinLogger;
```

### `@InjectBuiltinLogger()`
Injects the system's standard builtin logger into a service or controller. This is shorthand for `@InjectLogger(BuiltinLogger)`.

```typescript
import { InjectBuiltinLogger } from "@quan-erp/shared-backend-core";
import type { Loggable } from "@quan-erp/shared-backend-core";

@InjectBuiltinLogger()
logger: Loggable;
```

### `@CacheClient(plugin: string, name: string)`
Injects an instance of the `ICache` client. 

- **`plugin`**: The owner plugin of the cache (usually `CacheManager.DEFAULT_PLUGIN`).
- **`name`**: The client identifier (usually `'publisher'`).

```typescript
import { CacheClient, CacheManager } from "@quan-erp/shared-backend-core";
import type { ICache } from "@quan-erp/shared-backend-core";

@CacheClient(CacheManager.DEFAULT_PLUGIN, 'publisher')
private cache: ICache;
```

### `@Bean()`
Marks a method within a service as a factory that provides a singleton instance of a class. This allows you to register 3rd-party libraries (like BullMQ or Redis) into the dependency injection container.

```typescript
@Bean()
private registerQueue() {
    return new Queue("my-queue", { connection: redisOptions });
}
```

### `@InjectEnv()`
Injects the **plugin-scoped** `Env` for the current plugin (not `process.env`, and not another plugin’s env).

> [!IMPORTANT]
> **Env isolation:** Keys are partitioned by plugin name. Plugin A cannot read Plugin B’s (or `builtin` / base) env via `@InjectEnv()`. If a service calls `this.env.get("SOME_KEY")`, that key MUST be registered on **this** plugin — typically in the root module `@OnInit` with `this.env.set(...)` when missing, then `await this.env.sync()`.

```typescript
import { InjectEnv, Service } from "@quan-erp/shared-backend-core";
import type { Env } from "@quan-erp/shared-backend-core";

@Service()
export class MyService {
    @InjectEnv()
    env: Env;

    getBucket() {
        return this.env.get("S3_BUCKET"); // only this plugin's S3_BUCKET
    }
}
```

> `Env` is an **interface** — use `import type { Env }` (required for SWC). See [Import type](../import-type.md).

Cross-plugin **beans** (e.g. `@Inject(S3Client, "storage")`) can still be injected from another plugin scope; only the **Env bag** is isolated.

### `@InjectDatabaseSource(sourceName: string)`
Injects a TypeORM `DataSource` into a service. 

- **Type**: The injected object is of type `DataSource` from the `typeorm` package.
- **Source Names**: 
    - `DataSourceManager.DEFAULT_PLUGIN`: Refers to the primary datasource created during platform startup.
    - **String (Plugin Name)**: Passing a string matching another plugin's name will inject the datasource associated with that specific plugin.

```typescript
import { DataSource } from "typeorm";
import { InjectDatabaseSource, DataSourceManager } from "@quan-erp/shared-backend-core";

// Injects the primary platform datasource
@InjectDatabaseSource(DataSourceManager.DEFAULT_PLUGIN)
source: DataSource;

// Injects a datasource from another plugin (e.g. "my-plugin")
@InjectDatabaseSource("my-plugin")
myPluginSource: DataSource;
```

## Module Configuration

### `@Module(metadata: ModuleMetadata)`
The decorator used to define a plugin's backend module. It registers providers (services), controllers, and database entities.

```typescript
@Module({
    name: metadata.name,
    providers: [MyService],
    controllers: [MyController],
    entities: [{ plugin: 'default', entities: [MyEntity] }],
    websocket: [MyWebsocket], // Register WebSocket classes here
})
export class MyModule { }
```

### `@Cache(options: CacheOptions)`
Enables and configures a dedicated caching service for the module. This decorator **MUST** be applied to the root module class (decorated with `@Module`). Each plugin can maintain its own independent cache connection.

> [!IMPORTANT]
> `@Cache` will not work if applied to services or controllers. It is strictly a module-level configuration.

#### Cache Options

```typescript
export type CacheOptions = RedisCacheOption | InMemoryCacheOptions;

export interface InMemoryCacheOptions {
    type: 'in-memory';
    checkperiod: number; // Interval in ms to check for expired entries
    ttl?: number;        // Default time-to-live in seconds
}

export interface RedisCacheOption {
    type: 'redis';
    host: string;
    port?: number;
    password?: string;
    db?: number;
    clientType?: 'publisher' | 'subscriber';
    ttl?: number;
}
```

#### Usage Example

```typescript
@Module({ ... })
@Cache({
    type: 'in-memory',
    checkperiod: 1000,
})
export class MyModule { ... }
```

### `@OnInit()`
Marks a method within a module or service to be executed once the system has fully initialized the component.

```typescript
@OnInit()
init() {
    this.logger.info("Module initialized!");
}
```

### `@OnAllModuleLoaded()`
Marks a method to be executed once ALL modules in the system have finished their `@OnInit` stage. Use this for operations that require cross-module dependencies to be fully ready.

```typescript
@OnAllModuleLoaded()
private allModuleLoaded() {
    this.initializeWorker(); // Safe to start background workers
}
```

### `@OnUninstall()`
Marks a method to be executed when the plugin is being uninstalled or removed from the system. Use this to perform cleanup (e.g., disconnecting from Redis, stopping workers).

```typescript
@OnUninstall()
private async cleanup() {
    await this.worker.disconnect();
}
```

## WebSocket Setup

### `@Websocket(options: WebsocketOptions)`
Defines a class as a WebSocket handler. It must implement the `IWebsocket` interface.

- **`path`**: The URL path for the WebSocket connection.
- **`ssl`**: Whether to use SSL.
- **`pingpongInterval`**: Interval in ms for health checks.

### `@InjectWebsocketServer(path: string)`
Injects the `WebsocketServer` instance for a specific path, allowing you to broadcast messages or manage connections.

#### Usage Example

```typescript
import { 
    Websocket, IWebsocket, WebsocketServer, InjectWebsocketServer, 
    WebsocketClient, WebsocketEvents, WebsocketMessageHandler 
} from "@quan-erp/shared-backend-core";

@Websocket({
    ssl: false,
    pingpongInterval: 1000,
    path: '/my-websocket',
})
export class MyWebsocket implements IWebsocket {
    @InjectWebsocketServer('/my-websocket')
    websocket: WebsocketServer;

    on(event: WebsocketEvents, client: WebsocketClient, data: any, isBinary: boolean): void {
        // Handle incoming messages
        new WebsocketMessageHandler(event, data, isBinary)
            .onTextEvent('my-room', (payload) => {
                // Logic for specific event
            })
            .execute();
        
        // Send message to current client
        client.getWebsocket().send("Hello from server");
    }

    onAuthenticate(ws: any, req: any) {
        // Return ClientInfo or null to reject
        return { id: 'user-id' };
    }

    onDestoryed() { }
    onUpgrade(ws: any, req: any) { }
}
```

## Controller Setup

### `@Controller(path: string)`
Defines a class as a controller and sets the base route path for all endpoints within it.

> [!IMPORTANT]
> **Never** put `metadata.name` (or a hard-coded plugin name) in `@Controller(...)`.
> The core framework **automatically** mounts every controller under `/{metadata.name}` from `module.metadata.json`. The decorator argument is the **resource path only**.
>
> | | Backend | Frontend (full URL) |
> |---|---|---|
> | Correct | `@Controller("/item")` | `/my-plugin/item` |
> | Wrong | `@Controller(\`/${metadata.name}/item\`)` | doubles to `/my-plugin/my-plugin/item` |
> | Wrong | `@Controller("/my-plugin/item")` | same double-prefix problem |
>
> ```typescript
> // BAD — never do this
> @Controller(`/${metadata.name}/item`)
> @Controller("/my-plugin/item")
>
> // GOOD — framework adds /my-plugin → clients call /my-plugin/item
> @Controller("/item")
> export class MyController { ... }
> ```
>
> Frontend `withApiMetadataFetchFn` / axios paths **do** include the plugin prefix (`/${metadata.name}/item`) so they match the full mounted URL. See [Call Backend API](../frontend/call-backend-api.md).

```typescript
@Controller("/item")
export class MyController { ... }
```

### `@Inject(service: any, plugin?: string)`
Injects a service dependency. By default, it looks for the service within the current plugin. To inject a service from another plugin (Cross-Plugin Injection), provide the target plugin's name as the second argument.

```typescript
// Injects a service from the current plugin
@Inject(MyService)
service: MyService;

// Injects a service from another plugin (e.g. "other-plugin")
@Inject(MyOtherService, "other-plugin")
otherService: MyOtherService;
```

#### Circular service injection (ESM TDZ)

`@quan-erp/shared-backend-core` uses ESM + `emitDecoratorMetadata`. If **Service A** and **Service B** both top-level `import` each other and use `@Inject(OtherService)`, Node can crash at startup:

```text
ReferenceError: Cannot access 'SomeService' before initialization
```

The DI resolver already supports a **lazy class ref**: `@Inject(() => SomeService)` (see `app-helper` — non-class values are called). That alone is **not enough** if the property type is still the class, because TypeScript emits:

**Required pattern for mutual service injection:**

```typescript
import { Inject, Service } from "@quan-erp/shared-backend-core";
import { MyOtherService } from "../other/my-other.service.js";

@Service()
export class MyService {
  // Lazy resolve + InstanceType so design:type is void 0 / Object (not the class)
  @Inject(() => MyOtherService)
  otherService: InstanceType<typeof MyOtherService>;
}
```

And on the other side:

```typescript
@Inject(() => MyService)
myService: InstanceType<typeof MyService>;
```

| Do | Don't |
|---|---|
| `@Inject(() => OtherService)` | `@Inject(OtherService)` when A↔B import each other |
| `prop: InstanceType<typeof OtherService>` | `prop: OtherService` (emits `design:type` class → TDZ) |
| Prefer breaking the cycle (one side queries entity / moves call up) when possible | Import package root `@quan-erp/shared-backend-core` from inside `shared-backend-core` itself (re-enters full barrels) |

Canonical example: `MyService` ↔ `MyOtherService`.

## Route Decorators

These decorators define the HTTP method and path for an endpoint. 

> [!IMPORTANT]
> The `path` argument in these decorators **MUST** always start with a leading slash (e.g., `@Get("/path")` instead of `@Get("path")`).

- `@Get(path: string)`
- `@Post(path: string)`
- `@Put(path: string)`
- `@Delete(path: string)`

```typescript
@Get("/:id")
async getOne(@Param("id") id: number) { ... }
```

## Middleware & Security

### `@AuthenticatedUserOnly()`
Ensures that the endpoint can only be accessed by an authenticated user. For admin APIs, this is typically used in combination with `@CheckAPIPermission()`.

### `@CheckAPIPermission()`
Requires that the API endpoint restricts access based on the user's role and permission settings. This middleware is imported from `@quan-erp/shared-backend-core`. It should be applied alongside `@AuthenticatedUserOnly()` for all admin pages and APIs to ensure proper authorization enforcement.

### `@Middleware(...handlers: MiddlewareHandler[])`
Attaches one or more custom middleware handlers to a class or method. For detailed instructions on creating custom middleware, refer to the **[How to Create Middleware](./how-to-create-middleware.md)** guide.

### `@AuditLogMiddleware(action: string | ((req: ExpressRequest) => string))`
Automatically logs the action to the audit trail. It can take a static string or a callback function that returns a string.

```typescript
// Static string
@AuditLogMiddleware('View all items')

// Dynamic callback
@AuthenticatedUserOnly()
@AuditLogMiddleware((req) => `Create new item: ${req.body.payload.name}`)
```

## API Documentation

### `@APIInfo(metadata: APIInfoOptions)`
Provides comprehensive metadata for the API, used for documentation and system integration.

| Property | Type | Description |
| :--- | :--- | :--- |
| `shortDescription` | `string` | Brief title of the endpoint. |
| `description` | `string` | Detailed explanation of the endpoint's purpose. |
| `isPublic` | `boolean` | If true, the endpoint is accessible without a token. |
| `contentType` | `string` | MIME type of the response (e.g., `JsonContentType`). |
| `requestDto` | `object` | Schema definition for the request payload. |
| `responseDto` | `any` | The expected Response DTO class. |
| `queryParams` | `object` | Map of query parameters and their types. |
| `pathParams` | `object` | Map of path parameters (e.g., `:id`). |
| `headers` | `object` | Required headers (e.g., `JWTAuthorizationHeader`). |

```typescript
@APIInfo({
    shortDescription: 'Get all items',
    contentType: JsonContentType,
    responseDto: ResponseDto,
    queryParams: SkipLimitQueryParam,
    headers: JWTAuthorizationHeader,
})
```

## Workflow Integration

### `@WorkflowEntry(options: WorkflowOptions)`
Defines an API endpoint as an entry point for a system workflow, allowing it to be discovered and triggered by the workflow engine.

```typescript
@WorkflowEntry({
    name: "get-item",
    description: "get all items",
    returnType: {
        type: 'object',
        properties: {
            payload: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                    }
                }
            }
        }
    }
})
```

## Route-Level Caching

These annotations manage high-performance caching for specific endpoints.

### `@CacheRoute(options: CacheRouteOptions)`
Caches the response of an endpoint based on a generated key.

| Property | Type | Description |
| :--- | :--- | :--- |
| `key` | `string \| callback` | The cache key or a function taking `req` and returning a key. |
| `plugin` | `string` | The plugin owner of the cache (usually 'default'). |
| `name` | `string` | The cache client identifier (e.g., 'publisher'). |

```typescript
@CacheRoute({
    key: (req) => `my-item-${req.query.skip}-${req.query.limit}`,
    plugin: 'default',
    name: 'publisher'
})
```

### `@DeleteCacheRoute(options: CacheRouteOptions)`
Invalidates specific cache keys, typically used after POST, PUT, or DELETE operations to ensure data consistency.

| Property | Type | Description |
| :--- | :--- | :--- |
| `key` | `string \| callback` | The cache key string (trailing `*` wildcards only) or a function returning an **array of strings** (`string[]`). |
| `plugin` | `string` | The plugin owner of the cache (usually 'default'). |
| `name` | `string` | The cache client identifier (e.g., 'publisher'). |

```typescript
import { Request as ExpressRequest } from 'express'
@DeleteCacheRoute({
    key: (req: ExpressRequest) => [`my-item-${(req as any).user.payload.id}`], // Must return an array
    plugin: 'default',
    name: 'publisher'
})
```

## Method-Level Caching

These annotations are used within services to cache and invalidate raw data or complex calculation results.

### Cache key conventions

1. **Define shared key constants** in your plugin (e.g. `src/utilities/cache-keys.ts`) instead of scattering string prefixes:
   ```typescript
   export const MY_CACHE_KEYS = buildCacheKeys({
     ITEM_LIST: "my-item-list",
     ITEM_DETAIL: "my-item",
   });
   ```
2. **Add new keys** to that `buildCacheKeys({...})` object — do not hardcode prefixes at call sites.
3. **Wildcard rule:** only a **trailing** `*` is supported (e.g. `` `${MY_CACHE_KEYS.ITEM_DETAIL}-${itemId}*` ``).  
   `*` in the **middle** (e.g. `` `${MY_CACHE_KEYS.ITEM_DETAIL}-*-${userId}` ``) is **not** supported.
4. **Key segment order for invalidation:** put the dimension you delete by **before** per-request suffixes.  
   Example: cache as `` `${MY_CACHE_KEYS.ITEM_DETAIL}-${itemId}-${branchId}` `` so remove can clear `` `${MY_CACHE_KEYS.ITEM_DETAIL}-${itemId}*` `` for all branches.

### `@CacheFn(options: CacheFnOptions)`
Caches the result of a service method.

| Property | Type | Description |
| :--- | :--- | :--- |
| `key` | `callback` | A function that takes method arguments and returns a cache key string. |
| `plugin` | `string` | The plugin owner of the cache. |
| `name` | `string` | The cache client identifier. |
| `ttl` | `number` | Optional TTL in milliseconds. |

```typescript
import { MY_CACHE_KEYS } from "../utilities/cache-keys.js";

@CacheFn({
    plugin: 'default',
    name: 'publisher',
    key: (itemId: number, branchId: number) =>
        `${MY_CACHE_KEYS.ITEM_DETAIL}-${itemId}-${branchId}`,
    ttl: 60 * 60 * 24 * 30,
})
async getItemDetail(itemId: number, branchId: number) { ... }
```

### `@DeleteCacheFn(options: DeleteCacheOptions)`
Invalidates specific cache keys when the decorated method is successfully executed. `key` must return a **`string[]`**.

```typescript
@DeleteCacheFn({
    plugin: 'default',
    name: 'publisher',
    // trailing * only — clear all branch entries for this item
    key: (itemId: number) => {
        return [`${MY_CACHE_KEYS.ITEM_DETAIL}-${itemId}*`]
    },
})
async removeItem(itemId: number) { ... }
```

## AI Integration

### `@AITool(options: AIToolOption)`
Marks a service method as a tool that can be discovered and executed by the AI assistant / MCP clients. **Tool names MUST be hyphen-based (kebab-case)**. For a deep dive (including `mcpAnnotations` conventions), see **[Adding AI Tools](./add-ai-tools.md)**. For LLM providers / `query`/`stream` / token usage / realtime, see **[AI Assistant SDK](./ai-sdk.md)**.

| Property | Type | Description |
| :--- | :--- | :--- |
| `requiredApiPermission` | `Permission[]` | Array of `{ method, url }` required to run this tool. |
| `argParser` | `callback` | Function to map AI-provided arguments to method parameters. |
| `mcpAnnotations` | `MCPAIToolAnnotations` (optional) | MCP hints: `readOnlyHint`, `openWorldHint`, `destructiveHint` (sibling of `toolDetail`, not inside it). |
| `toolDetail` | `object` | OpenAI-compatible function definition (name, description, parameters). |

```typescript
@AITool({
    requiredApiPermission: [{ method: 'get', url: '/my-plugin/item/' }],
    argParser: (args) => [args.itemId],
    mcpAnnotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
    },
    toolDetail: {
        type: 'function',
        function: {
            name: "get-item",
            description: "Get an item by id",
            parameters: { ... }
        }
    }
})
async getItem(itemId: number) { ... }
```

## Parameter Injection

These decorators are used to inject data from the request into the method arguments.

### `@Param(name: string)`
Injects a URL path parameter.

### `@Query(name: string)`
Injects a URL query parameter.

### `@Body()`
Injects the request body. In Quan ERP, bodies are typically wrapped in a `RequestDto`.

### `@User()`
Injects the currently authenticated user information.

```typescript
import type { RequestedUser } from "@quan-erp/shared-backend-core";

async update(
    @Param("id") id: number, 
    @Body() body: RequestDto<UpdateMyItemDto>, 
    @User() user: RequestedUser
) { ... }
```

## Types & DTOs

Every request and response in Quan ERP must be wrapped in a standardized DTO.

For detailed usage, methods, and examples, refer to the:
- **[Request & Response DTOs Reference](./request-response-dto.md)**
- **[Entity Annotations Reference](./entity-annotation.md)**
