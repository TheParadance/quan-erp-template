# Base Frontend Reference

This document lists the core APIs, components, stores, and DTOs available in the `base` frontend that can be used by plugins via the `useAppRegistry` or direct imports from `@quan-erp/base-frontend`.

## APINames

The `APINames` enum defines the keys for accessing shared services and hooks through the registry.

| Name | Key | Description | Params | Payload/DTO |
|------|-----|-------------|--------|-------------|
| `useAppRegistry` | `useAppRegistry` | Hook to access the app registry |
| `queryClient` | `queryClient` | The global TanStack Query client |
| `navigate` | `navigate` | Navigation function |
| `inAppNotificationRegistry` | `inAppNotificationRegistry` | Registry for in-app notifications |
| `firebaseForegroundNotificationRegistry` | `firebaseForegroundNotificationRegistry` | Registry for Firebase foreground notifications |
| `firebaseBackgroundNotificationRegistry` | `firebaseBackgroundNotificationRegistry` | Registry for Firebase background notifications |
| `useNavMenuStore` | `useNavMenuStore` | Store for navigation menu management |
| `useBottomNavBarStore` | `useBottomNavBarStore` | Store for bottom navigation bar |
| `useRootComponentStore` | `useRootComponentStore` | Store for root component state |
| `useHomeShortcutStore` | `useHomeShortcutStore` | Store for home screen shortcuts |
| `ShortcutItem` | `ShortcutItem` | Component/Type for shortcut items |
| `useSettingQuery` | `useSettingQuery` | Query for application settings |
| `useUpdateSettingQuery` | `useUpdateSettingQuery` | Mutation for updating settings |
| `useSettingStore` | `useSettingStore` | Store for application settings |
| `useSettingContext` | `useSettingContext` | Context for application settings |
| `useIsContainInBottomNavBar` | `useIsContainInBottomNavBar` | Utility hook for bottom nav bar presence |
| `AllowedAPIPermissions` | `allowed-api-permission` | Constant for API permissions |
| `usePerimssionTemplateStore` | `usePerimssionTemplateStore` | Store for permission templates |
| `useBranchQuery` | `useBranchQuery` | Query for branch data | `query?: RequestIndexPaginationDto, option?` | `BranchDto[]` |
| `useCreateBranchQuery` | `useCreateBranchQuery` | Mutation for creating branches |
| `useUpdateBranchQuery` | `useUpdateBranchQuery` | Mutation for updating branches |
| `usePartnerQuery` | `usePartnerQuery` | Query for partner data | `query?: PartnerQueryDto, option?` | `PartnerDto[]` |
| `useCreatePartnerQuery` | `useCreatePartnerQuery` | Mutation for creating partners | - | `CreatePartnerDto` |
| `useUpdatePartnerQuery` | `useUpdatePartnerQuery` | Mutation for updating partners | - | `{ id: number; customer: CreatePartnerDto }` |
| `useCreateParnterShippingAddressQuery` | `useCreateParnterShippingAddressQuery` | Mutation for partner shipping addresses | - | `{ partnerId: number } & CreatePartnerShippingAddressDto` |
| `useUpdateParnterShippingAddressQuery` | `useUpdateParnterShippingAddressQuery` | Mutation for partner shipping addresses | - | `PartnerShippingAddressDto` |
| `useDeleteParnterShippingAddressQuery` | `useDeleteParnterShippingAddressQuery` | Mutation for partner shipping addresses | - | `{ id: number }` |
| `useCurrencyQuery` | `useCurrencyQuery` | Query for currency data | `query?: RequestIndexPaginationDto, option?` | `CurrencyDto[]` |
| `useCreateCurrencyQuery` | `useCreateCurrencyQuery` | Mutation for creating currencies | - | `CreateCurrencyDto` |
| `useUpdateCurrencyQuery` | `useUpdateCurrencyQuery` | Mutation for updating currencies | - | `{ id?: number; currency: UpdateCurrencyDto }` |
| `useFromCurrencyExchangeRateQuery` | `useFromCurrencyExchangeRateQuery` | Query for exchange rates | `enabled: boolean, from: number` | `FromCurrencyExchangeRateDto[]` |
| `useFromCurrencyExchangeRateWithToQuery` | `useFromCurrencyExchangeRateWithToQuery` | Query for exchange rates | `enabled: boolean, from: number, to: number` | `FromCurrencyExchangeRateDto[]` |
| `useUpdateCurrencyExchangeRateQuery` | `useUpdateCurrencyExchangeRateQuery` | Mutation for exchange rates | - | `UpdateCurrencyExchangeRateDto` |
| `useMediaFilesQuery` | `useMediaFilesQuery` | Query for media files | `query?: RequestIndexPaginationDto, option?` | `MediaFileDto[]` |
| `useUploadMediaQuery` | `useUploadMediaQuery` | Mutation for media upload | - | `{ file: File; type: FileLocation; access: "private" | "public"; accessRoleIds: string }` |
| `useUnitMeasurementQuery` | `useUnitMeasurementQuery` | Query for Unit of Measurement | `query?: RequestIndexPaginationDto, option?` | `UnitMeasurementDto[]` |
| `useUpdateUnitMeasurementQuery` | `useUpdateUnitMeasurementQuery` | Mutation for UoM | - | `{ id: number; data: UpdateUnitMeasurementDto }` |
| `useCreateUnitMeasurementQuery` | `useCreateUnitMeasurementQuery` | Mutation for UoM | - | `CreateUnitMeasurementDto` |
| `useUnitMeasurementByCategoryQuery` | `useUnitMeasurementByCategoryQuery` | Query for UoM by category | `categoryId: number, option?` | `UnitMeasurementDto[]` |
| `useUnitOfConversionQuery` | `useUnitOfConversionQuery` | Query for Unit of Conversion | `fromId: number, option?` | `UnitOfConversionDto[]` |
| `useUnitOfConversionToQuery` | `useUnitOfConversionToQuery` | Query for Unit of Conversion | `{ fromId, toId }, option?` | `UnitOfConversionDto` |
| `useUserQuery` | `useUserQuery` | Query for user data | `query?: RequestIndexPaginationDto, option?` | `UserDto[]` |
| `useUpdateUserQuery` | `useUpdateUserQuery` | Mutation for updating users | - | `{ id: string; user: UpdateUserDto }` |
| `useCreateUserQuery` | `useCreateUserQuery` | Mutation for creating users | - | `CreateUserDto` |
| `getViteEnv` | `getViteEnv` | Utility to get Vite environment variables |
| `useCreateTagQuery` | `useCreateTagQuery` | Mutation for creating tags | - | `CreateTagDto` |
| `useTagQuery` | `useTagQuery` | Query for tags | `query?: RequestIndexPaginationDto, option?` | `TagDto[]` |
| `NewTagDialog` | `NewTagDialog` | Dialog component for new tags | - | - |
| `useFindTagStartWithQuery` | `useFindTagStartWithQuery` | Query for tag autocompletion | `query?: RequestIndexPaginationDto, option?` | `TagDto[]` |
| `useDashboardContext` | `useDashboardContext` | Context for dashboard state |
| `ChangeLog` | `ChangeLog` | Component for displaying change logs |
| `useChangeLogQuery` | `useChangeLogQuery` | Query for change logs |
| `useInfiniteChangeLog` | `useInfiniteChangeLog` | Infinite query for change logs |
| `useReactChangeLogQuery` | `useReactChangeLogQuery` | Mutation to react to change logs |
| `useRemoveReactChangeLogQuery` | `useRemoveReactChangeLogQuery` | Mutation to remove reaction from change logs |
| `SportlightSearchCallback` | `SportlightSearchCallback` | Callback for spotlight search |
| `SportligthSearchStore` | `SportligthSearchStore` | Store for spotlight search |
| `useAvailableAssistantQuery` | `useAvailableAssistantQuery` | Query for available AI assistants |
| `useRoleQuery` | `useRoleQuery` | Query for role data |
| `useUpdateRoleQuery` | `useUpdateRoleQuery` | Mutation for updating roles |

## Exported Features

The base frontend exports various modules that can be imported and used within plugins.

### API & Data Fetching
- **Settings**: `setting.export`
- **Permissions**: `permission.export`
- **Roles & Permissions**: `role-permission.export`
- **Currency & Exchange**: `currency-exchange.export`, `currency.export`
- **Branches**: `branch.export`
- **Partners**: `partner.export`, `partner-shipping-adderss.export`
- **Files & Media**: `file.export`
- **Units (UoM/UoC)**: `uom.export`, `uoc.export`
- **Users**: `user.export`
- **Notifications**: `notification.export`
- **Tags**: `tag.export`
- **Change Log**: `change-log.export`
- **Firebase**: `firebase.export`
- **AI Assistant**: `ai-assistant.export`

### Components
- **Tagging**: `NewTagDialog`
- **Change Log**: `ChangeLog` component
- **Home Shortcuts**: `HomeShortcutItem`
- **Search**: `SportlightSearch`

### Stores
- **Navigation**: `useNavMenuStore`, `useBottomNavBarStore`
- **Home Screen**: `useHomeShortcutStore`
- **Root State**: `useRootComponentStore`
- **Permissions**: `usePerimssionTemplateStore`

### Localization
- **Locale**: `locale.export` provides translation utilities and resources.

## Common Data Types & DTOs

### Core
```typescript
interface BaseDto {
    createDate: Date;
    updateDate: Date;
    deleteDate: Date;
}
```

### Settings
```typescript
type SettingDataType = "string" | "number" | "boolean" | "json" | "date" | 'string-array';
type SettingValue = { value: any, datatype: SettingDataType, isPublic: boolean, userId?: number };
type SettingMapValue = Record<string, SettingValue>;
```

### Branch
```typescript
class BranchDto extends BaseDto {
    id: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
}
```

### User & Roles
```typescript
interface UserDto {
    id: number;
    name: string;
    username: string;
    role: {
        id: number;
        name: string;
    }
}

interface CreateUserDto {
    username: string;
    name: string;
    isOwner: boolean;
    password: string;
    roleId: number;
}

interface UpdateUserDto {
    name: string;
    username: string;
    roleId: number;
}

interface RoleDto {
    id: number;
    name: string;
    initialPageRoute?: string;
}

interface CreateRoleDto {
    name: string;
    initialPageRoute?: string;
}
```

### Permissions
```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

interface PermissionPayload {
    url: string;
    method: HttpMethod;
    roleId: number;
    pluginId?: number;
}
```

### Partner & Shipping
```typescript
interface CreatePartnerDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    phone2?: string;
    phone3?: string;
    address?: string;
    city?: string;
    country?: string;
    isActive?: boolean;
    internalNotes?: string;
    isCustomer?: boolean;
    isSupplier?: boolean;
    tags?: number[];
}

interface PartnerDto {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    phone2?: string;
    phone3?: string;
    address?: string;
    city?: string;
    country?: string;
    isActive?: boolean;
    internalNotes?: string;
    isCustomer: boolean;
    isSupplier: boolean;
    tags?: TagDto[];
    shippingAddress: PartnerShippingAddressDto[];
}

interface PartnerQueryOptions {
    search?: string;
    isSupplier?: boolean;
    isCustomer?: boolean;
}

type CreatePartnerShippingAddressDto = {
    address: string;
    city?: string;
    country?: string;
    postalCode?: string;
}

type PartnerShippingAddressDto = {
    id: number;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
}
```

### Currency & Exchange
```typescript
interface CurrencyDto extends BaseDto {
    id: number;
    currency: string;
    symbol: string;
    code: string;
    decimalPlace: number;
}

interface FromCurrencyExchangeRateDto {
    id: number;
    fromCurrencyId: number;
    fromCurrencyCode: string;
    fromCurrencySymbol: string;
    toCurrencyId: number;
    toCurrencyCode: string;
    toCurrencySymbol: string;
    rate: number;
}

interface FromCurrencyExchangeRateWithToDto {
    fromCurrency: FromCurrencyExchangeRateDto;
    toCurrency: FromCurrencyExchangeRateDto;
}
```

### Files & Media
```typescript
interface MediaFileDto {
    id: number,
    createDate: Date;
    filename: string;
    size: number;
    mimeType: string;
    access: 'private' | 'public';
}
```

### Units of Measurement (UoM/UoC)
```typescript
interface UnitCategoryDto {
    id?: number;
    name: string;
    description?: string;
}

interface UnitMeasurementDto {
    id: number;
    name: string;
    symbol: string;
    code: string;
    isBase: boolean;
    category: UnitCategoryDto;
    categoryId: number;
}

interface CreateUnitMeasurementDto {
    name: string;
    symbol: string;
    code: string;
    isBase: boolean;
    categoryId: number;
}

interface UpdateUnitMeasurementDto {
    name: string;
    symbol: string;
    code: string;
    isBase: boolean;
}

type UnitOfConversionDto = {
    fromUnitId: number;
    toUnitId: number;
    conversionFactor: number;
}

type UpdateUnitOfConversionDto = {
    fromUnitId: number;
    toUnitId: number;
    conversionFactor: number;
}
```

### Notifications
```typescript
type NotificationDto = {
    id: number;
    icon?: MediaFileDto;
    title?: string;
    body?: string;
    topic: string;
    url?: string;
    isRead: boolean;
    createDate: string;
    pluginName: string;
}
```

### Change Log
```typescript
interface GetChangeLogDto {
    id: number;
    message: string;
    createdBy: UserDto;
    isCreatedBySystem: boolean;
    pluginName: string;
    referencePrefix: string;
    referenceNumber: string;
    createDate: string;
    reactions: ChangeLogReaction[];
}

interface ChangeLogReaction {
    id: number;
    reaction: string;
    reactBy: UserDto;
}
```

### AI Assistant
```typescript
interface AIAssistantDto {
    shortId: string;
    name: string;
    description: string;
    icon: string;
    model: AIModelDto;
    tools: { pluginName: string, fnName: string }[];
    allowedRoles: RoleDto[];
}

interface AIModelDto {
    id: number;
    name: string;
    sdkType: string;
    model: string;
    isActive: boolean;
}
```

### Tag
```typescript
interface TagDto {
    id: number;
    name: string;
}

interface CreateTagDto {
    name: string;
}
```

### User Management
```typescript
interface UserDto {
    id: number;
    name: string;
    username: string;
    createDate: Date;
    updateDate: Date;
    role: {
        id: number;
        name: string;
    }
}

interface CreateUserDto {
    username: string;
    name: string;
    isOwner: boolean;
    password: string;
    roleId: number;
}

interface UpdateUserDto {
    name: string;
    username: string;
    roleId: number;
}
```

## Usage in Plugins

When developing a plugin, you can access these features by registering them or using the registry hook:

```typescript
import { useAppRegistry, APINames } from "@quan-erp/shared-frontend-core";

const registry = useAppRegistry();
const queryClient = registry.get(APINames.queryClient);
const navigate = registry.get(APINames.navigate);
```

### Partner Management (`usePartnerQuery`)

The `usePartnerQuery` hook allows you to fetch and search for partners (customers/suppliers).

#### Signature
```typescript
usePartnerQuery(
    query?: PartnerQueryDto, // RequestIndexPaginationDto + isSupplier? / isCustomer?
    option?: Omit<UseQueryOptions<PartnerDto[]>, 'queryFn' | 'queryKey'>,
): UseQueryResult<PartnerDto[], Error>
```

#### Example: Searchable Selector
```tsx
const [search, setSearch] = useState("");
const debouncedSearch = useDebounceValue(search, 300);

const { data: partners = [], isLoading } = usePartnerQuery({
    currentPage: 1,
    pageSize: 10,
    query: debouncedSearch,
    isSupplier: true,
});
```
