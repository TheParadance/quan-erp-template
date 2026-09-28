# CSS Styling & Isolation

> [!NOTE]
> This document focus on CSS isolation and styling patterns. For a list of available components and their usage, see the [Shared UI Reference](../shared-ui/shared-ui.md).

Quan ERP uses a sophisticated CSS isolation mechanism to ensure that plugin styles (generated via Tailwind CSS) do not leak into the core system or other plugins.

## Isolation Mechanism

During the plugin build process, all Tailwind CSS classes are automatically transformed into scoped selectors using the `[data-plugin]` attribute.

**Example Transformation:**
Original Tailwind class: `.text-xs`
Transformed Selector: 
```css
[data-plugin=my-plugin].text-xs,
[data-plugin=my-plugin] .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height))
}
```

## Mandatory Implementation Steps

### 1. The `<Page>` Component
Every plugin page **MUST** pass the `pluginName` prop to the `<Page>` component. This ensures the page container is tagged with the correct `data-plugin` attribute.

```tsx
import { Page } from "@quan-erp/shared-ui";
import { metadata } from "../lib/metadata";

export default function MyPage() {
    return (
        <Page pluginName={metadata.name}>
            {/* Page Content */}
        </Page>
    );
}
```

### 2. Handling Portals (Modals, Dialogs, Sheets)
Components like Modals, Dialogs, and Sheets are often "portaled" to the document root (outside the `<Page>` hierarchy). Because the CSS selectors strictly require a `[data-plugin]` parent or self-attribute, styles inside these portals will break by default.

> [!IMPORTANT]
> When using Portals, you **MUST** tag the portal root with the plugin:
> - Prefer `pluginName={metadata.name}` on `<ResponsiveContent>`
> - Or `data-plugin={metadata.name}` on `<DialogContent>` / `<SheetContent>`
>
> For `ResponsiveTitle` / `ResponsiveDescription`, always wrap children in a `<div>`.

**Incorrect (Styles will break):**
```tsx
<ResponsiveContent>
  <ResponsiveTitle>{t.get("title", "Title")}</ResponsiveTitle>
  <div className="bg-primary p-4">...</div>
</ResponsiveContent>
```

**Correct (Styles preserved):**
```tsx
<ResponsiveContent pluginName={metadata.name}>
  <ResponsiveTitle>
    <div>{t.get("title", "Title")}</div>
  </ResponsiveTitle>
  <ResponsiveDescription>
    <div>{t.get("description", "Description")}</div>
  </ResponsiveDescription>
  <div className="bg-primary p-4">...</div>
</ResponsiveContent>
```

```tsx
<SheetContent data-plugin={metadata.name}>
    <div className="bg-primary p-4">...</div>
</SheetContent>
```

## Base app theme tokens (predefined)

**Source of truth:** `base/frontend/src/index.css` (mirrored in `shared-ui/src/index.css`). Plugins inherit these in the shell app — do **not** redefine `--background`, `--dialog-background`, etc. unless building a standalone branded public page.

### `@theme inline` → Tailwind utilities

Semantic colors map via `@theme inline` (e.g. `--color-background: var(--background)`). Use Tailwind utilities: `bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.

### `:root` / `.dark` CSS variables

| Variable | Purpose | Tailwind utility (when mapped) |
|----------|---------|--------------------------------|
| `--background` | App/page surface | `bg-background` |
| `--foreground` | Default text | `text-foreground` |
| `--card` / `--card-foreground` | Card surfaces | `bg-card`, `text-card-foreground` |
| `--popover` / `--popover-foreground` | Popover/dropdown surfaces | `bg-popover` |
| `--primary` / `--primary-foreground` | Brand actions | `bg-primary`, `text-primary-foreground` |
| `--secondary` / `--secondary-foreground` | Secondary surfaces | `bg-secondary` |
| `--muted` / `--muted-foreground` | Subtle fills / helper text | `bg-muted`, `text-muted-foreground` |
| `--accent` / `--accent-foreground` | Hover/active accents | `bg-accent` |
| `--destructive` | Errors / delete | `text-destructive`, `bg-destructive` |
| `--border` | Default borders | `border-border` |
| `--input` | Input borders/fills | `border-input` |
| `--ring` | Focus rings | `ring-ring` |
| `--radius` | Corner radius base | `rounded-lg`, etc. via `--radius-*` |
| `--sidebar-*` | Sidebar chrome | `bg-sidebar`, etc. |
| `--chart-1` … `--chart-5` | Charts | `bg-chart-1`, etc. |
| `--black` | Pure black token | `bg-black`, `text-black` |
| `--app-font` | Font family | — |

### Overlay surface tokens (Dialog / Sheet / Drawer)

These are **not** mapped to `--color-*` in `@theme inline`. Reference them with arbitrary property syntax:

| Variable | Used by | Class |
|----------|---------|-------|
| `--dialog-background` | `DialogContent` (`shared:bg-(--dialog-background)`) | `bg-(--dialog-background)` |
| `--sheet-background` | `SheetContent` | `bg-(--sheet-background)` |
| `--drawer-background` | `DrawerContent` (mobile `ResponsiveDialog`) | `bg-(--drawer-background)` |

Light mode: all three are `oklch(1 0 0)` (white). Dark mode: all three are `oklch(23.075% 0.00003 271.152)` — slightly elevated vs `--background` (`oklch(14.958% …)`).

**Do not** use `bg-background` on sticky dialog/drawer footers — it mismatches the overlay surface. Match the host component:

```tsx
<ResponsiveFooter className="sticky bottom-0 z-10 shrink-0 border-t border-border/50 bg-(--drawer-background) px-0 pb-0 pt-3 md:bg-(--dialog-background)">
  {/* Cancel / Save */}
</ResponsiveFooter>
```

- **Mobile drawer** (`ResponsiveDialog` → `DrawerFooter`): `bg-(--drawer-background)`
- **Desktop dialog** (`ResponsiveDialog` → `DialogFooter`): `md:bg-(--dialog-background)`
- **Sheet-only** overlays: `bg-(--sheet-background)`

Shared-ui sets overlay roots automatically; footers/sticky sections inside portaled content must opt in explicitly.

### Long-form `ResponsiveDialog` layout

For forms with many fields (e.g. long textareas):

```tsx
<ResponsiveContent
  pluginName={metadata.name}
  className="flex h-[90vh] max-h-[90vh] w-full flex-col gap-0 overflow-hidden md:h-auto md:max-h-[90vh] md:max-w-[480px] md:gap-6"
>
  <ResponsiveHeader className="shrink-0">{/* title */}</ResponsiveHeader>
  <div className="min-h-0 flex-1 overflow-y-auto py-2">{/* fields */}</div>
  <ResponsiveFooter className="sticky bottom-0 z-10 shrink-0 gap-2 border-t border-border/50 bg-(--drawer-background) px-0 pb-0 pt-3 md:bg-(--dialog-background)">
    {/* actions */}
  </ResponsiveFooter>
</ResponsiveContent>
```

## Custom Theme Tokens (`index.css`)

Declare plugin-specific colors as CSS variables on `:root`, then map them into Tailwind via `@theme inline` as `--color-*`. The base app uses Tailwind CSS with the **class** dark-mode strategy (`class="dark"` on `<html>`).

> [!IMPORTANT]
> **Do NOT** hand-write `[data-plugin="my-plugin"]` around custom variables. The Vite CSS isolation plugin already scopes plugin styles. Authors must declare light tokens on `:root` and dark overrides on `.dark` only.

### Light + dark tokens

```css
@import "tailwindcss";

/* Required for Tailwind v4 `dark:` utilities with class strategy */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --mp-color-primary: #00c896;
  --mp-color-bg-light: #f5f7f8;
  --mp-text-main: #1a1a1a;
  --mp-text-muted: #8e8e93;
}

.dark {
  --mp-color-primary: #00d6a3;
  --mp-color-bg-light: #0b0b0c;
  --mp-text-main: #f5f5f7;
  --mp-text-muted: #8e8e93;
}

@theme inline {
  --color-background: var(--mp-color-bg-light);
  --color-foreground: var(--mp-text-main);
  --color-primary: var(--mp-color-primary);
  --color-muted-foreground: var(--mp-text-muted);
}
```

### Theme preference: `light` | `dark` | `system`

Dark mode is applied by toggling `class="dark"` on `<html>` (Tailwind class strategy). Preference options:

| Preference | Behavior |
|---|---|
| `light` | Remove `dark` from `<html>` |
| `dark` | Add `dark` to `<html>` |
| `system` | Follow `prefers-color-scheme`; listen for OS changes |

```ts
document.documentElement.classList.toggle("dark", isDark);
```

Also sync `class="dark"` onto plugin roots (`[data-plugin="..."]`) so CSS-isolation scoped `.dark` token overrides still apply.

Persist the preference in `localStorage` and expose a light / dark / system control in the public UI.

**Incorrect:**
```css
/* Do not scope tokens yourself — the build does this */
[data-plugin="my-plugin"] {
  --mp-teal: #00a191;
}
```

**Usage in JSX:**
```tsx
<section className="bg-background text-foreground">
  <header className="bg-black text-white">...</header>
  <p className="text-primary">My item title</p>
  <p className="text-muted-foreground">Label</p>
</section>
```

Prefer semantic theme utilities (`bg-background`, `text-primary`, `text-muted-foreground`, `bg-black`) over hardcoded hex classes. Change the palette by editing `:root` / `.dark` tokens once. Map those tokens into `@theme inline` so shared utilities match the design.

## Conditional `className` with `cn`

When composing Tailwind classes conditionally (variants, active states, tone props), **ALWAYS** use `cn` from `@quan-erp/shared-ui`. Do not build class strings with template literals or manual string concatenation.

```tsx
import { cn } from "@quan-erp/shared-ui";

<div
  className={cn(
    "inline-flex items-center rounded-full border p-0.5",
    tone === "on-dark" ? "border-white/15 bg-white/10" : "border-border bg-muted",
  )}
/>

<button
  className={cn(
    "flex h-8 w-8 items-center justify-center rounded-full transition",
    active && "bg-background text-foreground",
    !active && "text-muted-foreground hover:text-foreground",
  )}
/>
```

**Incorrect:**
```tsx
className={`inline-flex border p-0.5 ${tone === "on-dark" ? "bg-white/10" : "bg-muted"}`}
```

## Best Practices

- **Enforce Shared UI Components**:
    - **ALWAYS** use components from `@quan-erp/shared-ui` instead of raw HTML or custom styled components where possible — including public/rootRoute pages (login, signup, customer dashboards).
    - Prefer: `Button`, `ButtonGroup`, `Card*`, `Form*`/`Input`, `Badge`, `Alert*`, `EmptyState`/`LoadingState`/`ErrorState`, `Item*`.
    - These components are pre-configured to work with the design system and many handle internal styling needs (like table borders) automatically.
- **Prefer Utility Classes**: Use Tailwind utility classes directly in your JSX on top of shared-ui primitives.
- **Use `cn` for conditional classes**: Import `cn` from `@quan-erp/shared-ui` — never concatenate `className` strings manually.
- **Custom colors**: Declare on `:root` + `@theme inline` (see above). Never hardcode hex in components when a theme token exists.
- **Avoid Global CSS**: Do not write raw CSS selectors in `index.css` that aren't wrapped in `@layer components` or `@layer utilities`, as the isolation layer targets Tailwind's output. `:root` theme tokens are the exception for custom color variables.
- **Tailwind Borders**:
    - **NEVER** use the `border` class alone (e.g., `className="border"`).
    - **ALWAYS** include a color class. Use `border-border` for the standard default border color (e.g., `className="border border-border"`).
- **Table Components**:
    - The `<Table>` component from `@quan-erp/shared-ui` is based on Shadcn UI.
    - **DO NOT** wrap it with a `div` if it's not strictly required for layout or scrolling, as the component already handles its internal structure.
- **Check DevTools**: If a style isn't applying, verify that the element (or one of its parents) has the correct `data-plugin` attribute matching your plugin name.
