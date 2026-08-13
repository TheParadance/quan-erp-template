> Parent skill: [Base Plugin](../SKILL.md)

## 6. Branch

### `useBranchQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?: RequestIndexPaginationDto, option?) => UseQueryResult<BranchDto[], Error>` |
| **APINames** | `useBranchQuery` |
| **What** | Paginated branch list (unwrapped). |

### `useCreateBranchQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, CreateBranchDto \| any, unknown>` |
| **APINames** | `useCreateBranchQuery` |
| **DTO** | `name`, `isActive`, `isDefault`, address fields, `tags?: number[]` |

### `useUpdateBranchQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, { id: number; branch: UpdateBranchDto }, unknown>` |
| **APINames** | `useUpdateBranchQuery` |

### `BranchDropdown`
| | |
|---|---|
| **Kind** | component |
| **Signature** | `(props: BranchDropdownProps) => ReactNode` |
| **APINames** | `BranchDropdown` |
| **Key props** | `value?: number \| TakeAndPartialRest<BranchDto, "id" \| "name">`, `setValue(v?, branch?)`, `allowClear?`, `isCompact?`, `disabled?`, `trigger?`, `placeholder?`, `className?` |
| **Example** | |
```tsx
<BranchDropdown value={branchId} setValue={(id) => setBranchId(id)} allowClear />
```

**Types re-exported:** `BranchDto`, `CreateBranchDto`, `UpdateBranchDto`

---
