# Built-in Entities Reference

This reference documents the core entities available in `@quan-erp/shared-backend-core`. Use these entities when defining relationships in your plugin to join with core system data.

---

## Foundation: BaseEntity

All built-in entities (and your plugin entities) should extend `BaseEntity`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `createDate` | `Date` | Timestamp when the record was created. |
| `updateDate` | `Date` | Timestamp when the record was last updated. |
| `deleteDate` | `Date` | Timestamp for soft deletes (nullable). |
| `version` | `number` | Optimistic locking version. |

---

## Identity & Access

### UserEntity
**Table:** `user`
Represents system users.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `name` | `string` | Full name of the user. |
| `username` | `string` | Unique username for login. |
| `isActive` | `boolean` | Whether the user is active. |
| `roleId` | `number` | ID of the assigned role. |
| `role` | `RoleEntity` | Relationship to the user's role. |
| `branches` | `BranchEntity[]` | Relationship to branches the user belongs to. |
| `branchLimit` | `boolean` | Whether the user's access is limited by branch. |

### RoleEntity
**Table:** `role`
Represents user roles and permissions.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `name` | `string` | Role name (e.g., "Admin", "Manager"). |
| `permissions` | `PermissionEntity[]` | Relationship to specific permissions. |
| `users` | `UserEntity[]` | Relationship to users assigned to this role. |

### BranchEntity
**Table:** `branch`
Represents company branches or locations.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `name` | `string` | Branch name. |
| `isActive` | `boolean` | Whether the branch is active. |

---

## Business Master Data

### PartnerEntity & shipping
**Table:** `partners`
Represents Customers, Suppliers, or any external business entity.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `firstName` | `string` | Partner's first name. |
| `lastName` | `string` | Partner's last name. |
| `isCustomer` | `boolean` | True if the partner is a customer. |
| `isSupplier` | `boolean` | True if the partner is a supplier. |
| `shippingAddress` | `PartnerShippingAddressEntity[]` | List of shipping addresses. |

### CurrencyEntity
**Table:** `currency`
Represents different currencies used in the system.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `currency` | `string` | Full name (e.g., "US Dollar"). |
| `symbol` | `string` | Currency symbol (e.g., "$"). |
| `code` | `string` | 3-character ISO code (e.g., "USD"). |
| `decimalPlace` | `number` | Number of decimal places for display. |

### CurrencyExchangeRateEnity
**Table:** `currency_exchange_rate`
Represents exchange rates between currencies.

> [!WARNING]
> Note the typo in the class name: `CurrencyExchangeRateEnity` (missing 't' in Entity).

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `fromCurrencyId` | `number` | ID of the source currency. |
| `toCurrencyId` | `number` | ID of the target currency. |
| `rate` | `number` | Conversion rate (decimal). |
| `fromCurrency` | `CurrencyEntity` | Relationship to source currency. |
| `toCurrency` | `CurrencyEntity` | Relationship to target currency. |

### Units & Categories
**Table:** `unit`, `unit_category`

#### UnitEntity
Represents standard Units of Measurement (UOM).

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `name` | `string` | Full name (e.g., "Kilogram"). |
| `symbol` | `string` | Short symbol (e.g., "kg"). |
| `code` | `string` | Internal code. |
| `isBase` | `boolean` | True if this is the base unit for its category. |
| `categoryId` | `number` | Relationship to `UnitCategoryEntity`. |

#### UnitCategoryEntity
Groups related units (e.g., "Weight", "Volume", "Time").

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `name` | `string` | Unique category name. |

### Unit Conversion
**Table:** `unit_conversion`
Defines rules for converting between units.

| Property | Type | Description |
| :--- | :--- | :--- |
| `fromUnitId` | `number` | Source unit ID. |
| `toUnitId` | `number` | Target unit ID. |
| `conversionFactor` | `number` | Multiplier for conversion. |

---

## Operations & Communications

### NotifcationEntity
**Table:** `notification`

> [!WARNING]
> The class name has a typo in the source code: `NotifcationEntity` (missing 'i'). Use this name when importing.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `topic` | `string` | Notification topic or category. |
| `title` | `string` | Primary notification title. |
| `body` | `string` | Detailed message content. |
| `targetType` | `enum` | `ALL`, `SPECIFIC_ROLES`, or `SPECIFIC_USERS`. |
| `data` | `jsonb` | Custom payload data. |

### AuditLogEntity
**Table:** `audit_log`
Tracks user actions across the system.

### TagEntity
**Table:** `tags`
Generic tagging system for categorizing records across the ERP.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `name` | `string` | Unique tag name. |
| `userId` | `number` | ID of the user who created the tag. |

---

## System Configuration

### SettingEntity
**Table:** `setting`
User or System level settings.

| Property | Type | Description |
| :--- | :--- | :--- |
| `uniqueKey` | `string` | Unique identifier for the setting. |
| `datatype` | `enum` | `string`, `number`, `boolean`, `json`, `date`. |
| `rawValue` | `text` | The raw stored value. |
| `userId` | `number` | Null for system settings, ID for user-specific settings. |

### EnvEntity
**Table:** `env`
Environment variables managed via UI.

| Property | Type | Description |
| :--- | :--- | :--- |
| `key` | `string` | Environment variable name. |
| `value` | `text` | Variable value. |
| `isPublic` | `boolean` | Visible to both frontend and backend if true. |
| `isSecret` | `boolean` | Masked in the UI if true. |

### DeveloperConfigEntity
**Table:** `developer_config`
Internal configurations for plugin developers.

---

## Plugins & Routing

### PluginEntity
**Table:** `module`
Represents registered plugins/modules in the system.

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Internal name of the plugin (unique). |
| `displayName` | `string` | User-friendly name. |
| `pluginVersion` | `string` | Current installed version. |
| `installed` | `boolean` | Whether the plugin is currently active. |
| `pluginDependencies` | `json` | Map of required plugins and their versions. |
| `routes` | `PluginRouteEntity[]` | List of routes registered by this plugin. |

### PluginRouteEntity
**Table:** `plugin_route`
Tracks active pages and API endpoints registered by plugins.

| Property | Type | Description |
| :--- | :--- | :--- |
| `route` | `string` | The URL path or endpoint. |
| `type` | `enum` | `PAGE` or `API`. |
| `method` | `string` | HTTP method (for API routes). |
| `pluginId` | `number` | ID of the owning plugin. |

### DataSeedHistoryEntity
**Table:** `data_seed_history`
Tracks executed data seeds to prevent re-execution.

| Property | Type | Description |
| :--- | :--- | :--- |
| `pluginName` | `string` | Name of the plugin that owns the seed. |
| `pluginVersion` | `string` | Version of the plugin when seed was run. |
| `name` | `string` | Unique name of the seed task. |

---

## Infrastructure

### FileEntity
**Table:** `files`
Generic entity for file attachments and uploads.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Primary Key. |
| `filename` | `string` | Original file name. |
| `mimeType` | `string` | File MIME type. |
| `size` | `number` | File size in bytes. |
| `creatorId` | `number` | ID of the user who uploaded the file. |

---

## How to Join in a Plugin

When creating a plugin entity that references a core entity, use the following pattern:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity, BranchEntity, BaseEntity } from "@quan-erp/shared-backend-core";

@Entity("my_plugin_table")
export class MyPluginEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // Join with User
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "userId" })
    user: InstanceType<typeof UserEntity>;

    @Column()
    userId: number;

    // Join with Branch
    @ManyToOne(() => BranchEntity)
    @JoinColumn({ name: "branchId" })
    branch: InstanceType<typeof BranchEntity>;

    @Column()
    branchId: number;
}
```

> [!TIP]
> Always use `InstanceType<typeof EntityName>` for relationship types if you are using JavaScript/TypeScript patterns that involve circular dependencies or specific module loading behaviors common in this ERP.

---