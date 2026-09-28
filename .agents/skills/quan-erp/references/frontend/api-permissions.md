# Frontend API Permissions Standard

In the Quan ERP ecosystem, menu item visibility, route access, and component rendering are strictly governed by user API permissions. To enforce this, we use the `withApiMetadataFetchFn` utility and the `<Protected>` component.

## 1. Why `withApiMetadataFetchFn`?

Historically, frontend applications define API fetching logic (e.g. `axios.get('/my-plugin/item')`) in one place and permission arrays (e.g. `{ url: '/my-plugin/item', method: 'GET' }`) in another. This separation causes critical bugs: if the backend endpoint URL or method changes, developers often update the fetching logic but forget to update the permission array. This results in users being locked out of features because their required permission checks no longer match the API they are calling.

By declaring APIs using `withApiMetadataFetchFn`, you bind the **API Metadata** (the `url` and `method` used for permission matching) together with the **Execution Logic** (`fetchFn`). 

This pattern guarantees that:
1. **No Duplication:** You define the endpoint details exactly once.
2. **Perfect Synchronization:** If an API endpoint changes, the permission requirement automatically updates alongside it.
3. **Type Safety:** The `<Protected>` component can safely consume this unified object, ensuring the permission checked matches the API being executed perfectly.

For detailed documentation on how to declare these APIs and consume them via React Query, see the [React Query API Standard](./react-query-api.md).

**Example API Definition** (`metadata.name === "my-plugin"`):
```tsx
import { withApiMetadataFetchFn } from "@quan-erp/shared-types";
import { getAxiosClient } from "../../lib/axios";
import metadata from "../../../module.metadata.json" with { type: "json" };

export const getMyItemApi = withApiMetadataFetchFn({
    api: { method: 'GET', url: `/${metadata.name}/item` },
    fetchFn: async (skip: number, limit: number) => {
        const response = await getAxiosClient().get(`/${metadata.name}/item`, {
            params: { skip, limit },
        });
        return response.data.payload;
    }
});
```

## 2. Component-Level Protection (`<Protected>`)

`Protected` wraps UI elements (or entire pages) that require specific permissions. Prefer passing API objects from `withApiMetadataFetchFn` instead of hardcoding path arrays.

### Using `<Protected>` for an Entire Page
When using `<Protected>` to wrap an entire page, you **must** provide the following layout-related props so the page renders correctly within the application structure:

```tsx
import { Protected } from "@quan-erp/shared-ui";

// 1. The wrapper component that performs the permission check
export function ProtectedMyItemPage() {
    return (
        <Protected
            participateInAssistantGuide={false}
            parentClassName="w-full h-full"
            warpperClassName="w-full hfull"
            showProtectedFallbackAs='restricted'
            requiredApis={getMyItemApi}
        >
            <MyItemPage />
        </Protected>
    );
}

// 2. The actual page component
export function MyItemPage() {
    // This hook will NOT run if the user lacks permission
    const { data: items = [] } = useMyItemQuery({ currentPage: 1, pageSize: 100 });
    return <div>...</div>;
}
```

> [!IMPORTANT]
> **Component Separation is Mandatory:** You must separate the page into two components as shown above. The `<Protected>` wrapper conditionally renders its children. If you place your data-fetching hooks (e.g., `useMyItemQuery`) directly inside the same component that returns the `<Protected>` wrapper, the hooks will execute regardless of permission status, leading to unnecessary backend calls and 403 Forbidden errors.

### Using `<Protected>` for Small Components
When wrapping small localized components (like a "Create" button), the layout props are not needed. You only need to pass the `requiredApis` prop.

```tsx
<Protected requiredApis={createMyItemApi}>
    <Button onClick={() => openForm()}>
        <Plus />
        Create item
    </Button>
</Protected>
```
