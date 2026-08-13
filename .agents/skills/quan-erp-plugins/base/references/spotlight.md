> Parent skill: [Base Plugin](../SKILL.md)

## 19. Spotlight search

### `registerSportlightSearch`
| | |
|---|---|
| **Kind** | registry |
| **Signature** | `registerSportlightSearch({ pluginName, groupTitle, searchType, callback }): void` |
| **APINames** | `SportlightSearchCallback` |
| **Types** | `SportlightSearchType` (`simple-search` \| `full-text-search` \| `vector-search`); callback `(q) => Promise<SportlightSearchResult[] \| null>` |
| **Example** | |
```ts
registerSportlightSearch({
  pluginName: 'sales',
  groupTitle: 'Orders',
  searchType: SportlightSearchType.SIMPLE_SEARCH,
  callback: async ({ query }) => [{ component: <div>{query}</div> }],
});
```

### `useSportlightSearchStore`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `useSportlightSearchStore(): UseBoundStore<{ isOpening, setOpen, open, close }>` |
| **APINames** | `SportligthSearchStore` (typo in enum — keep as-is) |

---
