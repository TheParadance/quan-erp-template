# Responsive View Development Standards

This document defines the patterns for building responsive pages in Quan ERP, ensuring a seamless transition between desktop data management and mobile-first productivity.

## 1. Core Principles

- **Desktop**: Optimized for high-density data management (DataTables, toolbars, side panels).
- **Mobile**: Optimized for readability and quick actions (Card lists, FABs, simplified headers).
- **No Placeholders**: Never hide content entirely on mobile; transform it into a mobile-appropriate format.

## 2. Detection & State

Always use the standard `useMediaQuery` hook with `SCREENS.md` as the breakpoint for "Mobile" (everything smaller than tablet).

```tsx
import { useMediaQuery, SCREENS } from "@quan-erp/shared-ui";

export function MyPage() {
    const isMobile = useMediaQuery(SCREENS.md);
    // ...
}
```

## 3. Layout Structure

### 3.1 Conditional PageTitle
On mobile, the page title usually takes up too much vertical space or is redundant with the navigation header. Use an empty `div` or a simplified header.

```tsx
{isMobile ? <div></div> : (
    <PageTitle>
        <div className="flex items-center justify-between w-full">
            <span>{translation.get("feature", "Feature")}</span>
            <Button onClick={() => setCreateOpen(true)}>
                <Plus /> {translation.get("add", "Add")}
            </Button>
        </div>
    </PageTitle>
)}
```

### 3.2 Content Switcher
The primary pattern is switching between a `DataTable` and a custom list of cards inside `PageContent`.

```tsx
<PageContent>
    {isMobile ? (
        <MobileListView data={data} isLoading={isLoading} />
    ) : (
        <DataTable columns={columns} data={data} />
    )}
</PageContent>
```

## 4. Mobile List Pattern (The "Cupertino Card")

Mobile data should be presented in cards with specific aesthetics to match the "premium" system design.

### Styling Requirements:
- **Container**: `bg-card`, `p-4`, `rounded-3xl`, `cupertino-corner`, `border`, `shadow-sm`.
- **Spacing**: `flex flex-col gap-3`.
- **Interaction**: Use `Button` with `variant="ghost"` and `size="icon"` for row-level actions.

### Implementation Example:
```tsx
data?.list.map((item) => (
    <div key={item.id} className="bg-card p-4 rounded-3xl cupertino-corner border border-border/50 shadow-sm flex flex-col gap-3">
        {/* Header: Title and Primary Action */}
        <div className="flex items-center justify-between">
            <span className="font-bold text-base">{item.name}</span>
            <ItemEditDialog item={item} trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                </Button>
            } />
        </div>
        
        {/* Middle: Badges and Tags */}
        <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{item.status}</Badge>
        </div>
        
        {/* Footer: Stats and Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/30">
            <div className="flex flex-col">
                <span className="text-[0.65rem] uppercase opacity-50 font-bold">Label</span>
                <span className="font-medium text-foreground">{item.value}</span>
            </div>
        </div>
    </div>
))
```

## 5. Complete Integrated Pattern

Building a fully responsive page requires integrating navigation visibility and mobile-only actions. This ensures the UI adapts to the user's specific context (e.g., whether the page is a root tab in the bottom navigation).

### Standard Integrated Setup
This example demonstrates the combination of Responsive Card Lists, [Bottom Nav Visibility Management](./bottom-nav-visilibility-management.md), and [Floating Action Buttons (FABs)](./how-to-add-floating-action-button.md).

```tsx
export function MyResponsivePage() {
    const isMobile = useMediaQuery(SCREENS.md);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // 1. Determine if this page is a pinned tab in the bottom nav
    const isContainInBottomNav = useIsContainInBottomNavBar(`/${metadata.name}/my-page`);

    return (
        <Page
            navMenu={{
                menuTitle: <PageNavTitle>My Page</PageNavTitle>,
                // 2. Hide back button if pinned in bottom nav
                leadingBackButton: isContainInBottomNav ? false : isMobile
            }}
            bottomNav={{
                // 3. Control bottom bar visibility
                visible: isContainInBottomNav
            }}
        >
            {/* 4. Hide PageTitle on mobile to save space when using FAB */}
            {isMobile ? <div></div> : (
                <PageTitle>
                    <div className="flex justify-between items-center">
                        <span>{translation.get("title", "Desktop Title")}</span>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus /> {translation.get("new", "New")}
                        </Button>
                    </div>
                </PageTitle>
            )}

            <PageContent>
                {/* 5. Switch between List and DataTable */}
                {isMobile ? (
                    <div className="flex flex-col gap-4 pb-20">
                        {/* Mobile list items here */}
                    </div>
                ) : (
                    <DataTable ... />
                )}

                {/* 6. Mobile-Only FAB */}
                {isMobile && (
                    <FloatingActionButton
                        // 7. Adjust position to avoid overlap with bottom nav
                        className={cn("absolute", isContainInBottomNav ? "bottom-25" : "bottom-5")}
                        adaptivePosition={true}
                        expandable={false}
                    >
                        <FloatingButton>
                            <Button size="icon-lg" onClick={() => setIsCreateOpen(true)}>
                                <Plus />
                            </Button>
                        </FloatingButton>
                    </FloatingActionButton>
                )}

                {/* 8. Shared Dialog Instance */}
                <MyCreateDialog 
                    open={isCreateOpen} 
                    onOpenChange={setIsCreateOpen} 
                    trigger={<div></div>} 
                />
            </PageContent>
        </Page>
    );
}
```

## 6. Integration Rationale

1.  **Bottom Nav Visibility**: Root-level pages (`isContainInBottomNav` is true) keep the navigation bar visible and hide the back button. Sub-pages hide the bar and show a back button.
2.  **FAB Positioning**: FABs must use `bottom-25` when `isContainInBottomNav` is true to stay above the navigation bar, otherwise they sit at `bottom-5`.
3.  **Decoupled Dialogs**: Using a shared state (`isCreateOpen`) allows the desktop header button and the mobile FAB to trigger the exact same dialog instance, preventing state fragmentation.
4.  **Content Spacing**: Mobile lists must use `pb-20` (or similar) to ensure the bottom navigation bar or FAB doesn't obscure the final list item.

## 7. UX Checklist for Mobile Views

1. [ ] **Cupertino Corners**: Are cards using `rounded-3xl` and `cupertino-corner`?
2. [ ] **Bottom Spacing**: Does the list have `pb-20` or similar to prevent the FAB/BottomBar from covering the last item?
3. [ ] **Touch Targets**: Are buttons at least `h-8 w-8`?
4. [ ] **Contrast**: Are labels using `text-[0.65rem] uppercase opacity-50` for secondary metadata?
5. [ ] **Transitions**: Are loading states handled with `Spinner` or `Skeleton`?

## See Also
- [How to Add Floating Action Button (FAB)](./how-to-add-floating-action-button.md)
- [Bottom Navigation Visibility Management](./bottom-nav-visilibility-management.md)
