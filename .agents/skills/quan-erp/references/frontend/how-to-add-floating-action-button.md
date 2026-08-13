# How to Add Floating Action Button (FAB)

The Floating Action Button (FAB) is used to provide quick access to primary actions on mobile devices.

> [!IMPORTANT]
> **Mobile-First Action**: In the Quan ERP ecosystem, the FAB is strictly a mobile UI pattern. It should **ALWAYS** be wrapped in an `isMobile` check and hidden on desktop to maintain a clean, professional interface. Desktop actions should remain in the standard page title area or data table toolbars.

It is typically rendered conditionally based on the `isMobile` state and positioned at the bottom of the screen.

## 1. Core Components

Import the following components from `@quan-erp/shared-ui`:

```tsx
import { 
    FloatingActionButton, 
    FloatingButton, 
    FloatingContainer,
    Button,
    SCREENS,
    useMediaQuery,
    cn
} from "@quan-erp/shared-ui";
import { useIsContainInBottomNavBar } from "@quan-erp/base-frontend";
```

The `isMobile` flag is typically derived using the `useMediaQuery` hook:

```tsx
const isMobile = useMediaQuery(SCREENS.md);
```

The `isContainInBottomNav` flag is used to adjust the FAB's position to avoid overlapping with the bottom navigation bar. It is derived from the `useIsContainInBottomNavBar` hook. See [Bottom Nav Visibility Management](./bottom-nav-visilibility-management.md) for more details.

```tsx
import { useIsContainInBottomNavBar } from "@quan-erp/base-frontend";

const isContainInBottomNav = useIsContainInBottomNavBar(`/${metadata.name}/my-page`);
```

## 2. Single Button Pattern

Use this for a single primary action. Set `expandable={false}` to disable the expansion animation.

```tsx
{isMobile && (
    <FloatingActionButton
        // Position dynamically based on whether a bottom nav is present
        className={cn("absolute", isContainInBottomNav ? "bottom-25" : 'bottom-5')}
        adaptivePosition={true}
        expandable={false}
    >
        <FloatingButton>
            <Button size={'icon-lg'} onClick={() => handleCreate()}>
                <Plus />
            </Button>
        </FloatingButton>
    </FloatingActionButton>
)}
```

## 3. Multi-Button (Expandable) Pattern

Use this when you have multiple related actions. The FAB will expand horizontally when tapped.

```tsx
{isMobile && (
    <FloatingActionButton
        rowSpan={2} // Number of buttons in the container
        expandClassName="w-[15rem]" // Width of the expanded container
        adaptivePosition={true}
        className={cn("absolute", isMinimize ? "bottom-5" : 'bottom-25')}
    >
        <FloatingButton>
            <Plus />
        </FloatingButton>
        <FloatingContainer>
            <Button className="w-full h-full" onClick={() => actionOne()}>
                <Plus />
                {translation.get("actionOne", "Action One")}
            </Button>
            <Button className="w-full h-full" onClick={() => actionTwo()}>
                <Pencil />
                {translation.get("actionTwo", "Action Two")}
            </Button>
        </FloatingContainer>
    </FloatingActionButton>
)}
```

## 4. Key Props Reference

### `FloatingActionButton`
- **`className`**: Standard CSS positioning. Use `bottom-25` if the bottom navigation bar is visible to avoid overlap, and `bottom-5` otherwise.
- **`adaptivePosition`**: Set to `true` to enable automatic positioning adjustments.
- **`expandable`**: Defaults to `true`. Set to `false` for a simple, non-expanding button.
- **`rowSpan`**: Required for multi-button FABs. Specifies the number of items in the `FloatingContainer`.
- **`expandClassName`**: Tailwind width class for the expanded state (e.g., `w-[15rem]`).

### `FloatingButton`
The trigger element. For single buttons, it usually wraps a `Button` component. For expandable FABs, it usually contains just an icon (like `Plus`).

### `FloatingContainer`
Wraps the list of buttons that appear when an expandable FAB is active.

## 5. Decoupled Dialog Pattern (Best Practice)

When using a FAB to trigger a dialog (e.g., a "Create" form), avoid wrapping the `DialogTrigger` directly inside the FAB. Instead, use a **state-controlled dialog** pattern. This allows a single dialog instance to be shared between the desktop top-bar button and the mobile FAB.

### Implementation Steps:

1.  **State Management**: Create a state variable (e.g., `isCreateOpen`) in the page component.
2.  **Desktop Trigger**: Add a standard `Button` in the `<PageTitle>` that sets the state to `true`.
3.  **Mobile Trigger**: Add a `Button` inside the `FloatingButton` that also sets the state to `true`.
4.  **Dialog Instance**: Place the dialog component at the bottom of the `<PageContent>`, passing the `open` and `onOpenChange` props.

### Standard Implementation Example:

```tsx
export function MyPage() {
    const isMobile = useMediaQuery(SCREENS.md);
    const isContainInBottomNav = useIsContainInBottomNavBar(`/${metadata.name}/my-page`);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <Page ...>
            {/* 1. Hide PageTitle on mobile to save vertical space */}
            {isMobile ? <div></div> : (
                <PageTitle>
                    <div className="flex justify-between items-center">
                        <span>{translation.get("myPage", "My Page")}</span>
                        {/* Desktop Trigger */}
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus /> {translation.get("create", "Create")}
                        </Button>
                    </div>
                </PageTitle>
            )}
            
            <PageContent>
                <DataTable ... />
                
                {/* 2. Mobile FAB Trigger */}
                {isMobile && (
                    <FloatingActionButton
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

                {/* 3. Centralized Dialog Instance */}
                <MyCreateDialog 
                    open={isCreateOpen} 
                    onOpenChange={setIsCreateOpen} 
                    // Pass an empty div as trigger to disable internal trigger management
                    trigger={<div></div>} 
                />
            </PageContent>
        </Page>
    );
}
```

## 6. Best Practices Summary

- **Mobile Only**: Always wrap FABs in an `isMobile` check.
- **Vertical Space**: Hide the `<PageTitle>` on mobile when using a FAB to provide more room for content.
- **Positioning**: Use the `isContainInBottomNav` state to shift the FAB up (`bottom-25`) or down (`bottom-5`).
- **Decoupling**: Separate the dialog trigger from the dialog instance. Use a single state-controlled dialog shared by both desktop and mobile UI elements.
- **Empty Trigger**: When using the decoupled pattern, pass `trigger={<div></div>}` to the dialog component to prevent it from rendering its own default trigger button.
