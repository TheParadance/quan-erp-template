> Parent skill: [Base Plugin](../SKILL.md)

## 21. Role

### `useRoleQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?, option?) => UseQueryResult<RoleDto[], Error>` |
| **APINames** | `useRoleQuery` |
| **DTO** | `RoleDto { id, name, initialPageRoute? }` |

### `useUpdateRoleQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<AxiosResponse, Error, { id?: number; role: CreateRoleDto }, unknown>` |
| **APINames** | `useUpdateRoleQuery` |
| **DTO** | `CreateRoleDto { name, initialPageRoute? }` (may not be re-exported from barrel — check types package) |

> `RoleDropdown` exists under `page/role-permission` but is **not** re-exported from `export.tsx` — not part of the public package surface.

---
