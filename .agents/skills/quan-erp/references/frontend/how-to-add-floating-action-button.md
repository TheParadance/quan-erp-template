# How to Add Floating Action Button (FAB)

The Floating Action Button (FAB) is used to provide quick access to primary actions on mobile devices.

> [!IMPORTANT]
> **Mobile-First Action**: In the Quan ERP ecosystem, the FAB is strictly a mobile UI pattern. It should **ALWAYS** be wrapped in an `isMobile` check and hidden on desktop to maintain a clean, professional interface. Desktop actions should remain in the standard page title area or data table toolbars.

> [!IMPORTANT]
> **Bottom Nav Check (required)**: Whenever you add a FAB, you **MUST** also wire `useIsContainInBottomNavBar` and position the FAB from that flag. Never hardcode `bottom-5` / `bottom-25` / `md:hidden` alone.
>
> 1. Pass `pluginName={metadata.name}` on `<FloatingActionButton>` — the FAB renders in a **Portal**, so without `data-plugin` the plugin-scoped Tailwind classes (`bottom-25`, etc.) do **not** apply and the default `shared:bottom-0` wins.
> 2. Call `useIsContainInBottomNavBar(\`/${metadata.name}/item\`)` with the **same menu path** registered in `AppRegistry.menu` (e.g. plugin `my-plugin` → `/my-plugin/item`).
> 3. Pass `bottomNav={{ visible: isContainInBottomNav }}` on `<Page>` (and `leadingBackButton: isContainInBottomNav ? false : isMobile`).
> 4. Set FAB `className` with `cn("absolute", isContainInBottomNav ? "!bottom-25" : "!bottom-5")`.
>    - Use `!` so the class wins over FAB’s default `shared:bottom-0`.
>    - **Pinned in bottom nav** → `!bottom-25` (clear the bar).
>    - **Not pinned** → `!bottom-5` (bar is hidden via `Page`).
>
> See [Bottom Nav Visibility Management](./bottom-nav-visilibility-management.md) and [CSS Styling](./css-styling.md) (portaled `pluginName`).

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

**Required** — bottom-nav membership for this page route:

```tsx
// metadata.name === "my-plugin"
const isContainInBottomNav = useIsContainInBottomNavBar(`/${metadata.name}/item`);
```

## 2. Single Button Pattern

Use this for a single primary action. Set `expandable={false}` to disable the expansion animation.

```tsx
{isMobile && (
    <FloatingActionButton
        pluginName={metadata.name}
        className={cn(
            "absolute",
            isContainInBottomNav ? "!bottom-25" : "!bottom-5",
        )}
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

Use this when you have multiple related actions. The FAB will expand horizontally when tapped. Still apply the bottom-nav offset; do not replace it with unrelated minimize logic unless that logic also reflects whether the bottom nav is visible.

```tsx
{isMobile && (
    <FloatingActionButton
        pluginName={metadata.name}
        rowSpan={2} // Number of buttons in the container
        expandClassName="w-[15rem]" // Width of the expanded container
        adaptivePosition={true}
        className={cn(
            "absolute",
            isContainInBottomNav ? "!bottom-25" : "!bottom-5",
        )}
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
- **`className`**: Must include bottom offset from `isContainInBottomNav`: `!bottom-25` when the page is a pinned bottom-nav tab, `!bottom-5` otherwise. Prefer `!` so positioning is not overridden by the component’s default `shared:bottom-0`.
- **`adaptivePosition`**: Set to `true` to enable automatic left/right hand positioning.
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
    // metadata.name === "my-plugin" → path "/my-plugin/item"
    const isContainInBottomNav = useIsContainInBottomNavBar(`/${metadata.name}/item`);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <Page
            pluginName={metadata.name}
            navMenu={{
                menuTitle: <PageNavTitle>My Items</PageNavTitle>,
                leadingBackButton: isContainInBottomNav ? false : isMobile,
            }}
            bottomNav={{ visible: isContainInBottomNav }}
        >
            {/* 1. Hide PageTitle on mobile to save vertical space */}
            {isMobile ? <div></div> : (
                <PageTitle>
                    <div className="flex justify-between items-center">
                        <span>{translation.get("myItems", "My Items")}</span>
                        {/* Desktop Trigger */}
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus /> {translation.get("create", "Create")}
                        </Button>
                    </div>
                </PageTitle>
            )}
            
            <PageContent>
                <DataTable ... />
                
                {/* 2. Mobile FAB Trigger — bottom offset from bottom-nav check */}
                {isMobile && (
                    <FloatingActionButton
                        pluginName={metadata.name}
                        className={cn(
                            "absolute",
                            isContainInBottomNav ? "!bottom-25" : "!bottom-5",
                        )}
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

## 6. Agent Checklist (FAB)

When adding or editing a FAB, verify all of the following:

1. [ ] `pluginName={metadata.name}` on `<FloatingActionButton>` (Portal — required for scoped `bottom-*` classes).
2. [ ] `isMobile` guard (`useMediaQuery(SCREENS.md)`); no FAB on desktop.
3. [ ] `useIsContainInBottomNavBar(\`/${metadata.name}/item\`)` present — path matches menu registration (e.g. `/my-plugin/item`).
4. [ ] `<Page bottomNav={{ visible: isContainInBottomNav }} />` and matching `leadingBackButton`.
5. [ ] FAB `className` uses `isContainInBottomNav ? "!bottom-25" : "!bottom-5"` (with `!`).
6. [ ] Dialog (if any) is state-controlled and shared with desktop actions.

## 7. Best Practices Summary

- **Mobile Only**: Always wrap FABs in an `isMobile` check.
- **pluginName**: Always pass `pluginName={metadata.name}` — FAB is portaled; scoped bottom offset classes need `data-plugin`.
- **Bottom Nav Check**: Always derive FAB bottom offset from `useIsContainInBottomNavBar`; keep `<Page bottomNav>` in sync.
- **Vertical Space**: Hide the `<PageTitle>` on mobile when using a FAB to provide more room for content.
- **Positioning**: Pinned tab → `!bottom-25`; not pinned → `!bottom-5`. Force with `!` against FAB default `bottom-0`.
- **Decoupling**: Separate the dialog trigger from the dialog instance. Use a single state-controlled dialog shared by both desktop and mobile UI elements.
- **Empty Trigger**: When using the decoupled pattern, pass `trigger={<div></div>}` to the dialog component to prevent it from rendering its own default trigger button.
