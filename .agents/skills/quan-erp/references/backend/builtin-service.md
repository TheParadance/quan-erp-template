# Built-in Services Reference

This reference documents the core services available in `@quan-erp/shared-backend-core`. These services provide common functionality that you can reuse in your plugins via dependency injection.

---

## How to Inject Core Services

To use a built-in service in your plugin, use the `@Inject` decorator with the `"core"` identifier. This tells the system to resolve the service from the core module rather than your plugin's local container.

```typescript
import { Service, Inject } from "@quan-erp/shared-backend-core";
import { UserService, NotificationService } from "@quan-erp/shared-backend-core";

@Service()
export class MyPluginService {
    // Injecting core services
    @Inject(UserService, "core")
    private userService: UserService;

    @Inject(NotificationService, "core")
    private notificationService: NotificationService;

    async doSomething() {
        const user = await this.userService.findById("1");
        // ...
    }
}
```

---

## Core Business Services

### UserService
Handles user retrieval, authentication, and session management.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `findById(id: string)` | `id` | `Promise<UserResponsePayload>` | Retrieves a user by their ID. |
| `findByUsername(username: string)` | `username` | `Promise<UserEntity>` | Retrieves a user by their username. |
| `find(options: { skip, limit, search })` | `options` | `Promise<UserEntity[]>` | Paginated search for users. |
| `update(id: string, data: any)` | `id`, `data` | `Promise<any>` | Updates user information. |

### NotificationService
Used to send in-app and push notifications to users or roles.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `send(props: CreateNotificationDto)` | `props` | `Promise<void>` | Sends a notification to specific users or roles. |
| `get(props: ServiceProps)` | `props` | `Promise<Notification[]>` | Retrieves notifications for a user. |
| `markRead(props: ServiceProps)` | `props` | `Promise<void>` | Marks a specific notification as read. |

#### Example: Sending a Notification
```typescript
await this.notificationService.send({
    userIds: [1, 2], // Optional: target specific users
    // roleIds: [1], // Optional: target specific roles
    title: "Project Updated",
    body: "The project status has been changed to 'Completed'.",
    pluginName: "my-plugin",
    topic: "project-update"
});
```

### FileService
Manages file uploads, metadata, and storage (Local or S3).

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `addFile(options: FileOptions)` | `options` | `Promise<FileEntity>` | Saves a file to storage and creates a DB record. |
| `findFile(filename: string)` | `filename` | `Promise<FileEntity>` | Retrieves file metadata by filename. |
| `generatePreSignedUrl(file, expires, mime)` | `file`, `expires`, `mime` | `Promise<string>` | Generates a temporary S3 download link. |
| `deleteFile(id: number)` | `id` | `Promise<void>` | Removes a file from storage and the database. |

### SettingService
Manages user-specific and system-wide settings.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `get(key, option: { userId, isPublic })` | `key`, `option` | `Promise<SettingEntity>` | Retrieves a specific setting. |
| `set(param: ServiceProps)` | `param` | `Promise<void>` | Creates or updates a setting. |
| `getAll(userId: number)` | `userId` | `Promise<SettingEntity[]>` | Retrieves all settings for a user (including global). |

### BranchService
Manages company branches and locations.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getById(id: number)` | `id` | `Promise<BranchEntity>` | Retrieves a branch by ID. |
| `get(options: { skip, limit, search })` | `options` | `Promise<BranchDto[]>` | Paginated search for branches. |
| `create(params: CreateServiceProps)` | `params` | `Promise<void>` | Creates a new branch. |

### CurrencyService
Manages currencies and exchange rates.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getById(id: number)` | `id` | `Promise<CurrencyEntity>` | Retrieves a currency by ID. |
| `findBySymbol(symbol: string)` | `symbol` | `Promise<CurrencyEntity>` | Finds a currency by its symbol (e.g., "$"). |
| `get(skip, limit)` | `skip`, `limit` | `Promise<CurrencyEntity[]>` | List all currencies. |

### CurrencyExchangeService
Manages exchange rates and conversions between currencies.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `getRate(fromId, toId)` | `fromId`, `toId` | `Promise<CurrencyExchangeRateEnity>` | Retrieves the latest rate between two currencies. |
| `updateRate(fromId, toId, rate)` | `fromId`, `toId`, `rate` | `Promise<void>` | Updates a rate and its inverse. |
| `getLatestRates(fromId)` | `fromId` | `Promise<any[]>` | List latest rates for all currencies from a source. |

---

## Infrastructure Services

### DeveloperConfigService
Used to manage system-level configurations that are typically set by developers or administrators.

| Method | Parameters | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `get(pluginName, key, props?)` | `plugin`, `key` | `Promise<Config>` | Retrieves a developer configuration. |
| `set(pluginName, key, data, props?)` | `plugin`, `key`, `data` | `Promise<void>` | Sets a developer configuration value. |
