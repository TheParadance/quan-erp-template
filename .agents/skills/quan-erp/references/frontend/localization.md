# Frontend Localization Standard

Every UI string in a Quan ERP plugin must be localized to support multi-language environments (English, Burmese, and Chinese).

Localization is provided by `@quan-erp/shared-ui` (`shared-ui/src/locale/locale.ts`).

## Supported Locales

```typescript
type Locales = 'en-US' | 'zh-CN' | 'my-MM';
```

## API Overview

| Hook / Helper | Loading | Locale source | Use when |
|---|---|---|---|
| `useLazyLocaleTranslation` | Async (preferred) | User setting (`setting.locale`) | Authenticated app pages |
| `usePublicLazyLocaleTranslation` | Async (preferred) | Explicit `locale` argument | Public / pre-login pages (`rootRoute`, login, splash) |
| `useLocaleTranslation` | Sync (legacy) | User setting (`setting.locale`) | Small sync dictionaries only |
| `usePublicLocaleTranslation` | Sync (legacy) | Explicit `locale` argument | Public pages with a sync dictionary |
| `getLocaleString` | Sync helper | Explicit `setting` + `locale` object | Non-hook / one-off lookups |

> [!IMPORTANT]
> Prefer **lazy** APIs for new work. Use **public** variants when the setting store is unavailable or the page must choose locale itself (login, server picker, splash, public portals).

All hooks return a helper with:

```typescript
get(key: string, defaultValue: string, data?: Record<string, string>): string
```

Lazy hooks also expose `isLoading: boolean`.

Interpolation uses `{{varName}}` placeholders:

```tsx
translation.get("welcome-user", "Welcome, {{name}}", { name: user.name })
```

---

## Preferred: Lazy Loading (Authenticated)

### 1. Folder Structure & Locale Definition

```text
src/page/branch/
├── branch.page.tsx
├── branch.locale.ts
└── locales/
    ├── en-US.json
    ├── my-MM.json
    └── zh-CN.json
```

**Example `locales/en-US.json`:**
```json
{
    "fleet-management": "Fleet Management",
    "save": "Save",
    "welcome-user": "Welcome, {{name}}"
}
```

**Example `branch.locale.ts`:**
```typescript
import type { LazyLocaleType } from "@quan-erp/shared-ui";

export const BranchLocaleLazy: LazyLocaleType = {
    'en-US': () => import('./locales/en-US.json'),
    'my-MM': () => import('./locales/my-MM.json'),
    'zh-CN': () => import('./locales/zh-CN.json'),
};
```

### 2. `useLazyLocaleTranslation`

Reads the active locale from the built-in setting store (`locale`). Falls back to `fallbackLocale` (default `'en-US'`).

```tsx
import { useLazyLocaleTranslation } from "@quan-erp/shared-ui";
import { BranchLocaleLazy } from "./branch.locale";

export default function BranchPage() {
    const translation = useLazyLocaleTranslation(BranchLocaleLazy);
    // optional: useLazyLocaleTranslation(BranchLocaleLazy, 'en-US')

    if (translation.isLoading) {
        // Optionally show a lightweight loading state
    }

    return (
        <Button>
            {translation.get("save", "Save")}
        </Button>
    );
}
```

**Signature:**
```typescript
useLazyLocaleTranslation(
    localeLoaders: LazyLocaleType,
    fallbackLocale?: Locales // default 'en-US'
): { isLoading: boolean; get(...): string }
```

---

## Preferred: Lazy Loading (Public / Pre-login)

Use when there is no authenticated setting store, or the UI must control locale explicitly.

### `usePublicLazyLocaleTranslation`

```tsx
import { usePublicLazyLocaleTranslation } from "@quan-erp/shared-ui";
import { LoginLocaleLazy } from "./login.locale";

export default function LoginPage() {
    const [locale, setLocale] = useState<'en-US' | 'zh-CN' | 'my-MM'>('en-US');
    const translation = usePublicLazyLocaleTranslation(LoginLocaleLazy, locale);

    if (translation.isLoading) {
        // Optionally handle loading
    }

    return (
        <h1>{translation.get("sign-in", "Sign In")}</h1>
    );
}
```

**Signature:**
```typescript
usePublicLazyLocaleTranslation(
    localeLoaders: LazyLocaleType,
    locale?: Locales // default 'en-US'
): { isLoading: boolean; get(...): string }
```

---

## Legacy: Synchronous Loading

*For new development, prefer lazy loading above.*

### Sync dictionary type

```typescript
import type { LocaleType } from "@quan-erp/shared-ui";

export const MyPluginLocale: LocaleType = {
    "en-US": {
        "fleet-management": "Fleet Management",
        "save": "Save"
    },
    "my-MM": { /* ... */ },
    "zh-CN": { /* ... */ },
};
```

### `useLocaleTranslation` (authenticated)

```tsx
import { useLocaleTranslation } from "@quan-erp/shared-ui";
import { MyPluginLocale } from "./locale";

const translation = useLocaleTranslation(MyPluginLocale);
// optional: useLocaleTranslation(MyPluginLocale, 'en-US')
```

### `usePublicLocaleTranslation` (public)

```tsx
import { usePublicLocaleTranslation } from "@quan-erp/shared-ui";
import { LoginLocale } from "./login.locale";

const translation = usePublicLocaleTranslation(LoginLocale, 'my-MM');
```

### `getLocaleString` (non-hook helper)

```typescript
import { getLocaleString } from "@quan-erp/shared-ui";

const label = getLocaleString({
    locale: MyPluginLocale,
    setting, // object with setting['locale']?.value
    key: "save",
    defaultValue: "Save",
});
```

---

## Usage Example

```tsx
<Page
    navMenu={{
        menuTitle: (
            <PageNavTitle>
                {translation.get("expense-management", "Expense Management")}
            </PageNavTitle>
        ),
    }}
>
    <Button>
        {translation.get("new-expense", "New Expense")}
    </Button>
    <p>
        {translation.get("welcome-user", "Welcome, {{name}}", { name: "Ada" })}
    </p>
</Page>
```

## Best Practices

1. **Always Provide Defaults**: Always include a descriptive default value as the second argument to `get()`.
2. **Contextual Keys**: Use descriptive kebab-case keys (e.g. `save-button-label`, `error-message-invalid-input`).
3. **No Hardcoded UI Strings**: Visible strings MUST go through `translation.get()`.
4. **Choose the Right Hook**:
   - App pages → `useLazyLocaleTranslation`
   - Public / pre-login → `usePublicLazyLocaleTranslation` + explicit locale
5. **Shared Locales**: For common ERP terms (e.g. "Save", "Cancel", "Date"), check `@quan-erp/shared-ui` common translations before adding a custom key.
6. **Interpolation**: Prefer `{{name}}` placeholders over string concatenation for dynamic values.
