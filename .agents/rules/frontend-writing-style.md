---
trigger: always_on
---

# Frontend Development Standards: React Query

This document defines the standardized patterns for implementing data fetching, mutations, and cache management using TanStack React Query within the Quan ERP ecosystem.

> [!IMPORTANT]
> **Every** data operation that interacts with the backend MUST use the React Query hooks pattern. Manual `useEffect` and `useState` for API synchronization are strictly prohibited.

## 1. Directory & File Structure

Maintain a strict separation between the API client, cache keys, and React Query hooks. These should reside in the same directory as the page or feature that uses them.

- **`[feature].api.ts`**: API client using `getAxiosClient` / `axiosClient` and DTOs (prefer `withApiMetadataFetchFn` when the API is used with `<Protected>`).
- **`[feature].constants.ts`**: Query key definitions.
- **`[feature].queries.ts`**: Custom `useQuery` hooks.
- **`[feature].mutations.ts`**: Custom `useMutation` hooks.

### API Implementation Details (`[feature].api.ts`)
Every API call MUST follow this pattern to ensure compatibility with the backend's structured responses:

1.  **Axios Instance**: Use `getAxiosClient()` (plugins) or the shared `axiosClient` (base).
2.  **Plugin Prefix**: Use `PLUGIN_PREFIX` derived from `module.metadata.json`.
3.  **Request DTO**: Wrap POST/PUT payloads in `new RequestDto(payload)`.
4.  **Response Handling**: Cast `response.data` to `ResponseDto<T>`, check for errors when needed, and **return `data.payload`** from GET `fetchFn` / list APIs.

```typescript
import { getAxiosClient } from "../../lib/axios.js";
import { RequestDto, ResponseDto } from "@quan-erp/shared-frontend-core";
import metadata from "../../../../module.metadata.json" with { type: "json" };

const PLUGIN_PREFIX = `/${metadata.name}`;

export const featureApi = {
    async getItems(skip: number, limit: number) {
        const response = await getAxiosClient().get(`${PLUGIN_PREFIX}/items`, {
            params: { skip, limit },
        });
        const data: ResponseDto<ItemDto[]> = response.data;
        if (data.status === "error") throw new Error(data.message);
        return data.payload;
    },
    async createItem(payload: CreateDto) {
        const response = await getAxiosClient().post(`${PLUGIN_PREFIX}/items`, new RequestDto(payload));
        const data: ResponseDto<ItemDto> = response.data;
        if (data.status === "error") throw new Error(data.message);
        return data.payload;
    }
};
```

## 2. Query Key Management

Always use a structured object for query keys. Prefer `currentPage` / `pageSize` (UI pagination) in keys — convert to `skip` / `limit` only when calling the API.

```typescript
export const DATA_QUERY_KEYS = {
    all: ["feature-namespace"] as const,
    list: (currentPage?: number, pageSize?: number, query?: string) =>
        [...DATA_QUERY_KEYS.all, "list", { currentPage, pageSize, query }] as const,
    detail: (id: string) => [...DATA_QUERY_KEYS.all, "detail", id] as const,
};
```

## 3. List Query Implementation (Required)

> [!IMPORTANT]
> List hooks MUST take `(query: RequestIndexPaginationDto, option?: UseQueryOptions)` — **never** `(skip, limit, …)`.
> Hooks MUST return the **payload** (`T[]`), not `ResponseDto<T>`.
> Pages MUST call `useXQuery({ currentPage, pageSize, query? }, { enabled? })` and use `const { data: items = [] } = …` (no `.payload`).

```typescript
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { RequestIndexPaginationDto } from "@quan-erp/shared-frontend-core";
import { featureApi } from "./feature.api";
import { DATA_QUERY_KEYS } from "./feature.constants";

function resolveIndexPagination(
    query: RequestIndexPaginationDto = {},
    defaults?: { currentPage?: number; pageSize?: number },
) {
    const currentPage = query.currentPage ?? defaults?.currentPage ?? 1;
    const pageSize = query.pageSize ?? defaults?.pageSize ?? 100;
    const skip = Math.max(0, (currentPage - 1) * pageSize);
    return { currentPage, pageSize, skip, query: query.query ?? undefined };
}

export function useItemsQuery(
    query: RequestIndexPaginationDto = {},
    option?: Omit<UseQueryOptions<ItemDto[]>, "queryFn" | "queryKey">,
) {
    const { currentPage, pageSize, skip, query: search } = resolveIndexPagination(query);
    return useQuery({
        queryKey: DATA_QUERY_KEYS.list(currentPage, pageSize, search),
        queryFn: () => featureApi.getItems(skip, pageSize),
        ...(option || {}),
    });
}
```

### Non-list queries
Put required identifiers in an **object** as the first argument, then optional `UseQueryOptions`:

```typescript
useItemByIdsQuery({ fromId, toId }, { enabled: !!fromId && !!toId });
```

### Call sites

```tsx
const { data: items = [], isLoading } = useItemsQuery(
    { currentPage: 1, pageSize: 50, query: debouncedSearch },
    { enabled: open },
);
```

**Incorrect (do not use):**
```tsx
useItemsQuery(0, 50);
const items = data?.payload ?? [];
```

## 4. Mutation Implementation (Write)

Custom mutation hooks MUST handle their own UI feedback and cache invalidation.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@quan-erp/shared-frontend-core";
import { featureApi } from "./feature.api";

export function useCreateItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDto) => featureApi.createItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEYS.all });
            toast.success("Created successfully");
        },
        onError: (e: Error) => {
            toast.error(e.message ?? "Failed to create");
        },
    });
}
```

## 5. UI Integration Best Practices

### Loading States
> [!TIP]
> Use the `isLoading` (initial load) and `isPending` (mutations) flags to disable buttons and show loaders like `Loader2`.

### Error Handling
Rely on the `onError` callback in the mutation hook to trigger `toast` alerts. Avoid manual `try/catch` in components for UI-level errors.

### Data Access
List query `data` **is** the array/object payload. Prefer defaulting at destructure: `const { data: items = [] } = useItemsQuery(...)`.

## 6. UI Component Patterns

### Event Handler Naming Convention
Event handlers should strictly use the `on[Action]` naming convention instead of `handle[Action]`.
- **Correct:** `const onOpenTerms = () => {}`
- **Incorrect:** `const handleOpenTerms = () => {}`

## 7. Entity Dropdown Pattern (Required)

Combobox / entity pickers (e.g. `branch.dropdown.tsx`, `assistant.dropdown.tsx`) MUST follow the shared Branch-style dropdown, not raw `<Select>`.

### File & UI shape
- Prefer `*.dropdown.tsx` under the feature `component/` folder.
- Use Command + Popover (desktop) / Drawer (mobile), debounced search, and list hooks with `RequestIndexPaginationDto`.
- Props typically include: `value`, `setValue`, `trigger?`, `isCompact?`, `className?`, `disabled?`, `allowClear?`, `placeholder?`.

### Value typing with `TakeAndPartialRest`
`value` (and `trigger`'s argument) MUST accept either the raw id **or** a partial DTO keyed by the entity's identity field:

```typescript
import type { TakeAndPartialRest } from "../../../utils/types.utils";

// Numeric id entities (branch, partner, …)
value?: number | TakeAndPartialRest<BranchDto, "id" | "name">;

// String id entities (assistant shortId, …)
value?: string | TakeAndPartialRest<AIAssistantDto, "shortId">;
// or aliased:
type AssistantDropdownValue = string | TakeAndPartialRest<AIAssistantDto, "shortId">;
```

`setValue` still returns the primitive id plus the full DTO: `(id?: string | number, entity?: TDto) => void`.

### Resolve helpers — human-readable names
When `value` can be an id **or** a partial object, extract the id with a named helper. Do **not** use vague names like `resolveId` / `resolveShortId`.

- **Correct:** `resolveAssistantShortId`, `resolveBranchId`, `resolvePartnerId`
- **Incorrect:** `resolveId`, `resolveShortId`, `getId`

```typescript
function resolveAssistantShortId(value?: AssistantDropdownValue): string | undefined {
    if (value == null) return undefined;
    return typeof value === "string" ? value : value.shortId;
}

const selectedShortId = resolveAssistantShortId(value);
// use selectedShortId for find / selected styling / comparisons
```

## 8. Prefer Inline Calls Over Tiny Helpers

> [!IMPORTANT]
> Do **not** invent small one-liner / few-line wrapper functions that only rename a call. Prefer calling the API **inline** at the use site so readers see what happens without jumping elsewhere. Same for pointless locals (property aliases, duplicate identical values, Date↔dayjs round-trips) — see `.agents/rules/backend-writing-style.md` §12 and `.agents/rules/no-micro-functions.md`.

**Avoid extracting when the body is trivial** (e.g. `toLocaleString`, `dayjs(...).format`, a single ternary, re-exporting a constant):

```tsx
// ❌ BAD — forces a hop for no reason
function formatPoints(value: number) {
  return value.toLocaleString();
}
<span>{formatPoints(balance)}</span>

const TAB_VALUE = PARTNER_DETAIL_TAB_VALUE; // pointless alias
<TabsTrigger value={TAB_VALUE} />

// ✅ GOOD — call directly
<span>{balance.toLocaleString()}</span>
<TabsTrigger value={PARTNER_DETAIL_TAB_VALUE} />
```

**Extract a function only when it clearly helps**, for example:
- Shared across multiple files / call sites with real logic
- Non-obvious domain rules (e.g. `resolveBranchId` for `id | partial DTO` unions — see §7)
- Repeated multi-step logic that would otherwise be copy-pasted

Do **not** split a page into many tiny components/helpers just for structure. Prefer one readable component unless reuse or clarity clearly requires a split.
