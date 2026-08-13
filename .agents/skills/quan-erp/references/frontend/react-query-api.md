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
- **`.constants.ts`**: Typically stores React Query cache keys (e.g., `DOMAIN_QUERY_KEYS`), along with any other domain-specific constants.

## 2. Naming Convention

API endpoints declared with this wrapper MUST follow a strict naming convention: `<action><domain>Api`. 
For example: `createBranchApi`, `getBranchApi`, `updateBranchApi`.
This ensures consistency across the codebase.

## 3. Declaring APIs with `withApiMetadataFetchFn`

When declaring an API function that will be consumed by React Query hooks (`useQuery`, `useMutation`), you **must** wrap it in `withApiMetadataFetchFn` from `@quan-erp/shared-types` (base frontend may also re-export via `permission.lib`).

This wrapper combines the raw HTTP `fetchFn` logic with the required `api` metadata (`method` and `url`).

**Example implementation:**
```typescript
import { withApiMetadataFetchFn } from "@quan-erp/shared-types";
import type { RequestIndexPaginationDto } from "@quan-erp/shared-frontend-core";
import axiosClient from "../../utils/axios-client";
import type { BranchDto } from "./branch.type";

export const getBranchApi = withApiMetadataFetchFn({
    // 1. API Metadata used for Permission checks
    api: { method: 'GET', url: '/branch' },
    
    // 2. The actual data fetching logic — return the unwrapped payload array/object
    fetchFn: async (skip: number, limit: number, search?: string): Promise<BranchDto[]> => {
        const response = await axiosClient.get(`/branch`, {
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

export function useBranchQuery(
    query: RequestIndexPaginationDto = {},
    option?: Omit<UseQueryOptions<BranchDto[]>, 'queryFn' | 'queryKey'>,
) {
    const { currentPage, pageSize, skip, query: search } = resolveIndexPagination(query)
    return useQuery({
        queryFn: () => getBranchApi.fetchFn(skip, pageSize, search ?? undefined),
        queryKey: ['branch', currentPage, pageSize, search],
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
export type PartnerQueryDto = RequestIndexPaginationDto<string, number, number, {
    isSupplier?: boolean;
    isCustomer?: boolean;
}>;

export function usePartnerQuery(
    query: PartnerQueryDto = {},
    option?: Omit<UseQueryOptions<PartnerDto[]>, 'queryFn' | 'queryKey'>,
) { /* resolveIndexPagination + filters */ }
```

### Non-paginated / keyed queries

When the resource is not an index list, put required ids in an **object** as the first argument, then options:

```typescript
// Correct
useUnitOfConversionToQuery({ fromId, toId }, { enabled: true })
useApiPermissionQuery(roleId, { enabled: !!roleId })
useAIToolsQuery({ staleTime: 60_000 })

// Incorrect
useUnitOfConversionToQuery(fromId, toId)
useBranchQuery(0, 100)
```

### Call-site examples

```tsx
// List
const { data: branches = [] } = useBranchQuery({ currentPage: 1, pageSize: 100 });
const { data: partners = [] } = usePartnerQuery(
    { currentPage: 1, pageSize: 50, query: debouncedSearch, isCustomer: true },
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

export const createBranchApi = withApiMetadataFetchFn({
    api: { method: 'POST', url: '/branch' },
    fetchFn: async (data: any) => { /* logic */ }
});

export function useCreateBranchMutation() {
    return useMutation({
        mutationFn: (data: any) => createBranchApi.fetchFn(data), // Reference .fetchFn here!
    });
}
```

## 6. Plugin exports (`.export.ts`)

When exposing a query hook via `PluginAPI` / `@quan-erp/base-frontend`, the export wrapper **must** use the same `(query, option?)` signature as the implementation so published types stay aligned with call sites.
