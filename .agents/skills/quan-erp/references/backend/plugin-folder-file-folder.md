# Plugin File & Folder Management

In the Quan ERP ecosystem, plugins must manage their data and assets in specific locations to ensure persistence and security. The `@quan-erp/shared-backend-core` library provides the `AppFolder` utility to resolve these paths correctly.

## 1. Application Data Folders

### Global App Data Folder
The root directory for all persistent data managed by the system.
- **Path**: `process.env.APP_DATA_FOLDER`
- **Utility**: `AppFolder.getAppDataFolder()`

### Global Temp Folder
Used for storing temporary files, such as partial uploads before they are processed.
- **Path**: `process.env.UPLOAD_FILE_TEMP_FOLDER`
- **Utility**: `AppFolder.getAppTempDataFolder()`

---

## 2. Plugin-Specific Folders

### Plugin Data Folder
Every plugin should store its **runtime-generated data** (e.g., generated reports, exported CSVs, user uploads, localized runtime config) in its own subdirectory within the global data folder.
- **Path**: `<APP_DATA_FOLDER>/<pluginName>`
- **Utility**: `AppFolder.getPluginDataFolder(pluginName)`
- **Usage**: Always use this for storing any files generated or updated during the application **runtime**. This folder is persistent across restarts but is NOT part of the plugin's source bundle.

### Plugin Asset Folder
This folder contains **static assets bundled with the plugin source code** (e.g., document templates, seed JSON files, default icons).
- **Path**: `<INSTALLED_PLUGINS_FOLDER>/<pluginName>/<version>/backend/assets`
- **Utility**: `AppFolder.getPluginAssetFolder(pluginName, version)`
- **Usage**: Use this for **read-only assets** that are shipped with your plugin. These files are part of the plugin package and should not be modified at runtime.

---

## 3. Asset Storage & Build Process

To ensure assets are correctly bundled and available at runtime, they MUST be stored in the standard source location.

### Source Location
In your plugin's development directory, place all backend assets here:
`plugins/<plugin-name>/backend/assets/`

### Build & Bundling
When the plugin is built, the build system automatically packs **all files and subdirectories** within the `assets/` folder into the final plugin bundle. This ensures that any templates, configuration files, or static data required by your backend services are preserved and can be resolved using the `AppFolder` utility after installation.

---

## 4. Utility API Reference (`AppFolder`)

The following methods are available via `import { AppFolder } from "@quan-erp/shared-backend-core";`

| Method | Description |
| :--- | :--- |
| `getAppDataFolder()` | Returns the root application data directory. |
| `getAppTempDataFolder()` | Returns the directory for temporary file storage. |
| `getPluginDataFolder(pluginName)` | Returns the persistent data directory for a specific plugin. |
| `getPluginAssetFolder(pluginName, version)` | Returns the backend assets directory for a specific plugin version. |

## Best Practices

1. **Isolation**: Never write to the root `APP_DATA_FOLDER` directly. Always use your plugin's specific data folder.
2. **Persistence**: Do not store critical data in the temp folder, as it may be cleared by the system.
3. **Asset Resolution**: Use `getPluginAssetFolder` to load static files needed by your backend services, ensuring they are correctly located after deployment.
