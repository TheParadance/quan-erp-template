> Parent skill: [Base Plugin](../SKILL.md)

## 16. Tags

### `useTagQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?, option?) => UseQueryResult<TagDto[], Error>` |
| **APINames** | `useTagQuery` |

### `useFindTagStartWithQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query: RequestIndexPaginationDto, option?) => UseQueryResult<TagDto[], Error>` |
| **APINames** | `useFindTagStartWithQuery` |
| **What** | Prefix search; use pagination `query` field as the prefix. |

### `useCreateTagQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, CreateTagDto, unknown>` |
| **APINames** | `useCreateTagQuery` |
| **DTO** | `{ name: string }` |

### `TagDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `TagDropdown` |
| **Key props** | `value?: TagDto[]`, `setValue(tags)`, multi-select + create-on-type |
| **Example** | |
```tsx
<TagDropdown value={tags} setValue={setTags} />
```

**DTO:** `TagDto { id, name }`

---
