# Backend Assets Management

Some plugins require static assets such as images, icons, or binary files to execute. The Quan ERP system provides a standardized way to bundle and retrieve these assets safely.

## Assets Directory

Put all backend-specific asset files under the plugin's `backend/assets` folder.

**Example Structure:**
```text
plugins/
  loan/
    backend/
      assets/
        sample-document.pdf
        icon.png
      src/
        ...
```

When the plugin is built, everything inside this `assets` folder is automatically bundled into the `installed-plugins` container.

## Container Folder

Upon installation, Quan ERP creates a dedicated container folder for each version of every plugin. All bundled assets are placed inside this container to ensure version isolation.

## Retrieving Paths at Runtime

The `AppFolder` utility from `@quan-erp/shared-backend-core` provides standardized access to various system folders.

**Import:**
```typescript
import { AppFolder } from "@quan-erp/shared-backend-core";
import metadata from "../../../module.metadata.json" with { type: "json" };
```

### 1. Bundled Assets Folder
Retrieves the absolute path to the plugin's bundled `assets` folder. This is for files that were included in the plugin package at build time.

```typescript
const assetFolder = AppFolder.getPluginAssetFolder(metadata.name, metadata.pluginVersion);
```

### 2. Plugin Data Folder
Retrieves a dedicated directory for the plugin to store **persistent runtime data** (like local SQLite databases, configuration files, or logs). Unlike the asset folder, this directory is not overwritten during plugin updates.

```typescript
const dataFolder = AppFolder.getPluginDataFolder(metadata.name);
```

### 3. Application Folders
Utilities to access shared system-wide directories.

- **Main Data Folder**: `AppFolder.getAppDataFolder()`
- **Temporary Data Folder**: `AppFolder.getAppTempDataFolder()`

## Comparison: Assets vs. Data Folder

| Feature | Asset Folder | Data Folder |
| :--- | :--- | :--- |
| **Purpose** | Static files bundled with the code. | Dynamic files created at runtime. |
| **Persistence** | Immutable (overwritten on update). | Persistent across plugin updates. |
| **Path Utility** | `getPluginAssetFolder(name, version)` | `getPluginDataFolder(name)` |

## Why this is required:
1. **Version Isolation**: Ensures that different versions of the same plugin do not overwrite each other's assets.
2. **Environment Portability**: Abstracting the path retrieval through `AppFolder` ensures your plugin works correctly across different server environments (Dev, Staging, Production).
3. **Automated Bundling**: Simplifies the deployment process by automatically managing the asset lifecycle during plugin installation and uninstallation.
