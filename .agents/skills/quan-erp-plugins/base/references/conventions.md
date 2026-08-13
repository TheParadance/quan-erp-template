> Parent skill: [Base Plugin](../SKILL.md)

## Shared conventions (read before any API)

> [!IMPORTANT]
> - **Import:** always `@quan-erp/base-frontend`.
> - **List queries:** `(query?: RequestIndexPaginationDto, option?)` → `UseQueryResult<T[], Error>`. Payload is **unwrapped** (`T[]`), not `ResponseDto`. Prefer `const { data: items = [] } = useXQuery({ currentPage, pageSize, query })`.
> - **Mutations:** `const m = useXQuery(); m.mutate(...)` / `m.mutateAsync(...)`.
> - **Most Zustand stores (PluginAPI wrappers):** **double-call** — `useNavMenuStore()()` (wrapper returns the zustand hook). Exception: `useAppRegistry(selector?)` is single-call with optional selector.
> - **PluginAPI plugin name:** `'builtin'`.
> - **`APINames`:** also exported; string keys must match `setup-prod.ts` expose.

```ts
const { data: branches = [] } = useBranchQuery({ currentPage: 1, pageSize: 50, query: 'main' });
const nav = useNavMenuStore()();
nav.label.set('Orders');
const qc = useAppRegistry((s) => s.queryClient);
```

---
