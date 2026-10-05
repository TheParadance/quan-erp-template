# Exporting Services for Cross-Plugin Use

This guide explains how to export services, controllers, and other classes from your plugin so they can be consumed and injected by other plugins in the Quan ERP ecosystem.

## Overview

The Quan ERP modular architecture allows plugins to depend on each other. To make a plugin's functionality available to others, you must:
1.  **Register exports** in a dedicated entry point.
2.  **Build** the export bundle.
3.  **Publish** the package to the internal NPM registry under the scope `@quan-erp-plugins/`.

---

## 1. Registering Exports (`backend/src/export.ts`)

Create or update the `backend/src/export.ts` file in your plugin. This file serves as the public API definition for your plugin. Anything exported here will be available to other plugins.

Re-export **types** with `export type { … }`, not `export *` from `*.types.ts` — value re-exports break SWC consumers. See [Import type](../import-type.md) (Plugin-local types / `export.ts`).

```typescript
// Example: plugins/my-plugin/backend/src/export.ts

export * from './feature/item/item.service.js';
export * from './feature/item/item.controller.js';
export * from './schema/my-item.entity.js';
export type { ItemDto } from './feature/item/item.types.js';
```

---

## 2. Building and Publishing

The plugin's `package.json` contains the necessary scripts for bundling and releasing the library.

### Step 2a: Build for Export
Run the following command to compile `export.ts` and its dependencies. This command uses Rollup in `export` mode to generate a bundle in the `dist/` directory.

```bash
npm run build:export
```

### Step 2b: Publish to Registry
Once built, publish the package to the internal/self-hosted NPM registry. Using the `beta` tag is common during development.

```bash
npm run release:beta
```

---

## 3. Consuming an Exported Service

To use a service from another plugin (e.g., using `MyItemService` from `my-plugin` in your plugin):

### A. Install the Dependency
Add the published plugin package to your plugin's `backend/package.json`.

> [!IMPORTANT]
> **AI Agent Role**: If you are an AI agent tasked with using services from another plugin, you MUST install the corresponding package `@quan-erp-plugins/<plugin-name>-backend` in the consumer plugin's `backend` directory. If only the backend services are needed, you only need to install the backend package.

```bash
npm install @quan-erp-plugins/my-plugin-backend
```

### B. Inject the Service
Use the `@Inject` decorator with the target plugin's name as the second argument. This informs the dependency injection system to look outside the current module's scope.

```typescript
import { Service, Inject } from "@quan-erp/shared-backend-core";
import { MyItemService } from "@quan-erp-plugins/my-plugin-backend";

@Service()
export class MyService {
    @Inject(MyItemService, "my-plugin")
    myItemService: MyItemService;

    async doSomething() {
        const items = await this.myItemService.list();
        // ...
    }
}
```

> [!IMPORTANT]
> Always ensure the plugin name (the second argument to `@Inject`) matches the `name` property defined in the target plugin's `module.metadata.json`.

---

## Technical Summary

| File/Script | Purpose |
| :--- | :--- |
| `backend/src/export.ts` | Entry point for publicly available classes. |
| `npm run build:export` | Compiles the public API bundle into `dist/`. |
| `npm run release:beta` | Publishes the bundle to the NPM registry. |
| `@Inject(Service, "plugin")` | Injects the external service into your components. |
