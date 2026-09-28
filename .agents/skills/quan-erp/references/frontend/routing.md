# Frontend Routing & Registration Reference

This document explains how a frontend plugin registers its routes, menus, dashboard items, and shortcuts into the Quan ERP core.

## 1. Plugin Entry Point

Every frontend plugin must export a `Plugin` object of type `PluginModule`. The `register` method is where all injection logic resides. It is crucial to initialize the shared Axios client and App Registry first.

```typescript
import type { AppRegistryState, PluginModule } from "@quan-erp/shared-types";
import { setAxiosClient } from "./lib/axios";
import { setAppRegistry } from "./lib/global-store";
import { metadata } from "./lib/metadata";

const Plugin: PluginModule = {
  register(AppRegistry: AppRegistryState) {
    // 1. Initialize core utilities
    const axiosClient = AppRegistry.getAxiosClient();
    setAxiosClient(axiosClient);
    setAppRegistry(AppRegistry);

    // 2. Register components (see sections below)
  }
};

export default Plugin;
```

## 2. Menu Injection

The sidebar and navigation menu are registered using `AppRegistry.menu.add()`. Use the `MenuTab` component to ensure consistent styling and localization.

```typescript
// metadata.name === "my-plugin"
AppRegistry.menu.add({
  name: (
    <MenuTab 
      icon={<IconParkMenuTabIcon icon={AllApplication} />} 
      labelKey='my-plugin' 
      fallbackLabel="My Plugin" 
    />
  ),
  pluginName: metadata.name,
  children: [
    {
      name: (
        <MenuTab 
          icon={<IconParkMenuTabIcon icon={List} />} 
          labelKey='items' 
          fallbackLabel="Items" 
        />
      ),
      path: `/${metadata.name}/items`,
      requiredApis: [
        { url: `/${metadata.name}/item`, method: 'GET' },
        // ...
      ]
    },
    // ...
  ]
});
```

### Key Principles:
- **`requiredApis`**: Crucial for Role-Based Access Control (RBAC). The menu item will only be visible if the user has permission for these APIs.
- **Hierarchical Structure**: Use `children` for nested navigation.

## 3. Route Injection

Routes are registered using `AppRegistry.route.add()` for standard layout pages and `AppRegistry.rootRoute.add()` for pages that require a custom or blank layout (e.g., public shells, full-screen boards).

### Standard Routes
```typescript
AppRegistry.route.add({
  path: `/${metadata.name}/items`,
  element: <ProtectedMyItemPage />,
});
```

### Root Routes (No Layout)
```typescript
AppRegistry.rootRoute.add({
  path: `/${metadata.name}/board`,
  element: <MyBoardPage />
});

// Dynamic root route
AppRegistry.rootRoute.add({
  path: `/${metadata.name}/:id`,
  element: <MyPublicDetailPage />
});
```

For public customer portals with multiple nested paths (`login`, `register`, `home`), register a single shell route (`/${metadata.name}/*`) and nest `react-router-dom` routes inside it. Lazy-load each nested page with `React.lazy` + `Suspense` — see [Public Page Authentication](./public-page-authentication.md) (section 6).

## 4. Dashboard Registration

Plugins can contribute widgets to the main dashboard using `AppRegistry.dashboard.add()`.

```typescript
import { DashboardItem } from "@quan-erp/shared-ui";

AppRegistry.dashboard.add({
  id: `${metadata.name}-summary-widget`,
  pluginName: metadata.name,
  element: (
    <DashboardItem
      id={`${metadata.name}-summary-widget`}
      colSpan={2}
      rowSpan={1}
      pluginName={metadata.name}
    >
      <MySummaryChart />
    </DashboardItem>
  ),
});
```

> [!IMPORTANT]
> Always inline `DashboardItem` in `index.tsx` at registration. Do **not** put `DashboardItem` inside the widget component file. See [Adding Dashboard Widget](./adding-dashboard-widget.md).

## 5. Home Screen Shortcuts

Shortcuts allow users to quickly access specific features from the home screen.

```typescript
import { ShortcutItem, useHomeShortcutStore } from "@quan-erp/base-frontend";
import { List } from "lucide-react";

useHomeShortcutStore().getState().add({
  pluginName: metadata.name,
  id: `${metadata.name}/items`, // Must be unique
  component: (
    <ShortcutItem>
      <List size={25} />
    </ShortcutItem>
  ),
  displayName: 'Items',
  toLink: `${metadata.name}/items`,
  onClick() { 
    // Optional custom logic
  }
});
```

## Best Practices

1. **Namespace Prefixing**: Always prefix paths with `/${metadata.name}` to avoid collisions.
2. **Path Consistency**: Ensure the `path` in `AppRegistry.menu` matches the `path` in `AppRegistry.route`.
3. **Protection**: Wrap sensitive components in `Protected...` wrappers if they require specific checks.
4. **Localization**: Never hardcode strings in the UI. Use `labelKey` and `fallbackLabel` in `MenuTab`.
