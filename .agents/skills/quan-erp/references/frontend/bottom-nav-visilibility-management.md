# Bottom Navigation Visibility Management

In a modular ERP system, not all pages should be visible in the mobile bottom navigation bar at all times. Managing visibility is crucial to simulate a native app-like experience where only "root" tabs are shown in the bottom bar, and sub-pages or non-pinned features hide it to provide more screen space and use a back button instead.

## 1. Checking Visibility State

Use the `useIsContainInBottomNavBar` hook from `base/frontend` to determine if the current page is one of the tabs configured by the user to appear in the bottom navigation bar.

```tsx
import { useIsContainInBottomNavBar } from "@quan-erp/base-frontend";

export function MyFeaturePage() {
    // Pass the base route of your feature
    const isContainInBottomNav = useIsContainInBottomNavBar('/my-feature');
    
    // ...
}
```

## 2. Configuring the Page Component

The `<Page>` component from `@quan-erp/shared-ui` handles the layout for both mobile and desktop. You should pass the visibility state to the `bottomNav` and `navMenu` props.

### Standard Implementation Pattern

```tsx
import { Page, PageContent, PageNavTitle, useMediaQuery, SCREENS } from "@quan-erp/shared-ui";
import { useIsContainInBottomNavBar } from "@quan-erp/base-frontend";
import metadata from '../../../module.metadata.json' with { type: 'json' }

export function MyFeaturePage() {
    const isMobile = useMediaQuery(SCREENS.md);
    const isContainInBottomNav = useIsContainInBottomNavBar(`/${metadata.name}/my-feature`);

    return (
        <Page
            navMenu={{
                menuTitle: <PageNavTitle>My Feature</PageNavTitle>,
                // Show back button only on mobile AND if the page is NOT in the bottom nav tabs
                leadingBackButton: isContainInBottomNav ? false : isMobile
            }}
            bottomNav={{
                // Show bottom nav only if this page is registered as a pinned tab
                visible: isContainInBottomNav
            }}
        >
            <PageContent>
                {/* Your content here */}
            </PageContent>
        </Page>
    );
}
```

## 3. Impact on UI Layout (FAB Positioning)

The visibility of the bottom navigation bar directly impacts the positioning of other mobile-first elements, specifically **Floating Action Buttons (FABs)**.

When a page is in the bottom nav, you must shift the FAB up to avoid overlapping with the navigation bar.

### Positioning Pattern:

- **Visible Bottom Nav**: Use `bottom-25` (shorthand for 6.25rem/100px) to clear the bar.
- **Hidden Bottom Nav**: Use `bottom-5` (standard margin) when the bar is absent.

```tsx
<FloatingActionButton
    className={cn(
        "absolute", 
        isContainInBottomNav ? "bottom-25" : "bottom-5"
    )}
    // ...
/>
```

## 4. Rationale

- **Root Tabs**: If a page is pinned to the bottom nav (`isContainInBottomNav` is true), it acts as a top-level destination. The bottom nav should remain visible, and the back button should be hidden (as the user uses the tabs to switch context). FABs must be positioned higher.
- **Sub-pages**: If a page is NOT pinned (`isContainInBottomNav` is false), it is treated as a sub-page. The bottom nav is hidden to maximize vertical space, and a back button is shown in the top navigation bar. FABs can sit closer to the bottom edge.

This pattern ensures that the user interface remains clean, accessible, and intuitive across different user configurations and device types.
