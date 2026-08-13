# Backend Folder Structure

This document describes the standard folder structure for the backend of a Quan ERP plugin.

## Directory Layout

The backend code is located in `plugins/<plugin-name>/backend/`.

```text
backend/
├── src/
│   ├── feature/           # Business logic grouped by feature
│   │   ├── <feature-1>/
│   │   │   ├── <feature-1>.controller.ts
│   │   │   ├── <feature-1>.service.ts
│   │   │   └── <feature-1>.dto.ts
│   │   └── inventory.module.ts # Root module for the plugin
│   ├── workflow/           # Workflow node definitions for the plugin
│   ├── schema/            # Database entities and schemas
│   │   ├── entity-1.entity.ts
│   │   └── enum/          # Shared enums for entities
│   ├── index.ts           # Entry point for the backend
│   └── export.ts          # External exports (e.g., for other plugins)
├── rollup.config.js       # Build configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Description of Directories

### `src/feature/`
This is where the main logic of the plugin resides. Each feature (e.g., `location`, `warehouse`, `stock`) should have its own subdirectory containing:
- **`.controller.ts`**: Handles HTTP requests and responses.
- **`.service.ts`**: Contains the business logic and database interactions.
- **`.dto.ts`**: Defines Data Transfer Objects for request validation and response typing.

The `inventory.module.ts` (or equivalent) in this directory is the root module that registers all controllers, services, and entities (see [Plugin Root Module](./plugin-root-module.md)).

### `src/schema/`
Contains TypeORM entities that define the database structure. All entity files should end with `.entity.ts`. Enums used across multiple entities or features should be placed in the `enum/` subdirectory.

### `src/index.ts` & `src/export.ts`
- `index.ts` is the main entry point for the plugin's backend.
- `export.ts` is used to expose types, services, or utilities that other plugins might need to import.

## Best Practices
1. **Feature isolation**: Keep all files related to a specific feature within its dedicated folder in `src/feature/`.
2. **Consistent naming**: Use kebab-case for filenames and suffixes like `.controller.ts`, `.service.ts`, etc.
3. **Avoid deep nesting**: Try to keep the hierarchy flat within `src/feature/` unless a feature is exceptionally complex.
