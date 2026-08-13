# Icon Selection Standard

For Quan ERP plugin development, we maintain a consistent visual style using specific icon packages.

## Recommended Icon Pack: IconPark

> [!IMPORTANT]
> **IconPark (`@icon-park/react`) is the preferred icon system** for all Quan ERP plugins. It should be used for main menus, features, and primary UI elements.

It offers a clean, professional aesthetic that aligns with the ERP's design language.


### Basic Usage

```tsx
import { Hamburger, SettingTwo } from '@icon-park/react';

// Example in a component
<Hamburger theme="outline" size="24" fill="#333" />
```

### In Menu Registration

When adding items to the system menu, use the standard layout for icons:

```tsx
import { Hamburger } from '@icon-park/react';
import { IconParkMenuTabIcon } from '@quan-erp/shared-ui';

AppRegistry.menu.add({
  name: (
    <MenuTab
      icon={<IconParkMenuTabIcon icon={Hamburger} />}
      labelKey='my-plugin' 
      fallbackLabel={"My Plugin"} 
    />
  ),
  // ... other config
});
```

## Secondary Icon Pack: Lucide React

While IconPark is preferred, **`lucide-react`** is also available and used for specific system utilities and shortcuts.

```tsx
import { Banknote } from 'lucide-react';

<Banknote size={25} />
```

---

## Best Practices

1. **Consistency**: Stick to one icon pack within a single feature area unless there is a specific functional reason to mix them.
2. **Stroke Width**: Maintain default stroke widths for a uniform look unless a specific "Bold" or "Light" version is required for the UI context.
3. **Responsive Size**: Use standard sizes (e.g., 20px for inline icons, 24-25px for sidebar/shortcuts).
4. **Theme**: Prefer the `outline` theme for IconPark to keep the UI light and modern.
