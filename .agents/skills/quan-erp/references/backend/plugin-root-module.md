# Plugin Root Module Reference

The Plugin Root Module is the core functional engine for a plugin's backend. It defines the metadata, services, controllers, and database entities that the platform will integrate.

## 1. Plugin Entry Point & Build Output

For a plugin to be loaded by the backend, it must have an entry point that exposes the root module.

### Entry Point (`backend/src/index.ts`)
The primary entry point for every backend plugin is `backend/src/index.ts`. This file must export a default class that implements the `IPlugin` interface.

To ensure correct implementation, you must import its supporting types from `@quan-erp/shared-types`:

```typescript
import type { 
    GetMigrationsType, 
    IAppInstance, 
    IPlugin, 
    PluginExposedFeature, 
    PluginMetadata 
} from "@quan-erp/shared-types";
import metadata from '../../module.metadata.json' with { type: 'json' };
import { MyPluginModule } from './feature/my.module.js';

export default class MyPlugin implements IPlugin {
    // Returns the @Module class
    getRootModule() {
        return MyPluginModule;
    }

    getName(): string {
        return metadata.name;
    }

    getVersion(): string {
        return metadata.pluginVersion;
    }

    getMetadata(): PluginMetadata {
        return metadata as PluginMetadata;
    }

    // Lifecycle hooks
    async onInstall(appInstance: IAppInstance): Promise<void> { }
    async onUninstall(): Promise<void> { }
    async onMigrate(): Promise<void> { }
    onReady(): void { }
    
    // Health & Compatibility checks
    isCompatible(baseVersion: number): boolean { return true; }
    isReady(): boolean { return true; }
    isHealthy(): boolean { return true; }

    // Errors
    onInstallError(err: any): void { }
    onUninstallError(err: any): void { }
}
```

### Build Artifact (`module.js`)
When the plugin is built (e.g., using `quan-erp watch`), the `index.ts` and its dependencies are compiled and bundled. The final output file is **`module.js`**, located in the plugin's distribution directory (`base/available-plugins/<plugin-name>/<version>/backend/` or `base/backend/installed-plugins/<plugin-name>/backend/`).

### Loading Process
1. **Dynamic Import**: On startup, the backend platform scans the `installed-plugins` directory and dynamically imports each plugin's `module.js`.
2. **Class Instantiation**: It instantiates the exported plugin class.
3. **Module Extraction**: It calls the `getRootModule()` method to retrieve the class decorated with `@Module`.
4. **Initialization**: The platform then proceeds to initialize the module's providers, controllers, and entities.

---

## 2. Module Structure

A plugin root module is a class decorated with `@Module`, typically located at `plugins/<plugin-name>/backend/src/feature/<plugin-name>.module.ts`.

### `@Module` Properties

- **`name`**: The unique name of the plugin, usually imported from `module.metadata.json`.
- **`providers`**: An array of service classes that will be instantiated as singletons and available for injection.
- **`controllers`**: An array of controller classes that define the plugin's API endpoints.
- **`entities`**: An array of database entities grouped by datasource. 
    - **`plugin: 'default'`**: Entities must be nested under a `plugin` key. Using `'default'` ensures these entities are merged into the system's primary datasource (the "default" datasource automatically created by the Quan ERP core). This mechanism allows the platform to support multiple datasources if needed.
- **`websocket`**: (Optional) An array of WebSocket handler classes decorated with `@Websocket`.

```typescript
@Module({
    name: metadata.name,
    providers: [
        WarehouseService,
        LocationService,
        // ...
    ],
    controllers: [
        WarehouseController,
        LocationController,
        // ...
    ],
    entities: [
        {
            plugin: "default",
            entities: [
                WarehouseEntity,
                LocationEntity,
                // ...
            ],
        },
    ],
    websocket: [
        ChatWebsocket,
    ],
})
export class PluginModule { }
```

## Extra Decorators

### `@Cache`
Configures caching behavior for the module.

- **`type`**: The type of cache (e.g., `"in-memory"`).
- **`checkperiod`**: The interval in milliseconds to check for expired entries.

```typescript
@Cache({
    type: "in-memory",
    checkperiod: 1000,
})
```

## Lifecycle Hooks

### `@OnInit`
Methods decorated with `@OnInit` are executed once the module has been fully initialized by the system.

```typescript
export class PluginModule {
    @OnInit()
    init() {
        console.log("Module initialized and ready.");
    }
}
```

## Example: Root Module Implementation

```typescript
import { Cache, Module, OnInit } from "@quan-erp/shared-backend-core";
import metadata from "../../../module.metadata.json" with { type: "json" };
import { MyController } from "./my.controller.js";
import { MyService } from "./my.service.js";
import { MyEntity } from "../schema/my.entity.js";

@Module({
    name: metadata.name,
    providers: [MyService],
    controllers: [MyController],
    entities: [
        {
            plugin: "default",
            entities: [MyEntity],
        },
    ],
})
@Cache({
    type: "in-memory",
    checkperiod: 1000,
})
export class MyPluginModule {
    @OnInit()
    init() {
        // Initialization logic here
    }
}
```
