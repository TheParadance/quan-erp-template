# Frontend Page Standard

To maintain a consistent UI and integration with the system's navigation and layout, every page in a Quan ERP plugin must follow the `<Page>` component standard.

## Standard Structure

Every page component's return value should follow this hierarchy:

```tsx
<Page pluginName={metadata.name} 
    navMenu={{
        menuTitle: <PageNavTitle>Menu Title</PageNavTitle>,
        leadingBackButton: true | false
    }}
    bottomNav={{
        visible: true | false
    }}
    className="w-full h-full overflow-y-auto"
>
    <PageTitle>
        {/* Page label */}
    </PageTitle>
    <PageContent>
        {/* Main Content, Tables, Lists, Forms */}
        {/* Dialogs / Sheets MUST live here, not as siblings under <Page> */}
    </PageContent>
</Page>
```

> [!IMPORTANT]
> **Dialogs under `PageContent`:** Always nest `<Dialog>`, `<Sheet>`, and similar overlays **inside** `<PageContent>`. Do not place them as siblings after `</PageContent>`.

---

## Component API Reference

### 1. `<Page>`
The root container that handles layout, navigation registration, and theme integration.

**Key Props:**
- **`pluginName`**: (Required) The name of the plugin, usually imported from `module.metadata.json`.
- **`navMenu`**: Configuration for the top navigation bar.
    - `menuTitle`: JSX element for the title (usually wrapped in `<PageNavTitle>`).
- **`bottomNav`**: Configuration for the bottom navigation bar (commonly used in mobile views).
    - `visible`: Set to `false` to hide the bottom navigation.

### 2. `<PageTitle>`
Defines the header area of the page. This area remains visible during scrolling in some layouts.
- Use it to display the page title.
- Place primary action buttons (e.g., "Add New", "Save") and compact page toolbars (search, filters, spot price) here for consistent positioning.
- Preferred title shell (no wrap on the trailing controls row):

```tsx
<PageTitle>
    <div className="flex items-center gap-2 justify-between">
        <div className="w-full">{/* title */}</div>
        <div className="flex items-center justify-end gap-2">
            {/* compact filters / primary actions — do not use flex-wrap */}
        </div>
    </div>
</PageTitle>
```

### 3. `<PageContent>`
The main container for the page logic and data display.
- All primary UI elements (Tables, Cards, Forms) should be placed inside this component.
- **Dialogs / sheets must be children of `<PageContent>`** — never siblings of `<PageContent>` under `<Page>`, and never only under `<PageTitle>`. Put `<Dialog>`, `<Sheet>`, and similar overlays at the end of `<PageContent>` (after the main content).

```tsx
<Page ...>
    <PageTitle>{/* ... */}</PageTitle>
    <PageContent>
        {/* Main Content, Tables, Lists, Forms */}
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>{/* ... */}</DialogContent>
        </Dialog>
    </PageContent>
</Page>
```

**Incorrect** (dialog outside `PageContent`):

```tsx
<Page ...>
    <PageTitle>{/* ... */}</PageTitle>
    <PageContent>{/* ... */}</PageContent>
    <Dialog open={open} onOpenChange={setOpen}>{/* ... */}</Dialog>
</Page>
```

### 4. `<PullToRefresh>`
A premium gesture-driven container wrapper for lists, tables, and grids, optimized for mobile pull-to-refresh touch gestures and desktop scroll behaviors. It integrates with loading and error states to provide a native-feeling UX.
- Always imported from `@quan-erp/shared-ui`.
- For detailed information about props, state synchronization, and a full integration example, please refer to the **[PullToRefresh Reference](./pull-to-refresh.md)**.

---

## Full Usage Example

This example demonstrates a standard page using proper localization, title actions, and integration with the `@quan-erp/shared-ui` loading, error, and empty states based on standard query conditions.

```tsx
import { 
    Page, 
    PageTitle, 
    PageContent, 
    PageNavTitle, 
    Button, 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    useLocaleTranslation,
    LoadingState,
    ErrorState,
    EmptyState
} from "@quan-erp/shared-ui";
import { Plus } from "@icon-park/react";
import { useItemsQuery } from "./api/items.api"; // Custom React Query hook
import { MyPluginLocale } from "./locale"; // Localized dictionary
import metadata from "../../module.metadata.json" with { type: "json" };

export default function MyPluginPage() {
    const translation = useLocaleTranslation(MyPluginLocale);
    const { data: items, refetch, isLoading, isError } = useItemsQuery();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <Page
            pluginName={metadata.name}
            navMenu={{
                menuTitle: (
                    <PageNavTitle>
                        {translation.get("management-title", "Management Title")}
                    </PageNavTitle>
                ),
            }}
            bottomNav={{ visible: false }}
        >
            <PageTitle>
                <div className="flex items-center gap-2 justify-between">
                    <div className="w-full text-xl font-bold">
                        {translation.get('page-title', 'Overview')}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus theme="outline" size="24" fill="#fff" />
                            {translation.get('new-action', 'Create New')}
                        </Button>
                    </div>
                </div>
            </PageTitle>

            <PageContent>
                <div className="w-full flex flex-col gap-2">
                    {isLoading ? (
                        <LoadingState message={translation.get('loading-msg', 'Loading items...')} />
                    ) : isError ? (
                        <ErrorState 
                            onRetry={refetch} 
                            error={translation.get('error-msg', 'Failed to load items. Please check your network state.')} 
                        />
                    ) : !items || items.length === 0 ? (
                        <EmptyState
                            title={translation.get('empty-title', 'No items found')}
                            description={translation.get('empty-desc', 'There are no items registered yet.')}
                            action={
                                <Button onClick={() => setDialogOpen(true)}>
                                    <Plus />
                                    {translation.get('new-action', 'Create New')}
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

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{translation.get('new-action', 'Create New')}</DialogTitle>
                        </DialogHeader>
                        {/* form fields */}
                    </DialogContent>
                </Dialog>
            </PageContent>
        </Page>
    );
}
```

---

## Best Practices

1.  **Mobile Awareness**: Use the `isMobile` hook or CSS utilities to adjust `<PageTitle>` content for smaller screens.
2.  **Consistent Actions**: Always put your page's primary "CTA" (Call to Action) in the `<PageTitle>` section so users can easily find it on any page.
3.  **Metadata Injection**: Always pass `metadata.name` to the `pluginName` prop to ensure the system correctly associates the page with its parent plugin.
4.  **Dialogs under `PageContent`**: Every `<Dialog>`, `<Sheet>`, or equivalent overlay must be nested inside `<PageContent>`, not as a sibling under `<Page>`.

