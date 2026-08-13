> Parent skill: [Base Plugin](../SKILL.md)

## 25. Known gaps / caveats (source-accurate)

| Item | Issue |
|---|---|
| `queryClient` | Runtime expose only; no named TS wrapper export |
| Shipping `APINames` | `Parnter` typos in enum keys |
| Spotlight `APINames` | `SportligthSearchStore` typo |
| Permission store | `usePerimssionTemplateStore` spelling |
| Exchange update | Wrapper may lack `setup-prod` expose — verify before use |
| UOM create/update wrappers | Missing `()`; update uses wrong `APINames` key |
| `RoleDropdown` | Implemented but **not** in `export.tsx` barrels |
| Create/update role DTO types | May not be re-exported from role-permission barrel |

---
