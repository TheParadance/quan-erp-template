# Adding Dashboard Widgets

This guide explains how to add and register widgets to the dashboard in the Quan ERP frontend.

## 1. Widget Registration (`DashboardItem` inline in `index.tsx`)

Dashboard widgets must be registered within the `register` method of your plugin's entry file (usually `index.tsx`). This method is part of the `PluginModule` interface, and the `AppRegistry` object passed to it is of type `AppRegistryState`. Both `PluginModule` and `AppRegistryState` are imported from `@quan-erp/shared-types`.

> [!IMPORTANT]
> **`DashboardItem` MUST be inlined in `index.tsx` at `AppRegistry.dashboard.add`.** Do **not** wrap widget content with `DashboardItem` inside the widget component file. Widget files export content only; the shell (`id`, `colSpan`, `rowSpan`, `pluginName`, `requiredApis`) belongs at registration.

```tsx
// frontend/src/index.tsx — plugin my-plugin
import type { AppRegistryState, PluginModule } from "@quan-erp/shared-types";
import { DashboardItem } from "@quan-erp/shared-ui";
import { MyDashboardWidget } from "./page/dashboard/my-dashboard-widget";
import { getMyItemApi } from "./api/item/item.api";
import metadata from "../module.metadata.json" with { type: "json" };
// metadata.name === "my-plugin"

const Plugin: PluginModule = {
    register(AppRegistry: AppRegistryState) {
        AppRegistry.dashboard.add({
            id: "my-plugin/my-dashboard-widget", // Must be unique across all plugins
            pluginName: metadata.name,
            element: (
                <DashboardItem
                    id="my-plugin/my-dashboard-widget" // Must match registration id
                    colSpan={2}
                    rowSpan={1}
                    pluginName={metadata.name}
                    requiredApis={[getMyItemApi.api]}
                >
                    <MyDashboardWidget />
                </DashboardItem>
            ),
        });
    },
};

export default Plugin;
```

## 2. Widget Implementation (content only)

Widget components render **content only** — no `DashboardItem` wrapper.

### Critical Rules

- **Inline `DashboardItem` in `index.tsx`**: Never put `DashboardItem` inside the widget component.
- **Unique ID**: The `id` on `AppRegistry.dashboard.add` and the `id` prop on `DashboardItem` must be identical.
- **`requiredApis`**: Pass API permissions on `DashboardItem` at registration (use `.api` from `withApiMetadataFetchFn` objects).

```tsx
// frontend/src/page/dashboard/my-dashboard-widget.tsx
import { useDashboardContext } from "@quan-erp/base-frontend";

export function MyDashboardWidget() {
    const { startDate, endDate } = useDashboardContext();

    return (
        <div className="flex flex-col w-full h-full p-4 gap-2">
            <h3>My Widget</h3>
            <span>Start date {startDate.toLocaleDateString()}</span>
            <span>End date {endDate.toLocaleDateString()}</span>
        </div>
    );
}
```

## 3. Dashboard Context

Widgets have access to the dashboard's global range (e.g., date filters) via the `useDashboardContext` hook.

> [!IMPORTANT]
> Always ensure the `id` in your registry call and the `id` on the inlined `DashboardItem` are identical. Failure to do so will break the dashboard's layout persistence and identification.
