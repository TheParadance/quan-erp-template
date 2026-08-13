# Shared Types Reference (@quan-erp/shared-types)

The `@quan-erp/shared-types` package provides the fundamental type definitions used across both backend and frontend for plugin registration, metadata management, and system integration.

---

## Plugin Metadata & Environment

### `PluginType`
Defines the various types of plugins supported by the platform.

```typescript
export type MobilePluginType = 'mobile-frontend'
export type WebPluginType = 'web-frontend'
export type DesktopPluginType = 'desktop-frontend'
export type BackendPluginType = 'backend' | 'middleware' | 'datasource' | 'assets';

export type PluginType = MobilePluginType | WebPluginType | DesktopPluginType | BackendPluginType
```

### `PluginMetadata`
The structure of the `module.metadata.json` file.

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Unique internal name of the plugin. |
| `displayName` | `string` | (Optional) Human-readable name. |
| `pluginVersion` | `string` | Version of the plugin. |
| `type` | `PluginType` | Categorization (e.g., 'backend', 'web-frontend'). |
| `description` | `string` | Brief explanation of the plugin. |
| `moduleEntryObject` | `string` | The main entry point file/object. |
| `requiredBasedVersion`| `string` | Required core system version. |
| `pluginDependencies` | `Record<string, string>` | Map of required plugins and versions. |

---

## Backend Plugin Integration

### `IPlugin`
The interface that every backend plugin root class must implement.

```typescript
export interface IPlugin {
    getName(): string;
    getVersion(): string;
    getMetadata(): PluginMetadata;
    getMigrations(): GetMigrationsType;
    
    onInstall(appContext: IAppInstance): void;
    onUninstall(): Promise<void>;
    onReady(): void;
    
    isReady(): boolean;
    isHealthy(): boolean;
}
```

### `IDatabaseMigration`
Defines a database migration task for a plugin.

```typescript
export interface IDatabaseMigration {
    getName(): string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    getSource(): { plugin: string, name: string };
}
```

### `PluginExposedFeature`
Interface for features that one plugin exposes to others.

```typescript
export interface PluginExposedFeature {
    getApi<T>(name: string): T;
    info(): PluginMetadata;
}
```

### `IAppInstance`
The system context passed to plugins during installation. Use this to retrieve other plugins or data sources.

| Method | Description |
| :--- | :--- |
| `getPlugin(name)` | Retrieve a `PluginExposedFeature` from another plugin. |
| `getDataSource(plugin, name)` | Get a TypeORM `DataSource` for a specific plugin. |
| `checkIsInstalled(name)` | Check if a plugin is active. |

---

## Frontend & Registry

### `AppRegistryState`
The global state store maintained by `@quan-erp/shared-frontend-core`. Plugins interact with this via `AppRegistry`.

| Property | Description |
| :--- | :--- |
| `menu.add(menu)` | Register a side menu item. |
| `route.add(route)` | Register a page route. |
| `rootRoute.add(route)` | Register a root-level route (outside main layout). |
| `setting.add(setting)` | Register a component for the global settings page. |
| `dashboard.add(item)` | Register a dashboard widget. |
| `report.add(report)` | Register a report page. |

### Component Registration Types
Specific types used when adding items to `AppRegistry`.

```typescript
export type SettingComponents = {
    pluginName: string,
    element: ReactElement
}

export type DashboardItems = {
    id: string,
    pluginName: string,
    element: ReactElement,
}

export type Report = {
    pluginName: string,
    page: ReactElement,
}
```

### Menu & Routes
Types for UI navigation and routing.

```typescript
export type SingleMenu = {
    name: Component,
    path: string,
    pluginName?: string,
    requiredApis?: ApiPermission | ApiPermission[],
}

export type Menu = SingleMenu | GroupMenu

export type Route = {
    path: string,
    element: ReactElement,
    description?: string,
}
```

---

## Utility Types

### `UserInfo`
Standardized structure for user session data.

| Property | Type |
| :--- | :--- |
| `id` | `number` |
| `username` | `string` |
| `roleId` | `number` |
| `accessToken` | `string` |
| `isOwner` | `boolean` |

### HTTP & Permissions
```typescript
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type ApiPermission = { method: HttpMethod, url: string };
```
