# How to Create a Cron Job (Backend)

This document explains how to schedule background work from a plugin using `@quan-erp/shared-backend-core`.

> [!IMPORTANT]
> **Always prefer the Redis cron job path:** built-in **`CronJobService`** (BullMQ + Redis + Postgres). This is the default for every new schedule — domain sweeps, reminders, reconciles, maturity checks, etc.
>
> Do **not** use the `@CronJob` method decorator for new plugin work unless the user explicitly asks for an in-process-only tick. Do **not** depend on `@quan-erp-plugins/cron-schedular-backend` — the same Redis APIs live in core as `CronJobService`.

## Default: Redis cron (`CronJobService`)

Jobs are enqueued through **BullMQ on Redis**, with schedule metadata persisted in Postgres (`cron_jobs`). On boot, active schedules are reloaded into Redis. Handlers run when the BullMQ worker fires.

| | Redis cron (`CronJobService`) | In-process (`@CronJob`) — avoid |
| :--- | :--- | :--- |
| Queue | BullMQ + Redis | Local `cron` package |
| Persistence | Yes (`cron_jobs` + Redis scheduler) | No |
| Retries / repeat limits | Yes | No |
| Multi-instance safe schedule | Yes (shared Redis) | No (each process ticks) |
| After restart | Schedule restored; **re-attach listeners** | Method must be resolved again |
| Use for | **All normal plugin schedules** | Only if explicitly requested |

---

## 1. Injection

`CronJobService` is a built-in core service. Inject it with `ContainerRegistryManager.BUILTIN_PLUGIN` (same pattern as `NotificationService`).

```typescript
import {
    Service,
    Inject,
    ContainerRegistryManager,
    CronJobService,
    OnAllModuleLoaded,
} from "@quan-erp/shared-backend-core";
import metadata from "../../../module.metadata.json" with { type: "json" };

@Service()
export class MaturedSweepService {
    @Inject(CronJobService, ContainerRegistryManager.BUILTIN_PLUGIN)
    private cronJobService: CronJobService;
}
```

---

## 2. Register a Redis cron job

Call `register` with a unique `(pluginName, jobName)` pair. Use `metadata.name` as `pluginName`.

```typescript
async ensureDailySweepJob() {
    await this.cronJobService.register({
        cronExpression: "0 2 * * *", // every day at 02:00
        pluginName: metadata.name,
        jobName: "matured-daily-sweep",
        status: "active",
        startDate: new Date(), // optional: delay until this time before first run
        data: {
            // optional payload available on the BullMQ job as job.data
            reason: "daily-sweep",
        },
        retry: {
            attempt: 3,
            delay: 5_000,
            type: "exponential", // or "fixed"
        },
        repeat: {
            limit: 0, // omit or set max executions when needed
        },
        // optional: register listener in the same call (in-memory only)
        callback: async (job) => {
            await this.runSweep(job.data);
        },
    });
}
```

`register` upserts the DB row on `(pluginName, jobName)` and (re)creates the Redis/BullMQ scheduler. Calling it again with the same names updates the schedule.

---

## 3. Attach / re-attach listeners after restart

Schedules are reloaded from Postgres into Redis/BullMQ on core startup. **Callbacks are not persisted** — they live only in the process memory of `CronJobService`.

Always re-register listeners on `@OnAllModuleLoaded` (or pass `callback` again via `register` after boot):

```typescript
@OnAllModuleLoaded()
async onAllModuleLoaded() {
    this.cronJobService.addEventListener(
        metadata.name,
        "matured-daily-sweep",
        async (job) => {
            await this.runSweep(job.data);
        },
    );
}
```

`addEventListener` returns a `listenerId` string. Remove with:

- `removeEvenListenerById(listenerId)` — one listener
- `removeEventListener(pluginName, jobName)` — all listeners for that job

---

## 4. Stop / remove

```typescript
// Pause Redis scheduler + mark inactive (can be re-activated via updateCronJobStatus)
await this.cronJobService.stop(metadata.name, "matured-daily-sweep");

// Delete Redis scheduler + DB row + drop matching listeners
await this.cronJobService.remove(metadata.name, "matured-daily-sweep");

// Bulk helpers
await this.cronJobService.stopAllByPluginName(metadata.name);
await this.cronJobService.removeAllByPluginName(metadata.name);
```

---

## 5. Query helpers

```typescript
const job = await this.cronJobService.getByPluginNameWithJobName(
    metadata.name,
    "matured-daily-sweep",
);

const jobs = await this.cronJobService.getByPluginName({
    pluginName: metadata.name,
    skip: 0,
    limit: 50,
    status: "active", // optional
});
```

---

## 6. `CreateCronJobDTO` reference

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cronExpression` | `string` | Yes | Cron pattern (BullMQ / cron format, e.g. `0 2 * * *`). |
| `pluginName` | `string` | Yes | Owning plugin — use `metadata.name`. |
| `jobName` | `string` | Yes | Unique within the plugin. Combined key: `` `${pluginName}/${jobName}` ``. |
| `status` | `'active' \| 'inactive'` | No | Defaults to active when registering a live schedule. |
| `data` | `Record<string, any>` | No | Payload merged into BullMQ job data (`pluginName` is always added). |
| `startDate` | `Date` | No | Earliest start; converted to an initial delay. |
| `repeat.limit` | `number` | No | Max number of repeats. |
| `retry.attempt` | `number` | No | Max retry attempts on failure. |
| `retry.delay` | `number` | No | Backoff delay in ms. |
| `retry.type` | `'fixed' \| 'exponential'` | No | Backoff strategy. |
| `callback` | `(job: Job) => void` | No | In-memory listener registered at the same time as the schedule. |

### HTTP surface (admin / tooling)

Core also exposes authenticated routes under `/cron-jobs` (`CronJobController`). Plugin code should call `CronJobService` directly rather than HTTP.

---

## 7. Recommended plugin pattern (Redis)

1. Inject `CronJobService` with `ContainerRegistryManager.BUILTIN_PLUGIN`.
2. On `@OnAllModuleLoaded` (and/or feature setup), call `register({ pluginName: metadata.name, jobName, cronExpression, ... })` so the Redis schedule exists.
3. Ensure a listener is attached every boot (`callback` on `register` and/or `addEventListener`) — schedules survive restart; handlers do not.
4. On uninstall / disable, call `stop` or `remove` (avoid orphan Redis schedulers).
5. Keep `jobName` stable and namespaced (e.g. `matured-daily-sweep`) so upserts update the same job.

### Minimal end-to-end example

```typescript
import {
    Service,
    Inject,
    ContainerRegistryManager,
    CronJobService,
    OnAllModuleLoaded,
} from "@quan-erp/shared-backend-core";
import metadata from "../../../module.metadata.json" with { type: "json" };

const JOB_NAME = "inventory-nightly-reconcile";

@Service()
export class InventoryReconcileCronService {
    @Inject(CronJobService, ContainerRegistryManager.BUILTIN_PLUGIN)
    private cronJobService: CronJobService;

    @OnAllModuleLoaded()
    async onAllModuleLoaded() {
        await this.cronJobService.register({
            cronExpression: "0 3 * * *",
            pluginName: metadata.name,
            jobName: JOB_NAME,
            startDate: new Date(),
            callback: async () => {
                await this.reconcile();
            },
        });
    }

    private async reconcile() {
        // domain work
    }
}
```

Register the service in your plugin root `@Module({ services: [...] })` like any other backend service.

---

## Appendix: In-process `@CronJob` (do not use by default)

Only if the user explicitly wants a process-local tick with no Redis queue:

```typescript
import { Service, CronJob } from "@quan-erp/shared-backend-core";

@Service()
export class LocalHousekeepingService {
    @CronJob({ expression: "0 * * * *", name: "HourlyLocalCleanup" })
    async cleanup() {
        // runs every hour on this process only — not shared via Redis
    }
}
```

- Class must be `@Service()` (or otherwise DI-resolved).
- Options: `expression` (required), `name` (optional).
- No DB row, no Redis queue, no retries, no shared execution across replicas.
- Prefer Redis `CronJobService` instead for any real product schedule.
