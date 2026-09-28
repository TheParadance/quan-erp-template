# Backend Migrations

Plugins ship database migrations by implementing `IDatabaseMigration` and returning them from `getMigrations()` on the plugin entry class (`backend/src/index.ts`).

## Folder layout

```text
plugins/my-plugin/backend/src/migrations/
├── source.ts                 # TypeORM DataSource for CLI generate (optional)
└── my-initial.migration.ts   # Migration class(es)
```

## 1. Define a migration class

Implement `IDatabaseMigration` from `@quan-erp/shared-types`:

```typescript
import { IDatabaseMigration } from "@quan-erp/shared-types";
import { QueryRunner } from "typeorm";

export class MyInitialMigration implements IDatabaseMigration {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            CREATE TABLE "my-plugin_item" (
                "createDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updateDate" TIMESTAMP NOT NULL DEFAULT now(),
                "deleteDate" TIMESTAMP,
                "version" integer NOT NULL DEFAULT '0',
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_my_plugin_item" PRIMARY KEY ("id")
            )
        `);
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "my-plugin_item"`);
    }

    getName(): string {
        return "my-initial";
    }

    getSource(): { plugin: string; name: string } {
        return {
            plugin: "default",
            name: "default",
        };
    }
}
```

| Method | Purpose |
| :--- | :--- |
| `up` | Apply the schema change |
| `down` | Revert the schema change |
| `getName` | Stable migration id (used for history tracking) |
| `getSource` | Datasource identity — use `{ plugin: "default", name: "default" }` for the primary platform DB |

> [!TIP]
> Table names should follow the entity naming rule: prefix with the plugin name (e.g. `my-plugin_item`). See [How to Define DB Entity](./how-to-define-db-entity.md).

## 2. Register migrations on the plugin

Return migration classes from `getMigrations()` in `backend/src/index.ts`:

```typescript
import type { GetMigrationsType, IPlugin } from "@quan-erp/shared-types";
import { MyInitialMigration } from "./migrations/my-initial.migration.js";

export default class MyPlugin implements IPlugin {
    getMigrations(): GetMigrationsType {
        return [MyInitialMigration];
    }

    // ... other IPlugin methods
}
```

## 3. Optional: TypeORM CLI generate helper

`source.ts` is only for local CLI generation (`npm run migration:generate`). Fill credentials for your local DB:

```typescript
import { BUILTIN_ENTITIES } from "@quan-erp/shared-backend-core";
import { DataSource } from "typeorm";
import { MyItemEntity } from "../schema/my-item.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "",
    password: "",
    database: "",
    entities: [...BUILTIN_ENTITIES, MyItemEntity],
});
```

```bash
# from plugins/my-plugin/backend
npm run migration:generate
```

Generated SQL still needs to be wrapped in an `IDatabaseMigration` class and listed in `getMigrations()`.

## Best practices

1. Keep `getName()` stable — renaming breaks migration history.
2. Prefer explicit `up` / `down` SQL for plugin tables you own.
3. Always register new migrations in `getMigrations()`.
4. Do not put secrets in committed `source.ts`; leave placeholders for local use.
