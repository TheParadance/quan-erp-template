> Parent skill: [Base Plugin](../SKILL.md)

## 24. Utils

### `resolveIndexPagination`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `resolveIndexPagination(query?, defaults?): { currentPage, pageSize, skip, query }` |
| **What** | Converts `{ currentPage, pageSize, query }` → backend skip/limit (defaults often `1` / `100`). |
| **APINames** | none |

### `TakeAndPartialRest<T, K>`
| | |
|---|---|
| **Kind** | type |
| **Signature** | `Pick<T, K> & Partial<Omit<T, K>>` |
| **What** | Used by entity dropdown `value` shapes (`id` / `shortId` / `code` keys). |

---
