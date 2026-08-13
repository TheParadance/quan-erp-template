# Frontend API Permissions Standard

In the Quan ERP ecosystem, menu item visibility, route access, and component rendering are strictly governed by user API permissions. To enforce this, we use the `withApiMetadataFetchFn` utility and the `<Protected>` component.


## 4. Component-Level Protection (`<Protected>`)

`Protected` is a special component used to wrap UI elements (or entire pages) that require specific permissions. Instead of hardcoding API paths as arrays in your components, we recommend wrapping your API calls in `withApiMetadataFetchFn`.

## 1. Why `withApiMetadataFetchFn`?

Historically, frontend applications define API fetching logic (e.g. `axios.get('/branch')`) in one place and permission arrays (e.g. `{ url: '/branch', method: 'GET' }`) in another. This separation causes critical bugs: if the backend endpoint URL or method changes, developers often update the fetching logic but forget to update the permission array. This results in users being locked out of features because their required permission checks no longer match the API they are calling.

By declaring APIs using `withApiMetadataFetchFn`, you bind the **API Metadata** (the `url` and `method` used for permission matching) together with the **Execution Logic** (`fetchFn`). 

This pattern guarantees that:
1. **No Duplication:** You define the endpoint details exactly once.
2. **Perfect Synchronization:** If an API endpoint changes, the permission requirement automatically updates alongside it.
3. **Type Safety:** The `<Protected>` component can safely consume this unified object, ensuring the permission checked matches the API being executed perfectly.

For detailed documentation on how to declare these APIs and consume them via React Query, see the [React Query API Standard](./react-query-api.md).

**Example API Definition:**
```tsx
import { withApiMetadataFetchFn } from "@quan-erp/shared-types";

export const getBranchApi = withApiMetadataFetchFn({
    api: { method: 'GET', url: '/branch' },
    fetchFn: async (skip: number, limit: number) => {
        // ... API logic — return response.data.payload
    }
});
```

### Using `<Protected>` for an Entire Page
When using `<Protected>` to wrap an entire page, you **must** provide the following layout-related props so the page renders correctly within the application structure:

```tsx
import { Protected } from "@quan-erp/shared-ui";

// 1. The wrapper component that performs the permission check
export function ProtectedBranch() {
    return (
        <Protected
            participateInAssistantGuide={false}
            parentClassName="w-full h-full"
            warpperClassName="w-full hfull"
            showProtectedFallbackAs='restricted'
            requiredApis={getBranchApi}
        >
            <BranchPage />
        </Protected>
    );
}

// 2. The actual page component
export function BranchPage() {
    // This hook will NOT run if the user lacks permission
    const { data: branches = [] } = useBranchQuery({ currentPage: 1, pageSize: 100 });
    return <div>...</div>;
}
```

> [!IMPORTANT]
> **Component Separation is Mandatory:** You must separate the page into two components as shown above. The `<Protected>` wrapper conditionally renders its children. If you place your data-fetching hooks (e.g., `useBranchQuery`) directly inside the same component that returns the `<Protected>` wrapper, the hooks will execute regardless of permission status, leading to unnecessary backend calls and 403 Forbidden errors.
```

### Using `<Protected>` for Small Components
When wrapping small localized components (like a "New Branch" button), the layout props are not needed. You only need to pass the `requiredApis` prop.

```tsx
<Protected requiredApis={createBranchApi}>
    <Button onClick={() => openForm()}>
        <Plus />
        New branch
    </Button>
</Protected>
```
