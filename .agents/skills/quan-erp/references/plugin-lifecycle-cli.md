# Plugin Lifecycle & CLI Tool

This document explains the development workflow, the role of the `quan-erp` CLI, and how plugins move from source code to being active in the production environment.

**Command catalog, install, and agent rules:** [CLI](./cli.md) (`helper/cli`).

## 1. The `quan-erp` CLI

The `quan-erp` CLI is the primary orchestration tool for developers. It automates the building and packaging of plugins.

### Command: `watch`
```bash
quan-erp watch <plugin-folder-name>
```
- **Goal**: Continuously build and sync a plugin during development.
- **Workflow**:
    1. **Build Backend**: Compiles the plugin's backend source code (TypeScript) into the `dist/` folder.
    2. **Build Frontend**: Compiles the plugin's frontend source (Vite/Rollup) into the `dist/` folder.
    3. **Sync to Available**: Copies the built plugin assets into the `base/available-plugins/` directory, following the internal platform structure.

### Command: `build:dev:log`
```bash
quan-erp build:dev:log <plugin-folder-name>
```
- **Goal**: One-shot frontend + backend dev compile with **full** error logs for AI agents (no TUI, no artifact copy).
- Frontend runs `npm run build`; backend runs `npm run build:dev`. Exit code `1` if either fails.

---

## 2. Folder Structure & Distribution

The system distinguishes between where code is developed, where it is available for installation, and where it is currently active.

### Source Code (`plugins/`)
Where the plugin source code resides (e.g., `plugins/inventory`, `plugins/accounting`).

### Available for Installation (`base/available-plugins/`)
When a plugin is built, its artifacts are packaged here:
```bash
base/available-plugins/
└── <plugin-name>/
    └── <version>/  (e.g., 1.0.0)
        ├── backend/
        ├── frontend/
        └── module.metadata.json
```

### Active Plugins (`base/backend/installed-plugins/`)
When a user "installs" a plugin through the ERP interface, the system moves it to the active directory:
```bash
base/backend/installed-plugins/
└── <plugin-name>/
    ├── backend/
    ├── frontend/
    └── module.metadata.json
```

---

## 3. Loading Mechanism

### Backend Initialization
1.  **Scanner**: On startup, the platform scans the `module` database table. It only loads plugins from `base/backend/installed-plugins/` if their `isInstalled` flag is set to `true`.
2.  **Module Load**: It dynamically imports the `backend/` entry point of each plugin.
3.  **Registration**: The platform reads the metadata and registers routes, services, and entities into the core application.

### Frontend Injection
1.  **Asset Serving**: The platform's web server serves the files from the `frontend/` directory of installed plugins.
2.  **Browser Injection**: When the user opens the ERP in the browser, the core application identifies installed plugins and dynamically loads their `module.js` (the exported `register` function).
3.  **UI Integration**: The plugin's UI components are then "injected" into the menus, routes, and extension points of the main app.

---

## Summary of Best Practices
- **Use the CLI**: Always build via `quan-erp watch` to ensure files are placed in the correct `base/` subdirectories.
- **Inspect compile errors**: Use `quan-erp build:dev:log <plugin-name>` (full logs, no TUI). Do not use `watch` to read TypeScript / Vite / Rollup errors.
- **Version Awareness**: Ensure the `version` in the plugin's source (e.g., `package.json`) matches what you expect in the distribution folder.
- **Clean Builds**: If a plugin isn't loading correctly, check if it exists in both `available-plugins` and `installed-plugins`.
