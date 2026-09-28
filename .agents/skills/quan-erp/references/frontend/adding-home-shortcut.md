# Adding Home Shortcuts

Home shortcuts provide quick access to specific plugin features directly from the dashboard's home screen.

## 1. Registration

Shortcuts are registered in the `register` method of your plugin's entry file (`index.tsx`) using the `getHomeShortcutStore` API.

```tsx
// frontend/src/index.tsx — plugin my-plugin
import { getHomeShortcutStore, ShortcutItem } from "@quan-erp/base-frontend";
import metadata from "../module.metadata.json" with { type: "json" };
// metadata.name === "my-plugin"

export const Plugin = {
    register(AppRegistry) {
        getHomeShortcutStore().getState().add({
            pluginName: metadata.name,
            id: 'my-plugin/my-item',
            displayName: 'My Items',
            component: (
                <ShortcutItem>
                    {/* Your Icon Component Here */}
                    <MyIcon size={25} />
                </ShortcutItem>
            ),
            toLink: '/app/my-plugin/item',
            async onClick() {
                // Logic to execute when the shortcut is clicked
                console.log('My shortcut clicked!');
            }
        });
    }
}
```

## 2. Configuration Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `pluginName` | `string` | The name of the plugin registering the shortcut (use `metadata.name`). |
| `id` | `string` | A unique identifier for the shortcut. Recommended pattern: `my-plugin/feature-name`. |
| `toLink` | `string` | (Optional) The route path to navigate to when clicked. **Must** start with `/app`. |
| `onClick` | `() => Promise<void>` | (Optional) Async callback on click. Useful for opening dialogs or navigating. |
| `displayName` | `string` | The label displayed below the shortcut icon. |
| `component` | `ReactNode` | The UI for the shortcut icon. **Must** be wrapped in `<ShortcutItem />`. |

## 3. Package Sources

- **`getHomeShortcutStore`**: Imported from `@quan-erp/base-frontend`.
- **`ShortcutItem`**: Imported from `@quan-erp/base-frontend`.

> [!TIP]
> Use shortcuts for high-frequency actions (e.g. open **My Items**, create a new item) to improve user productivity.
