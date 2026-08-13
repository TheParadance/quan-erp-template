# Shared UI Reference (`@quan-erp/shared-ui`)

The `@quan-erp/shared-ui` package is the core design system for Quan ERP plugins. It is built on top of **Shadcn UI** and provides a consistent, premium look across the entire platform.

> [!WARNING]
> **RequestDto and ResponseDto Imports**:
> Do **NOT** import `RequestDto` or `ResponseDto` from `@quan-erp/shared-ui`. These are backend data-transfer models and are exported exclusively from:
> ```typescript
> import { RequestDto, ResponseDto } from "@quan-erp/shared-frontend-core";
> ```

## Shadcn UI Integration

`@quan-erp/shared-ui` bundles all standard Shadcn UI components. You should always import these from `@quan-erp/shared-ui` instead of installing individual Shadcn components in your plugin.

Common components available include:
- **Layout**: `Table`, `Sheet`, `Dialog`, `Card`, `Tabs`.
- **Forms**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `FormDescription`, `Button`, `Input`, `Select`, `Checkbox`, `Switch`, `Label`, `Field` (layout helper only — prefer the `Form*` stack for validated forms).
- **Feedback**: `Badge`, `Toast`, `Skeleton`, `Alert`.
- **Navigation**: `DropdownMenu`, `NavigationMenu`.

## Forms (standard pattern)

For **all** plugin forms (admin dialogs, settings, public login/signup), use the full Shadcn form stack from `@quan-erp/shared-ui` with `react-hook-form` + `zod` + `@hookform/resolvers/zod`.

> [!IMPORTANT]
> **Do NOT** build forms with only `useForm` + `register()` on `Field`/`Input`. Always wrap with `<Form {...form}>`, use `FormField` + `FormControl`, and render `FormMessage` so validation errors are visible.

**Required pieces:**
- `Form` — spreads the `useForm` return value (`<Form {...form}>`)
- `FormField` — binds `control` + `name` via render prop
- `FormItem` / `FormLabel` / `FormControl` / `FormMessage`
- `zod` schema + `zodResolver` for validation
- Plugin deps: `react-hook-form`, `zod`, `@hookform/resolvers`

**Example:**

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@quan-erp/shared-ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function ExampleForm({ onSubmit }: { onSubmit: (v: FormValues) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

Localize Zod messages with `translation.get(...)` when the form uses i18n (prefer `useMemo` for the schema when messages depend on the translation object).

## Utilities

### `cn(...inputs)`

`cn` is the standard class-name helper (clsx + tailwind-merge) exported from `@quan-erp/shared-ui`. Use it whenever you compose conditional Tailwind classes.

```tsx
import { cn } from "@quan-erp/shared-ui";

<button
  className={cn(
    "rounded-full px-3 py-2 text-sm transition",
    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
  )}
/>
```

> [!IMPORTANT]
> **ALWAYS** use `cn` from `@quan-erp/shared-ui` for conditional `className` values. Do **NOT** use template-literal concatenation (e.g. `` className={`base ${active ? "a" : "b"}`} ``), and do **NOT** import `clsx` / `tailwind-merge` / `cn` from other packages.

## Specialized ERP Components

In addition to standard Shadcn components, `@quan-erp/shared-ui` includes specialized components designed for ERP workflows:

### Responsive Dialog & Sheet
Combined components that automatically adapt between Dialog (Desktop) and Drawer (Mobile) or can be forced to a specific type like `SHEET`.

- `ResponsiveDialog`
- `ResponsiveContent`
- `ResponsiveHeader`
- `ResponsiveTitle`
- `DesktopDialogType` (Enum: `DIALOG`, `SHEET`, `MODAL`)

**UncontrolledResponsiveDialog**
A variation that manages its own `open` state internally and exposes control via a `ref`.

- `UncontrolledResponsiveDialog`

**When to use `UncontrolledResponsiveDialog`:**
Use this when you want to **prevent the parent component from re-rendering** every time the dialog opens or closes. Instead of keeping a `const [isOpen, setIsOpen] = useState(false)` in the parent (which triggers a re-render of the entire parent when changed), you can pass a `ref` to the dialog and call `ref.current?.open()` or `ref.current?.close()`. This is particularly useful in complex forms or pages where re-renders are expensive.

**Example Usage (`branch-form.tsx` style):**
```tsx
import { useRef } from "react";
import { Button, UncontrolledResponsiveDialog, ResponsiveContent, type ResponsiveDialogRefType } from "@quan-erp/shared-ui";

export function MyPage() {
    const dialogRef = useRef<ResponsiveDialogRefType>(null);

    return (
        <div>
            {/* Calling open() does not re-render MyPage */}
            <Button onClick={() => dialogRef.current?.open()}>Open Dialog</Button>
            
            <UncontrolledResponsiveDialog ref={dialogRef}>
                <ResponsiveContent>
                    <h2>Dialog Content</h2>
                    <Button onClick={() => dialogRef.current?.close()}>Close</Button>
                </ResponsiveContent>
            </UncontrolledResponsiveDialog>
        </div>
    );
}
```

### Responsive Calendar (Popover / Drawer)
The `Calendar` component extends Shadcn UI's standard calendar with built-in responsive wrappers (Popover for desktop, Drawer for mobile) and a custom scrollable Month/Year selector.

**Key Custom Props:**
- `type`: `'raw' | 'popover' | 'drawer' | 'automatic'` (Default: `'raw'`). Using `'automatic'` renders a Drawer on mobile and a Popover on desktop.
- `trigger`: The React node that triggers the overlay (required if `type` is not `'raw'`).

**Example Usage:**
```tsx
import { Calendar, Button } from "@quan-erp/shared-ui";
import { Calendar as CalendarIcon } from "lucide-react";

// Raw calendar (standard Shadcn behavior)
<Calendar mode="single" selected={date} onSelect={setDate} />

// Automatic responsive calendar (Popover on Desktop, Drawer on Mobile)
<Calendar
    type="automatic"
    mode="single"
    selected={date}
    onSelect={setDate}
    trigger={
        <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? date.toLocaleDateString() : "Pick a date"}
        </Button>
    }
/>
```

### Localization Hooks
Tools to handle multi-language support within the UI. Prefer lazy APIs for new work. Full guide: **[Frontend Localization](../frontend/localization.md)**.

| API | Locale source | Notes |
|---|---|---|
| `useLazyLocaleTranslation(loaders, fallback?)` | `setting.locale` | Preferred for authenticated pages. Returns `{ get, isLoading }`. |
| `usePublicLazyLocaleTranslation(loaders, locale?)` | Explicit `locale` arg | Preferred for public / pre-login pages. Returns `{ get, isLoading }`. |
| `useLocaleTranslation(localeObject, fallback?)` | `setting.locale` | Sync / legacy. Returns `{ get }`. |
| `usePublicLocaleTranslation(localeObject, locale?)` | Explicit `locale` arg | Sync / legacy for public pages. Returns `{ get }`. |
| `getLocaleString({ locale, setting, key, defaultValue })` | Explicit args | Non-hook helper. |

**`get` signature (all hooks):**
`get(key: string, defaultValue: string, data?: Record<string, string>): string`

Supports `{{var}}` interpolation via the optional `data` map.

**Authenticated (lazy):**
```tsx
import { useLazyLocaleTranslation } from "@quan-erp/shared-ui";

const translation = useLazyLocaleTranslation(MyLocaleLazy);
translation.get("save", "Save");
translation.get("welcome-user", "Welcome, {{name}}", { name: "Ada" });
```

**Public / pre-login (lazy):**
```tsx
import { usePublicLazyLocaleTranslation } from "@quan-erp/shared-ui";

const translation = usePublicLazyLocaleTranslation(LoginLocaleLazy, 'my-MM');
```

### Pull-To-Refresh & Standard Layout States
Container and helper components to provide fluid scrolling gestures and standard data query states (loading, error, empty lists).

- `PullToRefresh`: Premium gesture-driven scroll wrapper.
- `LoadingState`: Standardized loader spinner card.
- `ErrorState`: Standardized network/API error panel with optional retry callback.
- `EmptyState`: Standardized empty lists landing view with customizable CTA actions.

For detailed props definitions and absolute responsive viewport configuration, refer to the **[PullToRefresh Reference](../frontend/pull-to-refresh.md)**.

## Example Usage

### Example 1: Responsive Dialog with Table

```tsx
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    ResponsiveDialog,
    ResponsiveContent,
    DesktopDialogType,
    useLazyLocaleTranslation
} from "@quan-erp/shared-ui";

// Inside a component
const translation = useLazyLocaleTranslation(MyLocaleLazy);

return (
    <ResponsiveDialog open={open} desktopDialogType={DesktopDialogType.SHEET}>
        <ResponsiveContent>
             <Button variant="primary">
                 {translation.get("submit", "Submit")}
             </Button>
             <Table>
                 {/* ... table content ... */}
             </Table>
        </ResponsiveContent>
    </ResponsiveDialog>
);
```

### Example 2: standard Layout States (Loading, Error, and Empty)

This example shows the standard pattern for rendering loading, error, and empty feedback card overlays during TanStack Query operations.

```tsx
import {
    Button,
    LoadingState,
    ErrorState,
    EmptyState,
    useLazyLocaleTranslation
} from "@quan-erp/shared-ui";
import { Plus } from "@icon-park/react";

// Inside a component
const translation = useLazyLocaleTranslation(MyLocaleLazy);
const { data: items, refetch, isLoading, isError } = useItemsQuery();

return (
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
                    <Button onClick={() => console.log('Action Clicked')}>
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
);
```

## Best Practices
1. **Prefer Shared UI everywhere**: Always check if a component exists in `@quan-erp/shared-ui` before building a custom one or importing from a 3rd party. This applies to **admin pages and public/rootRoute pages alike**.
2. **Replace raw HTML with shared primitives**:
   | Instead of | Use |
   |---|---|
   | `<button>` | `Button`, `ButtonGroup` |
   | `<form>` + bare `<input>` / `register()`-only | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input` (+ Zod) |
   | Hand-rolled panel / white box | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
   | Custom error/empty/loading blocks | `Alert`, `EmptyState`, `LoadingState`, `ErrorState` |
   | Custom list rows | `Item`, `ItemGroup`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions` |
   | Status pills | `Badge` |
3. **Use `cn` for className composition**: Import `cn` from `@quan-erp/shared-ui` for conditional Tailwind classes — never concatenate class strings manually.
4. **Standard Variants**: Use the built-in `variant` and `size` props for consistent styling (e.g., `<Button variant="outline">`).
5. **Accessibility**: Shadcn components are built on Radix UI; ensure you maintain accessibility by using the provided sub-components (e.g., `TableHead`, `TableRow`) correctly.
6. **Forms always show validation**: Every `FormField` should include `FormMessage`. Prefer Zod schemas over ad-hoc `required: true` register rules.

## Custom Hooks

### `useDebounceValue<T>(value: T, delay: number): T`
A utility hook to debounce a value. This is especially useful for server-side search inputs to avoid excessive API calls.

**Parameters:**
- `value`: The value to debounce.
- `delay`: Time in milliseconds to wait before updating the debounced value.

**Example Usage:**
```tsx
import { useDebounceValue } from "@quan-erp/shared-ui";

function SearchComponent() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounceValue(search, 500);

    // This query only fires when the user stops typing for 500ms
    const { data } = useMyQuery(debouncedSearch);

    return (
        <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search..." 
        />
    );
}
```

### `useMediaQuery(breakpoint: number): boolean`
A hook to detect if the window width is below a specific breakpoint.

**Default Breakpoints:**
- `sm`: 640
- `md`: 768 (Default)
- `lg`: 1024
- `xl`: 1280

**Example:**
```tsx
const isMobile = useMediaQuery(768);
```

### `useMobileBackDialog(options)`
Integrates with the browser's history API to allow the physical back button on mobile devices to close a dialog instead of navigating away from the page.

**Options:**
- `open`: boolean - Current state of the dialog.
- `onOpenChange`: function - Callback to update the state.
- `key`: string (optional) - History state key.
- `enable`: boolean (optional) - Enable/disable the behavior.

**Example:**
```tsx
useMobileBackDialog({
    open,
    onOpenChange: (val) => setOpen(val),
    key: "my-dialog"
});
```

### `useUserHandBehavior(options)`
Detects and tracks user interaction patterns (e.g., left vs right hand usage) using the `UserHandBehaviorDetector`.

**Options:**
- `callback`: `UserHandBehaviorOnChange` - Function called when behavior changes.
- `enable`: boolean (optional) - Enable tracking.
- `delay`: number (optional) - Debounce delay for the detector.

**Example:**
```tsx
useUserHandBehavior({
    callback: (behavior) => console.log("User hand:", behavior),
    delay: 1000
});
```

## System Integration & Extension

### Dashboard Widgets

Plugins can contribute interactive widgets to the global dashboard.

#### 1. Registration (`DashboardItem` inline in `index.tsx`)
Register widgets in your plugin's `index.tsx` entry file. **`DashboardItem` MUST be inlined here** — do not wrap with `DashboardItem` inside the widget component.

```tsx
import { DashboardItem } from "@quan-erp/shared-ui";

AppRegistry.dashboard.add({
    id: "unique-widget-id",
    pluginName: metadata.name,
    element: (
        <DashboardItem
            id="unique-widget-id" // MUST match registration id
            colSpan={2}
            rowSpan={1}
            pluginName={metadata.name}
            requiredApis={[getYourDashboardApi.api]}
        >
            <YourDashboardWidget />
        </DashboardItem>
    ),
});
```

#### 2. Implementation (content only)
Widget components export content only — no `DashboardItem` wrapper.

```tsx
import { useDashboardContext } from "@quan-erp/base-frontend";

export function YourDashboardWidget() {
    const { startDate, endDate } = useDashboardContext();

    return (
        <div className="p-4">
            <h3>Widget Title</h3>
            {/* Widget content */}
        </div>
    );
}
```

### Home Shortcuts

Shortcuts provide quick access to features from the dashboard's home screen.

#### Registration
```tsx
import { getHomeShortcutStore, ShortcutItem } from "@quan-erp/base-frontend";

getHomeShortcutStore().getState().add({
    pluginName: metadata.name,
    id: 'shortcut-id',
    displayName: 'Feature Name',
    component: (
        <ShortcutItem>
            <Icon size={25} />
        </ShortcutItem>
    ),
    toLink: '/app/my-feature',
    async onClick() {
        // Optional logic execution
    }
});
```

### Reports Integration

Plugins can contribute to the global "Reports" section using a standardized hub pattern.

#### Registration
```tsx
AppRegistry.report.add({
  page: <MyModuleReportHub />,
  pluginName: metadata.name,
});
```

#### Recommended Hub Layout
Use a grid of cards to display available reports:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
    <Card className="group hover:shadow-lg transition-all" onClick={() => navigate(path)}>
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10">
                <Icon />
            </div>
            <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>{description}</CardDescription>
        </CardContent>
    </Card>
</div>
```

### Spotlight Search (Cmd + K)

Sportlight search allows users to find navigation items or backend data quickly.

#### Registration
```tsx
import { registerSportlightSearch, SportlightSearchType } from "@quan-erp/base-frontend";
import { CommandItem } from "@quan-erp/shared-ui";

registerSportlightSearch({
    pluginName: metadata.name,
    groupTitle: 'Group Name',
    searchType: SportlightSearchType.SIMPLE_SEARCH, // or FULL_TEXT_SEARCH
    callback: async (query) => [
        {
            priority: 1,
            component: (
                <CommandItem onSelect={() => navigate('/path')}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>Result Title</span>
                </CommandItem>
            )
        }
    ]
});
```

### Floating Action Button (FAB)

The FAB provides quick access to primary actions on mobile. **It must be hidden on desktop.**

#### Implementation Pattern
Use the `isMobile` check and `isContainInBottomNav` state to position the FAB correctly.

```tsx
import { FloatingActionButton, FloatingButton, cn } from "@quan-erp/shared-ui";

{isMobile && (
    <FloatingActionButton
        // Use bottom-25 if bottom nav is visible, bottom-5 otherwise
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
```

> [!TIP]
> **Decoupled Dialog Pattern**: Use a state variable (e.g., `isOpen`) to control a single dialog instance that can be triggered by both a desktop header button and the mobile FAB.

## Styling & CSS Isolation

Quan ERP uses a `[data-plugin]` attribute mechanism to isolate plugin styles and prevent leakage.

### Critical Rules
1. **`pluginName` Prop**: Every `<Page>` component MUST receive the `pluginName` prop.
2. **Portal Content**: Components like Modals, Dialogs, and Sheets are "portaled" to the document root. You MUST apply `data-plugin={metadata.name}` to the root of the portal content (e.g., `<SheetContent data-plugin={metadata.name}>`) to ensure Tailwind styles apply correctly.
3. **Borders**: Always use `border border-border` instead of just `border`.

## API Communication

Plugins communicate with the backend using a shared Axios client.

### Routing Convention
All API requests must be prefixed with the plugin name:
`/<plugin-name>/<controller>/<endpoint>`

```typescript
import { getAxiosClient } from "../lib/axios";

// Example call
const response = await getAxiosClient().get(`/my-plugin/items`);
```

## Recommended Folder Structure

Organizing code by feature ensures maintainability and scalability.

```text
src/
├── components/        # Shared components (e.g., DataTable)
├── lib/               # axios.ts, metadata.ts, etc.
├── page/              # Feature modules
│   ├── <feature>/
│   │   ├── components/     # Sub-components
│   │   ├── <feature>.api.ts      # Axios calls
│   │   ├── <feature>.queries.ts  # React Query hooks
│   │   ├── <feature>.table.tsx   # Main UI component
│   │   └── <feature>.types.ts    # TypeScript interfaces
└── index.tsx          # Main plugin registration
```

## Base Frontend API Summary (`@quan-erp/base-frontend`)

Commonly used APIs and hooks from the base frontend for UI integration:

| API | Type | Description |
| :--- | :--- | :--- |
| `navigate(path)` | Function | Global navigation function (compatible with registry). |
| `useDashboardContext()` | Hook | Access global dashboard date filters. |
| `useIsContainInBottomNavBar(path)` | Hook | Detect if a path should show the mobile bottom navigation bar. |
| `useNavMenuStore()` | Store | Access and control the side navigation menu. |
| `useBottomNavBarStore()` | Store | Control the visibility of the mobile bottom nav bar. |
| `registerSportlightSearch(config)` | Function | Register search providers for global search. |
| `getHomeShortcutStore()` | Function | Access the store for home screen shortcuts. |
