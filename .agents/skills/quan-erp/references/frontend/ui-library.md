# UI Library Reference

The official UI library for Quan ERP plugin development is **`@quan-erp/shared-ui`**. 

## Core Foundation

This library is built on top of **Shadcn UI**, providing a modern, consistent, and premium interface across all modules.

### Shared UI Integration
- **Shadcn Components**: All standard Shadcn components (Button, Table, Dialog, etc.) are bundled and exported from this library.
- **ERP-Specific Components**: Includes custom components like `ResponsiveDialog` for seamless desktop/mobile support.
- **I18n Hooks**: Provides `useLazyLocaleTranslation` / `usePublicLazyLocaleTranslation` (and sync variants) for multi-language content. See [Frontend Localization](./localization.md).

For a detailed list of components, hooks, and example usage, please refer to the:
**[Shared UI Documentation](../shared-ui/shared-ui.md)**

## Styling & CSS Isolation

Quan ERP uses scoped Tailwind CSS for plugins to prevent style leakage. This requires specific implementation patterns, especially when using portaled components like Dialogs or Sheets.

For detailed instructions on maintaining style isolation, refer to the:
**[CSS Styling & Isolation Reference](./css-styling.md)**

## Best Practices
1. **Always import from `@quan-erp/shared-ui`**: Never install individual UI libraries or Shadcn components directly in your plugin.
2. **Use shared-ui components as much as possible**: Prefer shared primitives over raw HTML in **all** pages and components, including public/rootRoute UIs.
   - Buttons → `Button` / `ButtonGroup` (not `<button>`)
   - Forms → full standard stack: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` + `Input` / `Select` / etc., with `react-hook-form` + `zod` + `zodResolver` (not bare `<input>`, not `register()`-only on `Field`)
   - Surfaces → `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
   - Feedback → `Alert` / `AlertDescription`, `Badge`, `EmptyState`, `LoadingState`, `ErrorState`
   - Lists → `Item`, `ItemGroup`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`
   - Class merging → `cn`
3. **Use `cn` for conditional classes**: Import `cn` from `@quan-erp/shared-ui` instead of template-literal `className` concatenation or installing `clsx` / `tailwind-merge` yourself.
4. **Follow the Design System**: Use the provided variants and utility classes to ensure your plugin feels like a native part of the system.
5. **Declare form dependencies**: Plugins that use the Form stack should list `react-hook-form`, `zod`, and `@hookform/resolvers` in `frontend/package.json` dependencies.

