# Plugin Development Folder Structure

This document provides a high-level overview of how plugins are structured within the Quan ERP workspace.

## Workspace Overview

The project is divided into the core application (`base/`) and individual modules (`plugins/`). Every plugin directory under `plugins/` must follow the same internal structure.

```text
base/
├── available-plugins
├── backend/
│   └── installed-plugins
└── docker-compose.yaml
plugins/
├── accounting/
│   ├── frontend
│   ├── backend
│   └── module.metadata.json
├── food-menu/
│   ├── frontend
│   ├── backend
│   └── module.metadata.json
├── fleet-management/
│   ├── frontend
│   ├── backend
│   └── module.metadata.json
└── inventory/
    ├── frontend
    ├── backend
    └── module.metadata.json
```

## Plugin Root Structure

Every plugin must follow this standard top-level layout:

### 1. `backend/`
Contains the server-side logic, database entities, and API endpoints. It is independently bundled and loaded by the base backend.
- **Detailed Reference**: [Backend Folder Structure](./backend/folder-structure.md)

### 2. `frontend/`
Contains the React components, state management, and page definitions. It is dynamically loaded by the base frontend application.
- **Detailed Reference**: [Frontend Folder Structure](./frontend/folder-structure.md)

### 3. `module.metadata.json`
The manifest file for the plugin. It is read by the **core backend** before any plugins are installed or initialized to determine the identity, version, and loading order based on dependencies.
- **Detailed Reference**: [Module Metadata](./backend/module.metadata.md)

## Key Principles
- **No Cross-Plugin Direct Imports**: Plugins should never import files directly from the `src/` directory of another plugin. Use exported types or services instead.
- **Uniform Sub-structures**: While each plugin is independent, the internal layout of `backend/` and `frontend/` MUST strictly follow the established patterns to ensure maintainability by the AI agent.