# Frontend Folder Structure

This document describes the standard folder structure for the frontend of a Quan ERP plugin.

## Directory Layout

The frontend code is located in `plugins/<plugin-name>/frontend/`.

```text
frontend/
├── public/                # Static assets (images, icons, etc.)
├── src/
│   ├── components/        # Shared components within the plugin
│   ├── api/               # Backend API declarations and React Query hooks
│   │   ├── <domain>/
│   │   │   ├── <domain>.api.ts       # Raw API calls wrapped with metadata
│   │   │   ├── <domain>.queries.ts   # React Query GET hooks
│   │   │   ├── <domain>.mutations.ts # React Query write hooks
│   │   │   ├── <domain>.types.ts     # API payload and response types
│   │   │   └── <domain>.constants.ts # Query keys and API constants
│   ├── lib/               # Utilities, global state, and core client setup
│   │   ├── axios.ts       # Axios client instance (initialized on register)
│   │   ├── global-store.ts # Global registry access (initialized on register)
│   │   └── metadata.ts    # Plugin metadata helper (from module.metadata.json)
│   ├── workflow/          # Workflow node definitions for the plugin
│   ├── page/              # Feature modules containing UI and logic
│   │   ├── <feature-1>/
│   │   │   ├── components/     # Specialized sub-components
│   │   │   ├── <feature-1>.table.tsx   # Main entry component (e.g., a table)
│   │   │   ├── <feature-1>.page.tsx   # page
│   │   │   └── <feature-1>.types.ts    # UI-only TypeScript interfaces
│   │   └── index.tsx      # Main plugin registration (Routes, Menus)
│   ├── export.ts          # Exports for other plugins
│   ├── index.css          # Plugin styles
│   └── index.tsx          # Main entry and registration point
├── vite.config.ts         # Build configuration
├── tailwind.config.js     # Styling configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Description of Key Directories

### `public/`
Contains static assets that are served directly by the browser, such as icons, images, or configuration files that don't need to be bundled by Vite.

### `src/page/`
UI logic is organized by feature. Page folders should contain presentation components, page state, and UI-only types. Do not place backend API calls directly in page folders. An `index.tsx` file is often used as the entry point for a page module.

### `src/api/`
Backend communication is organized by domain. Each API-backed domain must follow the React Query API declaration standard:
- **`*.api.ts`**: Raw Axios calls wrapped with `withApiMetadataFetchFn` from `@quan-erp/shared-types`.
- **`*.queries.ts` / `*.mutations.ts`**: React Query hooks that consume API object `.fetchFn` methods.
- **`*.types.ts`**: Payload, response, and DTO types shared by API hooks and UI components.
- **`*.constants.ts`**: Query keys and API constants.

### `src/lib/`
Contains the "glue" that connects the plugin to the base application. These files are typically boilerplate and should be present in every plugin:
- **`axios.ts`**: Manages the local Axios instance. It is initialized during the plugin's `register` call with the client provided by the host application's `AppRegistry`.
- **`global-store.ts`**: Holds a reference to the `AppRegistryState`. This allows components and utilities inside the plugin to access global application state without prop-drilling.
- **`metadata.ts`**: A typed wrapper for the `module.metadata.json` file, allowing easy access to plugin version, name, and dependencies within the code.

### `src/index.tsx`
This is the most important file in the frontend. It uses the `register` method to inject:
- **Routes**: Mapping URLs to page components.
- **Menu Items**: Adding links to the sidebar.
- **Home Shortcuts**: Adding icons to the dashboard.
- (See [Frontend Routing](./routing.md) for details).

## Best Practices
1. **Separation of Concerns**: Don't put API logic directly inside UI components (`.tsx`). Use `src/api/<domain>` with `.api.ts`, `.queries.ts`, and `.mutations.ts`.
2. **Feature Encapsulation**: Keep page UI under `src/page/<feature>` and backend API access under `src/api/<domain>`.
3. **Consistent Naming**: Use kebab-case for directories and predictable suffixes (`.table.tsx`, `.api.ts`) for files.
