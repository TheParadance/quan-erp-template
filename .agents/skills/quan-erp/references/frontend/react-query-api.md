# React Query API Declaration Standard

In the Quan ERP ecosystem, all backend API calls should be declared in dedicated `.api.ts` files using the `withApiMetadataFetchFn` wrapper. This ensures that our API calls are strictly typed, well-structured, and automatically integrated with our Role-Based Access Control (RBAC) permissions system.

## 1. Directory & File Structure

All API-related files must be located under the `src/api` folder, grouped by domain.

```text
src/api/<domain>/
     <domain>.api.ts
     <domain>.types.ts
     <domain>.queries.ts
     <domain>.mutations.ts
     <domain>.constants.ts
```

- **`.api.ts`**: Contains the raw API calls wrapped in `withApiMetadataFetchFn`.
- **`.types.ts`**: Contains all TypeScript interfaces, payloads, and DTOs related to the domain.
- **`.queries.ts`**: Custom `useQuery` hooks.
- **`.mutations.ts`**: Custom `useMutation` hooks.
- **`.constants.ts`**: Typically stores React Query cache keys (e.g., `MY_ITEM_QUERY_KEYS`), along with any other domain-specific constants.

## 2. Naming Convention

API endpoints declared with this wrapper MUST follow a strict naming convention: `<action><domain>Api`. 
For example: `createMyItemApi`, `getMyItemApi`, `updateMyItemApi`.
This ensures consistency across the codebase.

## 3. Declaring APIs with `withApiMetadataFetchFn`

When declaring an API function that will be consumed by React Query hooks (`useQuery`, `useMutation`), you **must** wrap it in `withApiMetadataFetchFn` from `@quan-erp/shared-types` (base frontend may also re-export via `permission.lib`).

This wrapper combines the raw HTTP `fetchFn` logic with the required `api` metadata (`method` and `url`).

> [!IMPORTANT]
> For **plugin** APIs, `api.url` and axios paths must be the **full** mounted path: `` `/${metadata.name}/item` `` (e.g. `/my-plugin/item`). Backend `@Controller` uses the resource only (`"/item"`) — the framework adds the plugin prefix. Do not omit the prefix on the frontend, and do not put the plugin name in `@Controller`. See [Call Backend API](./call-backend-api.md) and [Annotations `@Controller`](../backend/annotations.md).

**Example implementation** (`metadata.name === "my-plugin"`):
```typescript
import { withApiMetadataFetchFn } from "@quan-erp/shared-types";
import type { RequestIndexPaginationDto } from "@quan-erp/shared-frontend-core";
import { getAxiosClient } from "../../lib/axios";
import type { MyItemDto } from "./item.types";
import metadata from "../../../module.metadata.json" with { type: "json" };

export const getMyItemApi = withApiMetadataFetchFn({
    // 1. API Metadata used for Permission checks
    api: { method: 'GET', url: `/${metadata.name}/item` },
    
    // 2. The actual data fetching logic — return the unwrapped payload array/object
    fetchFn: async (skip: number, limit: number, search?: string): Promise<MyItemDto[]> => {
        const response = await getAxiosClient().get(`/${metadata.name}/item`, {
            params: { skip, limit, search }
        });
        return response.data.payload;
    }
});
```

### Why use `withApiMetadataFetchFn`?
By bundling the API metadata and the fetching logic, we prevent desynchronization bugs. If an endpoint URL changes, the permission requirement changes alongside it. This object is then directly consumed by the `<Protected>` component for permission validation. For full details on why this is strictly required for RBAC routing and component protection, see [API Permissions](./api-permissions.md).

## 4. List / Index Query Hooks (Required Pattern)

> [!IMPORTANT]
> **Do not** expose list hooks as `(skip, limit, …)`. Call sites must use `RequestIndexPaginationDto` (`currentPage` / `pageSize` / optional `query`) plus optional React Query `UseQueryOptions`. Convert to backend `skip` / `limit` inside the hook via `resolveIndexPagination` (base: `src/utils/pagination.ts`) or the same math in plugins.

### Canonical list hook signature

```typescript
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { RequestIndexPaginationDto } from "@quan-erp/shared-frontend-core";
import { resolveIndexPagination } from "../../utils/pagination";
import { DEFAULT_STALE_TIME } from "../../utils/common";
import { MY_ITEM_QUERY_KEYS } from "./item.constants";

export function useMyItemQuery(
    query: RequestIndexPaginationDto = {},
    option?: Omit<UseQueryOptions<MyItemDto[]>, 'queryFn' | 'queryKey'>,
) {
    const { currentPage, pageSize, skip, query: search } = resolveIndexPagination(query)
    return useQuery({
        queryFn: () => getMyItemApi.fetchFn(skip, pageSize, search ?? undefined),
        queryKey: [MY_ITEM_QUERY_KEYS.list, currentPage, pageSize, search],
        staleTime: DEFAULT_STALE_TIME,
        ...(option || {}),
    })
}
```

### Rules

1. **Hook return type is the payload**, not `ResponseDto<T>`. GET `fetchFn` must return `response.data.payload` (typed as `T` / `T[]`).
2. **First argument** is always a query object (`RequestIndexPaginationDto` or an intersection with domain filters).
3. **Second argument** is always optional `Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'>`.
4. **Never** pass bare `skip` / `limit` from pages or dropdowns.
5. **Consumers** use `const { data: items = [], isLoading } = useXQuery({ currentPage: 1, pageSize: 100 })` — no `data?.payload`.

### Domain filters on the query object

Extend `RequestIndexPaginationDto` with extra fields (do **not** put filters in a third positional arg):

```typescript
export type MyItemQueryDto = RequestIndexPaginationDto<string, number, number, {
    isActive?: boolean;
    categoryId?: number;
}>;

export function useMyItemQuery(
    query: MyItemQueryDto = {},
    option?: Omit<UseQueryOptions<MyItemDto[]>, 'queryFn' | 'queryKey'>,
) { /* resolveIndexPagination + filters */ }
```

### Non-paginated / keyed queries

When the resource is not an index list, put required ids in an **object** as the first argument, then options:

```typescript
// Correct
useMyItemDetailQuery({ itemId }, { enabled: !!itemId })
useMyItemRelatedQuery({ fromId, toId }, { enabled: true })

// Incorrect
useMyItemRelatedQuery(fromId, toId)
useMyItemQuery(0, 100)
```

### Call-site examples

```tsx
// List — plugin my-plugin
const { data: items = [] } = useMyItemQuery({ currentPage: 1, pageSize: 100 });
const { data: filtered = [] } = useMyItemQuery(
    { currentPage: 1, pageSize: 50, query: debouncedSearch, isActive: true },
    { enabled: open },
);

// Plugin export wrappers must mirror the same (query, option?) signature
```

### `resolveIndexPagination`

```typescript
// Defaults: currentPage = 1, pageSize = 100
// skip = (currentPage - 1) * pageSize
const { currentPage, pageSize, skip, query } = resolveIndexPagination(query, { pageSize: 20 });
```

Base frontend: import from `src/utils/pagination` (also re-exported via `src/utils/index.ts`). Plugins may copy the same helper locally if they cannot import base internals.

## 5. Using the Declared API in React Query (Mutations)

When you want to use the declared API inside a React Query hook, you must reference the `.fetchFn` property of the created API object.

**Mutation Example:**
```typescript
import { useMutation } from "@tanstack/react-query";
import metadata from "../../../module.metadata.json" with { type: "json" };

export const createMyItemApi = withApiMetadataFetchFn({
    api: { method: 'POST', url: `/${metadata.name}/item` },
    fetchFn: async (data: any) => { /* logic */ }
});

export function useCreateMyItemMutation() {
    return useMutation({
        mutationFn: (data: any) => createMyItemApi.fetchFn(data), // Reference .fetchFn here!
    });
}
```

## 6. Plugin exports (`.export.ts`)

When exposing a query hook via `PluginAPI` / `@quan-erp/base-frontend`, the export wrapper **must** use the same `(query, option?)` signature as the implementation so published types stay aligned with call sites.
