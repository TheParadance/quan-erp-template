# Adding Home Shortcuts

Home shortcuts provide quick access to specific plugin features directly from the dashboard's home screen.

## 1. Registration

Shortcuts are registered in the `register` method of your plugin's entry file (`index.tsx`) using the `getHomeShortcutStore` API.

```tsx
// frontend/src/index.tsx
import { getHomeShortcutStore, ShortcutItem } from "@quan-erp/base-frontend";

export const Plugin = {
    register(AppRegistry) {
        getHomeShortcutStore().getState().add({
            pluginName: 'your-plugin-name',
            id: 'unique-shortcut-id',
            displayName: 'My Feature',
            component: (
                <ShortcutItem>
                    {/* Your Icon Component Here */}
                    <MyIcon size={25} />
                </ShortcutItem>
            ),
            toLink: '/app/my-feature',
            async onClick() {
                // Logic to execute when the shortcut is clicked
                console.log('Shortcut clicked!');
            }
        });
    }
}
```

## 2. Configuration Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `pluginName` | `string` | The name of the plugin registering the shortcut. |
| `id` | `string` | A unique identifier for the shortcut. Recommended pattern: `plugin-name/feature-name`. |
| `toLink` | `string` | (Optional) The route path to navigate to when clicked. **Must** start with `/app`. |
| `onClick` | `function` | (Optional) A callback function executed on click. |
| `displayName` | `string` | The label displayed below the shortcut icon. |
| `component` | `ReactNode` | The UI for the shortcut icon. **Must** be wrapped in `<ShortcutItem />`. |
| `onClick` | `() => Promise<void>` | Async function triggered on click. Useful for opening dialogs, triggering scans, or navigating. |

## 3. Package Sources

- **`getHomeShortcutStore`**: Imported from `@quan-erp/base-frontend`.
- **`ShortcutItem`**: Imported from `@quan-erp/base-frontend`.

> [!TIP]
> Use shortcuts for high-frequency actions like "Scan QR", "Create Invoice", or "Check Attendance" to improve user productivity.
