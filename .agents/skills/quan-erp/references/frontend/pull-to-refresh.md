# PullToRefresh Reference

The `PullToRefresh` component is the official container wrapper used across Quan ERP to integrate standard pull-to-refresh scroll gesture controls, guaranteeing a fluid mobile reloading experience while maintaining full desktop support.

> [!IMPORTANT]
> **Always Import from `@quan-erp/shared-ui`**:
> Do not use raw custom scrolling listeners or third-party reloading widgets. The component must always be imported from the shared UI package:
> ```typescript
> import { PullToRefresh } from "@quan-erp/shared-ui";
> ```

---

## Why Use `PullToRefresh`?

Instead of relying solely on static reload buttons or requiring full page reloads, wrapping your main lists, grids, or tables in `PullToRefresh` offers:
1. **Premium Mobile UX**: Integrates native touch gesture listeners to trigger seamless visual loading spinners on mobile drag events.
2. **Integrated Success Indicator**: Features an animated visual completion checkmark to confirm when data has successfully re-synced.
3. **Responsive Layout Compatibility**: Works seamlessly with both mobile grid lists and desktop tables.

---

## Props Reference

The component takes the following props:

| Prop | Type | Required | Description |
|---|---|---|---|
| `refreshing` | `boolean` | **Yes** | Binds the loading state. Toggles the reload spinner animation. |
| `onRefresh` | `() => Promise<void> \| void` | **Yes** | Callback triggered on drag gestures. Typically triggers the TanStack Query `refetch()` function. |
| `success` | `boolean` | No | Dictates the completion animation status (e.g., set to `!isError`). |
| `className` | `string` | No | Additional CSS layout classes (commonly `flex-1 flex flex-col relative h-full`). |

---

## Standard Integration Example

This example demonstrates the official design pattern for wrapping list content inside a `<PullToRefresh>` container within `<PageContent>`, handling `LoadingState`, `ErrorState`, and `EmptyState` components.

This pattern is modeled directly after the **Business Branch** implementation in [branch.page.tsx](file:///Users/jianshangquan/App-Developemnt/ThePradanceCodeProject/quan-erp-node/quan-erp-node-core/base/frontend/src/page/branch/branch.page.tsx).

```tsx
import React, { useState } from "react";
import { 
    Page, 
    PageContent, 
    PullToRefresh, 
    LoadingState, 
    ErrorState, 
    EmptyState, 
    Button 
} from "@quan-erp/shared-ui";
import { Plus } from "@icon-park/react";
import { toast } from "sonner";
import { useItemsQuery } from "./api/items.api"; // Custom TanStack Query Hook
import metadata from "../../module.metadata.json" with { type: "json" };

export function MyPage() {
    const [refreshing, setRefreshing] = useState(false);
    const { data: items, refetch, isLoading, isError } = useItemsQuery();

    // 1. Define standard asynchronous gesture handler
    async function handleRefresh() {
        setRefreshing(true);
        const result = await refetch();
        if (result.isError) {
            toast.error(result.error?.message || "Failed to refetch details");
        }
        setRefreshing(false);
    }

    return (
        <Page pluginName={metadata.name}>
            <PageContent>
                {/* Parent div MUST have height limit and overflow hidden */}
                <div className="h-full overflow-hidden flex flex-col">
                    
                    {/* 2. Wrap main content inside PullToRefresh */}
                    <PullToRefresh
                        className="flex-1 flex flex-col relative h-full"
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        success={!isError}
                    >
                        <div className="w-full flex flex-col gap-2">
                            {isLoading ? (
                                <LoadingState message="Loading items..." />
                            ) : isError ? (
                                <ErrorState onRetry={refetch} error="Failed to load items. Please check your network state." />
                            ) : !items || items.length === 0 ? (
                                <EmptyState 
                                    title="No items found" 
                                    description="There are no items registered yet."
                                    action={
                                        <Button onClick={() => console.log("Create Item")}>
                                            <Plus />
                                            New Item
                                        </Button>
                                    }
                                />
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {items.map(item => (
                                        <div key={item.id} className="p-3 border rounded-xl">
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PullToRefresh>
                </div>
            </PageContent>
        </Page>
    );
}
```

---

## Best Practices & Gotchas

1. **Height & Scroll Optimization (CRITICAL)**: 
   To ensure that drag gestures register correctly, the `PullToRefresh` wrapper must reside inside a parent layout that limits height and prevents outer overflow. 
   - **Parent**: Add `className="h-full overflow-hidden flex flex-col"` to the direct parent `div` of `PullToRefresh` (usually the immediate child of `<PageContent>`).
   - **PullToRefresh**: Always pass `className="flex-1 flex flex-col relative h-full"` to the `<PullToRefresh>` component itself.
2. **Complete Async State Handling**:
   Always ensure the `refreshing` state toggles back to `false` even if the refetch query fails. Wrapping the toggle in a `try...finally` block or completing it after the `await` statement is highly recommended to avoid infinite loading spinners.
3. **Synchronize Success States**:
   Pass `success={!isError}` so that the pull spinner cleanly transitions to a premium success animation mark upon positive query completions.
