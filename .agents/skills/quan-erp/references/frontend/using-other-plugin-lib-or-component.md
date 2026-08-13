# Using Other Plugin Libraries or Components

In the Quan ERP frontend, plugins can leverage features, components, and hooks from other plugins by using them as NPM dependencies. This allows for deep integration and code reuse across the modular system.

## How it Works

Every frontend plugin is designed to be both a standalone module and a reusable library.
1.  **The Library**: The plugin's entry point (`src/index.tsx`) usually exports its core components and logic.
2.  **The Package**: The plugin is published to the internal NPM registry under the scope `@quan-erp-plugins/`.
3.  **The Consumption**: Other plugins can install this package and import its exports directly.

---

## Consumer-Side Implementation

To use components from another plugin (e.g., using `products` features inside the `inventory` plugin):

### 1. Register the Dependency
Add the target plugin's package to your `frontend/package.json`. Use the standard naming convention: `@quan-erp-plugins/<plugin-name>-frontend`.

> [!IMPORTANT]
> **AI Agent Role**: If you are an AI agent tasked with using components from another plugin, you MUST install the corresponding package `@quan-erp-plugins/<plugin-name>-frontend` in the consumer plugin's `frontend` directory. If only the frontend API/components are needed, you only need to install the frontend package.

```json
// plugins/inventory/frontend/package.json
{
  "dependencies": {
    "@quan-erp-plugins/products-frontend": "^1.0.0-beta.2"
  }
}
```

### 2. Import and Use
You can now import any exported component, hook, or utility from that plugin.

```tsx
import { ProductSelector } from "@quan-erp-plugins/products-frontend";

export function InventoryAdjustmentPage() {
    return (
        <PageContent>
            {/* Using a component from the Products plugin */}
            <ProductSelector onSelect={(product) => console.log(product)} />
        </PageContent>
    );
}
```

---

## Why Use This Pattern?

*   **Modular Architecture**: Allows plugins to remain decoupled while still sharing complex UI logic.
*   **Version Control**: Consuming plugins can lock to specific versions of a dependency plugin's library.
*   **Consistency**: Shared components (like selectors or specialized detail views) ensure the user experience remains unified across different modules.

## Deployment Scenarios

*   **Development**: Often, both plugins are present in the `plugins/` directory.
*   **Production**: The consuming plugin is bundled with its dependencies. The platform handles the orchestration, ensuring that `@quan-erp-plugins/` packages are resolved correctly.

---

## Best Practices

1.  **Check Metadata**: Always ensure that any external plugin dependency is also listed in your root `module.metadata.json` under `pluginDependencies` WITH its version. This is critical for the platform to handle loading order and version compatibility.
    ```json
    "pluginDependencies": {
      "payment-method": "^1.0.0"
    }
    ```
2.  **Backend Externalization**: When using other plugins in the backend, you **MUST** externalize their packages in your `rollup.config.js`. This prevents them from being bundled into your plugin's distribution, allowing the platform to share the singleton instance.
    ```javascript
    const EXTERNAL = [
        ...external,
        "@quan-erp-plugins/payment-method-backend",
    ];
    ```
3.  **Avoid Circular Dependencies**: Never have Plugin A depend on Plugin B while Plugin B depends on Plugin A.
3.  **Graceful Fallbacks**: If a component from another plugin might not be available (e.g., if the dependency is optional), handle the missing component gracefully.
