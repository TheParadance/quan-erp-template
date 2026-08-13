> Parent skill: [Base Plugin](../SKILL.md)

## 5. Permission

### `useAllowedAPIPermission`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `useAllowedAPIPermission()` → allowed-API zustand store |
| **APINames** | `AllowedAPIPermissions` (**value** `'allowed-api-permission'` — do not rename) |
| **Key API** | `allowedAPIs`, `cached`, `setAllowedAPIPermission`, `include`, `checkIsAllowAPI` |
| **Notes** | Double-call pattern. |

### `Protected`
| | |
|---|---|
| **Kind** | component |
| **Signature** | `Protected(props: ProtectedPropsType): ReactNode` |
| **APINames** | `Protected` |
| **Key props** | `requiredApis`, `children`, `showProtectedFallbackAs?: 'restricted' \| 'route-not-found' \| 'hidden' \| 'custom'`, `enableProtection?`, `pluginName?`, `participateInAssistantGuide?` |
| **Example** | |
```tsx
<Protected requiredApis={[{ method: 'GET', url: '/orders/' }]} showProtectedFallbackAs="restricted">
  <OrdersPage />
</Protected>
```

### `usePerimssionTemplateStore` / `getPerimssionTemplateStore`
| | |
|---|---|
| **Kind** | store |
| **APINames** | `usePerimssionTemplateStore` |
| **What** | Register permission templates for the role UI. |
| **Key fields** | `PermissionTemplate`: `name`, `description`, `apis`, `icon?` |
| **Notes** | Spelling `Perimssion` is intentional (matches code). |

---
