# IconParkMenuTabIcon Reference

The `IconParkMenuTabIcon` is the official UI component wrapper used across Quan ERP to integrate IconPark (`@icon-park/react`) icons consistently into sidebar/tab menu configurations (`AppRegistry.menu.add`).

> [!IMPORTANT]
> **Always Import from `@quan-erp/shared-ui`**:
> Do not import `IconParkMenuTabIcon` or `MenuTab` directly from local directories. They must always be imported from the shared UI package:
> ```typescript
> import { IconParkMenuTabIcon, MenuTab } from "@quan-erp/shared-ui";
> ```

---

## Why Use `IconParkMenuTabIcon`?

Rather than adding raw or custom-styled `@icon-park/react` components directly to your configurations, wrapping them in `IconParkMenuTabIcon` guarantees:
1. **Perfect Sizing & Layout Consistency**: Automatically handles responsive styles between standard sidebars, bottom navbars, and mobile menus.
2. **Default Sizing & Stroke Standards**: Sets proper defaults that align perfectly with the system's aesthetic (e.g. `theme="outline"`).
3. **Namespace Tracking**: Adds the `data-plugin` attribute for debugging and system logs.

---

## Props Reference

The component takes the following props:

| Prop | Type | Required | Description |
|---|---|---|---|
| `icon` | `Component` | **Yes** | The `@icon-park/react` component class (e.g., `Home`, `SettingTwo`). |
| `pluginName` | `string` | No | The name of your plugin (usually `metadata.name`). |
| `className` | `string` | No | Additional Tailwind or CSS classes to override default styling. |
| `...props` | `any` | No | Any other props are passed directly to the underlying IconPark icon element (such as `size` or `fill`). |

---

## Standard Usage Example

To add items to the system sidebar menu, use `IconParkMenuTabIcon` inside `<MenuTab>`:

```tsx
import { AppRegistryState } from "@quan-erp/shared-types";
import { IconParkMenuTabIcon, MenuTab } from "@quan-erp/shared-ui";
import { SettingTwo, Bookmark } from "@icon-park/react";
import metadata from "../../module.metadata.json" with { type: "json" };
import { Locale } from "./locale.export";

AppRegistry.menu.add({
  name: (
    <MenuTab 
      pluginName={metadata.name}
      icon={<IconParkMenuTabIcon pluginName={metadata.name} icon={SettingTwo} />} 
      labelKey="settings-tab" 
      fallbackLabel="Settings" 
      locale={Locale}
    />
  ),
  pluginName: metadata.name,
  children: [
    {
      name: (
        <MenuTab 
          pluginName={metadata.name}
          icon={<IconParkMenuTabIcon pluginName={metadata.name} icon={Bookmark} />} 
          labelKey="sub-item" 
          fallbackLabel="Sub Item" 
          locale={Locale}
        />
      ),
      path: `/${metadata.name}/sub-route`,
      requiredApis: [
        { url: `/${metadata.name}/endpoints/`, method: "GET" }
      ]
    }
  ]
});
```

---

## Best Practices

1. **Keep Default Stroke and Fill**: Avoid setting hardcoded size or fill properties directly on `IconParkMenuTabIcon` unless explicitly required by the visual specification, allowing the application theme context to handle colors automatically.
2. **Include `pluginName`**: Pass the `pluginName` prop when wrapping icons. This ensures perfect metadata attribute tagging (adds `data-plugin="plugin-name"`).
3. **Prefer `@icon-park/react`**: While the system has secondary support for `lucide-react` in utilities, all main sidebar and menu registrations **must** use IconPark icons wrapped in `IconParkMenuTabIcon`.
