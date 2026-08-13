> Parent skill: [Base Plugin](../SKILL.md)

## 15. User

### `useUserQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?, option?) => UseQueryResult<UserDto[], Error>` |
| **APINames** | `useUserQuery` |

### `useCreateUserQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, CreateUserDto, unknown>` |
| **APINames** | `useCreateUserQuery` |
| **DTO** | `username`, `name`, `password`, `roleId`, `isOwner?`, `tags?` |

### `useUpdateUserQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<ResponseDto<any>, Error, { id: string; user: UpdateUserDto }, unknown>` |
| **APINames** | `useUpdateUserQuery` |
| **DTO** | `name`, `username`, `roleId`, `tags?` |

### `UserDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `UserDropdown` |
| **Key props** | `value` / `setValue` (entity dropdown pattern) |

**UserDto:** `id`, `name`, `username`, `isActive`, `role`, `tags`

---
