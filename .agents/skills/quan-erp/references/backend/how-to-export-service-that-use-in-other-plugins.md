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

```typescript
// Example: plugins/fleet-management/backend/src/export.ts

export * from './feature/driver/driver.service.js';
export * from './feature/driver/driver.controller.js';
export * from './schema/driver/driver.entity.js';
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

To use a service from another plugin (e.g., using `FleetDriverManagementService` from `fleet-management` in your plugin):

### A. Install the Dependency
Add the published plugin package to your plugin's `backend/package.json`.

> [!IMPORTANT]
> **AI Agent Role**: If you are an AI agent tasked with using services from another plugin, you MUST install the corresponding package `@quan-erp-plugins/<plugin-name>-backend` in the consumer plugin's `backend` directory. If only the backend services are needed, you only need to install the backend package.

```bash
npm install @quan-erp-plugins/fleet-management-backend
```

### B. Inject the Service
Use the `@Inject` decorator with the target plugin's name as the second argument. This informs the dependency injection system to look outside the current module's scope.

```typescript
import { Service, Inject } from "@quan-erp/shared-backend-core";
import { FleetDriverManagementService } from "@quan-erp-plugins/fleet-management-backend";

@Service()
export class MyService {
    @Inject(FleetDriverManagementService, "fleet-management")
    driverService: FleetDriverManagementService;

    async doSomething() {
        const drivers = await this.driverService.list();
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
