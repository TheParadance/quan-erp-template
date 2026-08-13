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
[data-plugin=loan].text-xs,
[data-plugin=loan] .text-xs {
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
> When using Portals, you **MUST** apply the `data-plugin` attribute to the root element of the portal content.

**Incorrect (Styles will break):**
```tsx
<SheetContent>
    <div className="bg-primary p-4">...</div>
</SheetContent>
```

**Correct (Styles preserved):**
```tsx
<SheetContent data-plugin={metadata.name}>
    <div className="bg-primary p-4">...</div>
</SheetContent>
```

## Custom Theme Tokens (`index.css`)

Declare plugin-specific colors as CSS variables on `:root`, then map them into Tailwind via `@theme inline` as `--color-*`. The base app uses Tailwind CSS with the **class** dark-mode strategy (`class="dark"` on `<html>`).

> [!IMPORTANT]
> **Do NOT** hand-write `[data-plugin="your-plugin"]` around custom variables. The Vite CSS isolation plugin already scopes plugin styles. Authors must declare light tokens on `:root` and dark overrides on `.dark` only.

### Light + dark tokens

```css
@import "tailwindcss";

/* Required for Tailwind v4 `dark:` utilities with class strategy */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --rp-color-primary: #00c896;
  --rp-color-bg-light: #f5f7f8;
  --rp-text-main: #1a1a1a;
  --rp-text-muted: #8e8e93;
}

.dark {
  --rp-color-primary: #00d6a3;
  --rp-color-bg-light: #0b0b0c;
  --rp-text-main: #f5f5f7;
  --rp-text-muted: #8e8e93;
}

@theme inline {
  --color-background: var(--rp-color-bg-light);
  --color-foreground: var(--rp-text-main);
  --color-primary: var(--rp-color-primary);
  --color-muted-foreground: var(--rp-text-muted);
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
[data-plugin="reward-point"] {
  --rp-teal: #00a191;
}
```

**Usage in JSX:**
```tsx
<section className="bg-background text-foreground">
  <header className="bg-black text-white">...</header>
  <p className="text-primary">Available points</p>
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
