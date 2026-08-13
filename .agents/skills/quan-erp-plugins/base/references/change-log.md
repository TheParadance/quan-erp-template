> Parent skill: [Base Plugin](../SKILL.md)

## 18. Change log

### `ChangeLog`
| | |
|---|---|
| **Kind** | component |
| **Signature** | `({ pluginName, reference: { prefix, number } }) => ReactNode` |
| **APINames** | `ChangeLog` |
| **Example** | |
```tsx
<ChangeLog pluginName="sales" reference={{ prefix: 'SO', number: String(id) }} />
```

### `useChangeLogQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query: ChangeLogQueryDto, option?) => UseQueryResult<GetChangeLogDto[], Error>` |
| **APINames** | `useChangeLogQuery` |
| **Query** | pagination + required `pluginName`, `referencePrefix`, `referenceNumber`, optional `parentId` |

### `useInfiniteChangeLog`
| | |
|---|---|
| **Kind** | infinite query hook |
| **Signature** | `(pluginName, referencePrefix, referenceNumber, limit?) => UseInfiniteQueryResult<...>` |
| **APINames** | `useInfiniteChangeLog` |

### `useReactChangeLogQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, ChangeLogReactionDto, unknown>` |
| **APINames** | `useReactChangeLogQuery` |
| **DTO** | `{ reaction, reactBy, changeLogId }` |

### `useRemoveReactChangeLogQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, number, unknown>` |
| **APINames** | `useRemoveReactChangeLogQuery` |

### `clearChangeLogCache`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `(args: { pluginName; reference: { prefix; number }; logId? }) => void` |
| **APINames** | `clearChangeLogCache` |

---
