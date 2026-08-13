# Cron Scheduler Plugin Skill

This plugin provides dynamic cron job scheduling and management capabilities, allowing other plugins to register, monitor, and execute background tasks based on cron expressions or specific intervals.

## Features

- **Dynamic Job Registration**: Register background jobs at runtime with custom cron expressions or specific start dates.
- **Queue-based Processing**: Leverages BullMQ and Redis for reliable, scalable, and persistent job execution.
- **Event-based Execution**: Plugins can listen for their specific job execution events using an event listener pattern.
- **Retry & Backoff Logic**: Configurable retry attempts and backoff strategies (Fixed/Exponential) for handling job failures.
- **Execution Tracking**: Built-in tracking of active jobs and execution status.
- **Automatic Recovery**: Automatically reloads and resumes active cron jobs upon system restart.

## Backend Exported Classes

Other plugins can inject and use the following classes from `@quan-erp-plugins/cron-schedular-backend`.

### `CronJobService`
The primary service for managing the lifecycle of cron jobs.

- **`register(dto: CreateCronJobDTO)`**: Registers or updates a cron job.
    - Supports `cronExpression`, `startDate`, `data` (payload), `retry` config, and `repeat` limits.
- **`stop(pluginName: string, jobName: string)`**: Deactivates a job and removes it from the active scheduler.
- **`remove(pluginName: string, jobName: string)`**: Completely deletes a job record and its associated listeners.
- **`addEventListener(pluginName: string, jobName: string, callback: Callback)`**: Registers a callback to be executed when the specified job runs. Returns a `listenerId`.
- **`removeEvenListenerById(listenerId: string)`**: Unregisters a callback by its ID.
- **`getByPluginName(props: { pluginName, skip, limit, status? })`**: Retrieves jobs for a specific plugin.

### DTOs & Types

#### `CreateCronJobDTO`
The main data structure for registering a new job.
- **`cronExpression`** (string): Standard cron format (e.g., `* * * * *`).
- **`pluginName`** (string): The name of the source plugin.
- **`jobName`** (string): A unique identifier for the job within the plugin.
- **`status`** (optional): `'active'` | `'inactive'`. Defaults to `'active'`.
- **`data`** (optional): `Record<string, any>` - Custom payload passed to the job execution callback.
- **`startDate`** (optional): `Date` - The earliest time the job should start.
- **`repeat`** (optional): `RepeatOption` - Limits how many times the job executes.
- **`retry`** (optional): `CronRetryOption` - Configuration for failed job retries.

#### `RepeatOption`
- **`limit`** (number): Maximum number of times the job will repeat.

#### `CronRetryOption`
- **`attempt`** (number): Maximum number of retry attempts.
- **`delay`** (number): Delay between retries in milliseconds.
- **`type`** (string): `'fixed'` | `'exponential'` - The strategy for calculating delays between retries.

#### `CronJobEntity`
The database entity representing a scheduled job.

## Frontend Exported Features

Currently, the `cron-schedular` plugin does not export any hooks or components via the `PluginAPI` registry.
