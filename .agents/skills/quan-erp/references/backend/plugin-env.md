# Plugin Env (`@InjectEnv`)

Each plugin has its **own** `Env` bag. Values are partitioned by plugin name — plugin A cannot read keys registered for plugin B, `builtin`, or host `process.env` / `base/backend/.env` through `@InjectEnv()`.

Import from `@quan-erp/shared-backend-core`:

```typescript
import { InjectEnv, OnInit, Module, Service } from "@quan-erp/shared-backend-core";
import type { Env } from "@quan-erp/shared-backend-core";
```

> [!IMPORTANT]
> `Env` is a TypeScript **interface** (no runtime export). Always use `import type { Env }`. A value import breaks SWC builds (`does not provide an export named 'Env'`). See [Import type](../import-type.md).

## 1. Inject

Use `@InjectEnv()` on a **class property** (constructor injection is not supported):

```typescript
@Service()
export class MyService {
    @InjectEnv()
    env: Env;

    getBucket() {
        // Only this plugin's S3_BUCKET — not builtin / host .env
        return this.env.get("S3_BUCKET");
    }
}
```

Same injection works on the plugin root module class.

## 2. Seed defaults in root `@OnInit`

Any key your plugin’s services call via `this.env.get(...)` **MUST** be registered on **this** plugin. Seed missing keys in the root module `@OnInit`, then persist with `sync()`:

```typescript
import metadata from "../../../module.metadata.json" with { type: "json" };
// metadata.name === "my-plugin"

@Module({
    name: metadata.name,
    providers: [MyService],
    // ...
})
export class MyModule {
    @InjectEnv()
    env: Env;

    @OnInit()
    async init() {
        if (!this.env.get("MY_APP_URL")) {
            this.env.set("MY_APP_URL", "http://localhost:5173");
        }
        if (!this.env.get("S3_BUCKET")) {
            this.env.set("S3_BUCKET", "my-plugin-bucket");
        }
        // secrets:
        // this.env.set("TOKEN", "", { isSecret: true });
        await this.env.sync();
    }
}
```

| Method | Purpose |
| :--- | :--- |
| `env.get(key)` | Read a key from **this** plugin’s env bag |
| `env.set(key, value, options?)` | Set a key (`{ isSecret: true }` for secrets) |
| `await env.sync()` | Persist changes so they survive restarts |

> [!IMPORTANT]
> Always call `await this.env.sync()` after seeding or updating keys in `@OnInit`. Skipping `sync()` leaves values only in memory for the current process.

## 3. Isolation rules

| Do | Don't |
| :--- | :--- |
| Seed every key this plugin reads in **its** root `@OnInit` | Assume `base/backend/.env` / `process.env` keys appear in `@InjectEnv()` |
| Use `metadata.name` as the plugin identity for the bag | Expect to `env.get` keys owned by another plugin or `builtin` |
| Keep secrets with `{ isSecret: true }` | Hardcode secrets in source without seeding through `Env` |

Cross-plugin **beans** (e.g. `@Inject(MyOtherService, "other-plugin")`) are separate from env scope. If your service reads `S3_BUCKET` via `@InjectEnv()`, **your** plugin must own that key — even when an S3 client bean comes from another scope.

## 4. Reading env in services

```typescript
@Service()
export class MyService {
    @InjectEnv()
    env: Env;

    buildPublicUrl(path: string) {
        const base = this.env.get("MY_APP_URL") ?? "";
        return `${base}${path}`;
    }
}
```

If `get` returns empty/undefined after boot, the key was never seeded for this plugin — add it in the root module `@OnInit` (section 2).

## Related

- [Plugin Root Module](./plugin-root-module.md) — where to seed env on init
- [Annotations](./annotations.md) — `@InjectEnv` API note
