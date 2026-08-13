# How to Seed Data in Quan ERP Plugins

Seeding data is a critical step for initializing a plugin with essential configurations, default entities, and sample data. In Quan ERP, seeding is handled within the plugin's root module using the `@OnInit` lifecycle hook.

## 1. Key Services for Seeding

To ensure reliable and idempotent seeding (preventing duplicate data on every restart), you should use the following services from `@quan-erp/shared-backend-core`:

- **`DataSeedHistoryService`**: Tracks which seeding tasks have been completed for a specific version of the plugin. Always check this before running seeding logic.
- **`DeveloperConfigService`**: Used to set system-wide or plugin-specific configurations that can be adjusted by administrators.
- **`InjectDatabaseSource`**: Injects the TypeORM `DataSource` to perform database operations within a transaction.

## 2. Implementation Pattern

The standard pattern involves:
1. Injecting dependencies into the module class.
2. Implementing an `@OnInit()` method.
3. Checking if the seeding has already been performed using `dataSeedHistoryService.find`.
4. Running the seeding logic inside a database transaction.
5. Marking the seeding as complete using `dataSeedHistoryService.add`.

### Example Implementation

Here is an example based on the `AccountingModule`:

```typescript
import {
  DataSeedHistoryService,
  DeveloperConfigService,
  Inject,
  InjectBuiltinLogger,
  InjectDatabaseSource,
  Loggable,
  Module,
  OnInit,
  ContainerRegistryManager
} from "@quan-erp/shared-backend-core";
import { DataSource } from "typeorm";
import metadata from "../../../module.metadata.json" with { type: "json" };
import { SCHEMA_LIST, SERVICE_LIST, CONTROLLER_LIST } from "../const/app-config.js";
import { DEVELOPER_CONFIG } from "../const/developer-config.js";

@Module({
  name: metadata.name,
  providers: SERVICE_LIST,
  controllers: CONTROLLER_LIST,
  entities: [{ plugin: "default", entities: SCHEMA_LIST }],
})
export class AccountingModule {
  @InjectDatabaseSource(ContainerRegistryManager.DEFAULT_PLUGIN)
  dataSource: DataSource;

  @Inject(DeveloperConfigService, "builtin")
  developerConfigService: DeveloperConfigService;

  @Inject(DataSeedHistoryService, ContainerRegistryManager.BUILTIN_PLUGIN)
  dataSeedHistoryService: DataSeedHistoryService;

  @InjectBuiltinLogger()
  logger: Loggable;

  @OnInit()
  async init() {
    // 1. Check if seeding was already performed for this version
    const isExists = await this.dataSeedHistoryService.find(
      metadata.name,
      metadata.pluginVersion,
      "init",
    );

    if (isExists) {
        this.logger.log(`Accounting seeding skipped (already initialized)`);
        return;
    }

    // 2. Run seeding within a transaction
    await this.dataSource.transaction(async (manager) => {
      
      // 3. Seed Developer Configurations
      await this.developerConfigService.set({
        data: [
          {
            datatype: "number",
            key: "MAX_RECORDS",
            pluginName: metadata.name,
            value: "100",
            description: "Maximum records allowed",
            displayName: "Max Records",
            isVisibleToUser: true,
          },
        ],
        manager,
      });

      // 4. Seed Entities (Example: Accounting Book)
      const bookRepo = manager.getRepository(AccountingBookEntity);
      const primaryBookData = {
        name: "Main Operating Book",
        isActive: true,
      };
      await bookRepo.upsert(primaryBookData, ["name"]);

      // 5. Record Seeding Success
      await this.dataSeedHistoryService.add({
        data: {
          pluginName: metadata.name,
          pluginVersion: metadata.pluginVersion,
          name: "init",
        },
      });

      this.logger.log("Accounting module seeded successfully");
    });
  }
}
```

## 3. Simple Seeding Pattern (Existence Check)

For simple configuration data or static lists, you can use a direct existence check. This pattern is useful for small datasets that don't need versioned history tracking.

```typescript
import {
  InjectDatabaseSource,
  Loggable,
  Module,
  OnInit,
  InjectBuiltinLogger,
  ContainerRegistryManager
} from "@quan-erp/shared-backend-core";
import { DataSource, In } from "typeorm";
import metadata from "../../../module.metadata.json" with { type: "json" };
import { PaymentMethodEntity } from "../entities/payment-method.entity.js";

@Module({
  name: metadata.name,
  entities: [{ plugin: "default", entities: [PaymentMethodEntity] }],
})
export class PaymentMethodModule {
  @InjectDatabaseSource(ContainerRegistryManager.DEFAULT_PLUGIN)
  source: DataSource;

  @InjectBuiltinLogger()
  logger: Loggable;

  @OnInit()
  async init() {
    this.logger.log("====== Seeding Payment Methods ======");

    const repo = this.source.getRepository(PaymentMethodEntity);

    const payments = [
      { id: 1, name: 'Cash' },
      { id: 2, name: 'KBZPay' },
      { id: 3, name: 'AYAPay' },
      { id: 4, name: 'CBPay' },
      { id: 5, name: 'A+' }
    ];

    // Find existing records by a unique property
    const existingPayments = await repo.find({
      where: { name: In(payments.map(p => p.name)) }
    });

    const existingNames = new Set(existingPayments.map(p => p.name));

    // Filter out items that already exist
    const missingPayments = payments
      .filter(p => !existingNames.has(p.name))
      .map(p => repo.create(p));

    if (missingPayments.length > 0) {
      await repo.insert(missingPayments);
      this.logger.log(`Seeded ${missingPayments.length} payment method(s)`);
    } else {
      this.logger.log("All payment methods already exist");
    }

    this.logger.log("====== Seed Payment Methods Complete ======");
  }
}
```

## 4. Best Practices

- **Always use Transactions**: Ensure that if any part of the seeding fails, the entire process is rolled back.
- **Idempotency**: Use `upsert` or check for existence before creating records to avoid unique constraint violations if the history check fails for some reason.
- **Version Awareness**: Use `metadata.pluginVersion` when checking and adding seed history. This allows you to run new seeding logic for new versions of the plugin.
- **Clean Logs**: Use `InjectBuiltinLogger` to provide clear feedback during the system startup process.
- **Isolate Logic**: If the seeding logic is complex, move it to a dedicated `SeedService` and call it from the module's `init()` method.
