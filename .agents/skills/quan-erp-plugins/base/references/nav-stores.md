> Parent skill: [Base Plugin](../SKILL.md)

## 3. Nav / shell stores

### `useNavMenuStore`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `useNavMenuStore(): UseBoundStore<StoreApi<NavMenuStore>>` |
| **APINames** | `useNavMenuStore` |
| **What** | Top nav: leading, label, menu items, action items, visibility. |
| **Key API** | `leading.set` / `setBackButton`, `label.set`, `navMenuItem.add`, `navMenuActionItem.add` / `set`, `visibility.hide` / `show`, `syncNavMenu({...})` |
| **Notes** | Double-call: `useNavMenuStore()()`. |
| **Example** | |
```ts
const nav = useNavMenuStore()();
nav.label.set('Orders');
nav.leading.setBackButton();
nav.navMenuActionItem.set([<Button key="a">Action</Button>]);
```

### `useBottomNavBarStore`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `useBottomNavBarStore(): UseBoundStore<StoreApi<BottomNavBarStore>>` |
| **APINames** | `useBottomNavBarStore` |
| **What** | Mobile bottom bar visibility. |
| **Key API** | `visibility.isVisible`, `visibility.show()`, `visibility.hide()` |
| **Notes** | Double-call. |

### `useWebEnvStore` / `getWebEnvStore`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `UseBoundStore<StoreApi<WebEnvStore>>` (`env`, `setEnv`) |
| **APINames** | `useWebEnvStore` |

### `useRootComponentStore` / `getRootComponentStore`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `UseBoundStore<StoreApi<RootComponentStore>>` — `{ components, add, addAll }` |
| **APINames** | `useRootComponentStore` |
| **What** | Mount global overlay / root components from plugins. |

### `useHomeShortcutStore` / `getHomeShortcutStore`
| | |
|---|---|
| **Kind** | store |
| **APINames** | `useHomeShortcutStore` |
| **What** | Home screen shortcut registry. |
| **Shortcut fields** | `id`, `pluginName?`, `displayName`, `component`, `toLink?`, `onClick?`, `span?` |

### `ShortcutItem`
| | |
|---|---|
| **Kind** | component |
| **Signature** | `ShortcutItem(prop: { children?: ReactNode \| ReactNode[] }): ReactNode` |
| **APINames** | `ShortcutItem` |
| **What** | Wrapper used when rendering a home shortcut tile. |

---
