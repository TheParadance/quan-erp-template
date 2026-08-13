# Database Entity Definition

All backend entities in a Quan ERP plugin must follow a strict naming convention for their database tables to ensure namespace isolation and prevent collisions across plugins.

## Naming Convention

The table name specified in the `@Entity()` decorator **MUST** always start with the plugin name. To ensure accuracy and maintainability, you should import the plugin's metadata and use the `metadata.name` property in a template literal.

### Pattern:
```typescript
import metadata from '../../../../module.metadata.json' with { type: 'json' };

@Entity(`${metadata.name}_table_name`)
export class MyEntity {
    // ...
}
```

> [!TIP]
> For a full list of supported decorations, including AI-specific metadata like `@AIEntityInfo` and `@AIExcludeColumn`, refer to the **[Entity Annotations Reference](./entity-annotation.md)**.

### Why this is required:
1. **Namespace Isolation**: Prevents table name collisions when multiple plugins are installed on the same database.
2. **Clarity**: Makes it easy to identify which plugin owns which table during database administration and debugging.
3. **Refactoring Safety**: Using `metadata.name` ensures that if a plugin is renamed in the metadata, the database tables will reflect this change consistently.

---

## Example Implementation

Below is an example of a correctly defined entity for a driver document in a fleet management plugin:

```typescript
import { BaseEntity } from "@quan-erp/shared-backend-core";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import metadata from '../../../../module.metadata.json' with { type: 'json' };

@Entity(`${metadata.name}_driver_document`)
export class DriverDocumentEntity extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  documentName: string;
  
  // ... other columns
}
```

---

## Best Practices
- **BaseEntity**: Always extend `BaseEntity` from `@quan-erp/shared-backend-core` to include common fields like `createDate`, `updateDate`, and soft-delete support (`DeleteDateColumn`). Prefer `repo.softDelete` for deletes — see [Service CRUD Patterns](./service-crud-patterns.md).
- **Primary Keys**: Use `PrimaryGeneratedColumn("increment")` or `PrimaryGeneratedColumn("uuid")` consistently.
- **CamelCase to snake_case**: While the class name is `PascalCase`, the table name and column names should follow the system's naming conventions (usually `snake_case` in the database).

---

## Entity Registration

After defining an entity, it must be registered in the **Plugin Root Module** (`.module.ts`) under the `entities` array.

### The `plugin: 'default'` Rule:
Entities are grouped by datasource. Most plugins should use the `'default'` datasource.

```typescript
entities: [
    {
        plugin: 'default', // Merges entities into the primary "default" datasource
        entities: [ MyEntity ],
    }
]
```
This ensures that the Quan ERP core merges your plugin's entities into the primary database connection shared by the platform.
