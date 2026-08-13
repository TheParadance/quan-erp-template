# How Plugins Work

Quan ERP is designed as a highly modular platform where almost all features are delivered as independent plugins. This document explains the lifecycle and integration patterns that allow these plugins to work together seamlessly.

## 1. Plugin Discovery & Metadata

The system discovers plugins by scanning the `plugins/` directory. Each plugin MUST contain a `module.metadata.json` file. 

- **Dependency Resolution**: The platform reads the `pluginDependencies` to determine the correct loading sequence. Plugins with no dependencies load first, followed by those that depend on them.
- **Identity**: The `name` in the metadata serves as the unique namespace for the plugin's backend routes and frontend configuration.

(See [Module Metadata](./backend/module.metadata.md))

## 2. Backend Initialization Lifecycle

When the backend server starts, it initializes plugins in the order determined by their dependencies:

1.  **Module Loading**: The system loads the class specified by `@Module` in the plugin's backend source.
2.  **Dependency Injection**: Services (Providers) are instantiated and injected into Controllers and other Services.
3.  **Database Sync**: Entities defined in the module's `entities` array are synchronized with the database.
4.  **Lifecycle Hooks**: Once the module and its dependencies are ready, any method decorated with `@OnInit` is executed.

(See [Plugin Root Module](./backend/plugin-root-module.md) and [Backend Annotations](./backend/annotations.md))

## 3. Frontend Integration & Registration

The frontend follows a distinct registration pattern that allows the base application to remain decoupled from the plugins:

1.  **Remote Loading**: The base application dynamically loads the plugin's entry point (`index.tsx`).
2.  **The `register` Call**: The base app calls the `register(AppRegistry)` method exported by the plugin.
3.  **Injection**: During registration, the plugin "tells" the base app what it provides:
    - **Routes**: New URLs and the components that handle them.
    - **Menus**: Links to be added to the primary navigation.
    - **Shortcuts**: Dashboard icons.
    - **Extension Points**: Injecting tabs or components into other plugins via `PluginAPI`.

(See [Frontend Routing](./frontend/routing.md) and [UI Library](./frontend/ui-library.md))

## 4. Communication Patterns

### Shared Libraries
Plugins do not implement core ERP logic. instead, they use shared libraries:
- **`@quan-erp/shared-backend-core`**: Decorators, DTOs, and base services.
- **`@quan-erp/shared-frontend-core`**: Hooks, API helpers, and state management.
- **`@quan-erp/shared-ui`**: The standardized design system and UI components.
- **`@quan-erp/shared-types`**: Shared TypeScript interfaces, types, and constants used across all packages.

> [!IMPORTANT]
> **Versioning Rule**: All `@quan-erp/*` packages within a plugin AND the base application images in `docker-compose.yaml` (e.g., `base-backend`, `base-frontend`) MUST use the same version number (e.g., `^1.0.0-beta.46` and `...:1.0.0-beta.46`) to ensure cross-platform compatibility and prevent dependency conflicts between plugins and the core system.

### Inter-Plugin Communication
If Plugin A needs to interact with Plugin B:
- **Backend**: Plugin A can list Plugin B as a dependency and use its exported services or API endpoints.
- **Frontend**: Plugin A can use `PluginAPI` to inject content into "slots" provided by Plugin B (e.g., adding a "Stock" tab to a "Product" detail page).

## Summary of Best Practices
- **Namespace Everything**: Use the plugin name as a prefix for database tables, API routes, and frontend paths.
- **Stay Lean**: Only include logic specific to your plugin; offload common tasks to shared libraries.
- **Lazy Load**: Ensure large frontend components are only loaded when their routes are accessed.
