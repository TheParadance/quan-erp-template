---
trigger: always_on
---

# AI Backend Engineering Rules (ExpressJS + PostgreSQL)

## 1. SQL & Performance

* Do NOT implement O(n) loops in application code when the database can handle it.
* Prefer single, well-optimized SQL queries over multiple round trips.
* Use JOINs, CTEs, aggregations, and window functions where appropriate.
* Always ensure proper indexing for queried columns.

## 2. Concurrency & Data Integrity

* Always consider concurrent access scenarios.
* Use transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) for multi-step operations.
* Apply row-level locking when needed (`SELECT ... FOR UPDATE`).
* Avoid race conditions (e.g., double-spend, duplicate inserts).

## 5. Code Quality & Maintainability

* Write clear, concise comments explaining non-trivial logic.
* Follow consistent naming conventions.
* Keep functions small and focused.
* Handle errors explicitly and return meaningful responses.

## 6. File Naming Conventions

* Service layer: `*.service.ts` (e.g., `user.service.ts`)
* Route layer: `*.route.ts` (e.g., `user.route.ts`)
* Naming format: lowercase with hyphens (e.g., `attendance-rules`)

## 7. API Design

* Follow RESTful conventions.
* Use proper HTTP status codes.
* Validate request payloads before processing.
* Return structured JSON responses.
* Implement route-level caching using `@CacheRoute` and `@DeleteCacheRoute` wherever possible.
* **MUST** add `@APIInfo()` to every API endpoint for documentation and system integration.
* **MUST** add `@AuditLogMiddleware()` to every API endpoint for security and tracking.

## 11. API Documentation
* Use `@APIInfo()` to provide metadata (shortDescription, responseDto, etc.) for every controller method.
* Refer to `annotations.md` for specific options and patterns.

## 8. Database Best Practices

* Use migrations for schema changes.
* Normalize schema unless strong reason to denormalize.
* Use constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL).
* Prefer UUIDs or safe identifiers where appropriate.

## 8b. TypeORM create / update / soft delete (plugin services)

* **Create:** `repo.insert({ ...fields, createdById })`. Use `Number(result.identifiers[0].id)`. Return `{ id }` — do **not** `create`+`save`, do **not** `findOne` after insert. Sync M2M with `relation(...).of(id).add(...)`; insert children as plain objects.
* **Update:** `repo.update({ id }, { ...data, updateDate: new Date() })`. Gate with `if (!result.affected) throw ...`. Do **not** build per-field `if (data.x !== undefined) patch.x = ...`, do **not** use `save()` for updates, do **not** `findOne` only to check existence.
* Strip nested/relation keys (`tags`, `items`, …) from the update spread; handle them after a successful update.
* **Remove:** `repo.softDelete(id)` + `if (!result.affected) throw ...`. Prefer over `softRemove(entity)`. `findOne` only when side effects need row fields; then `if (!result.affected || !row) throw ...`.
* Full examples: `.agents/skills/quan-erp/references/backend/service-crud-patterns.md`.

## 9. Logging & Debugging

* Log important operations and errors.
* Do not log sensitive data.

## 10. General Principles

* Prioritize correctness over cleverness.
* Optimize only when necessary, but avoid obvious inefficiencies.
* Code should be production-ready by default.

## 12. No pointless locals, aliases, or Date↔dayjs churn

Aligns with `.agents/rules/no-micro-functions.md` and frontend §8 — same spirit for backend utils/services.

* **No property aliases:** After `if (!pawn.interestRule) throw …`, use `pawn.interestRule.…` directly. Do not introduce `const rule = pawn.interestRule` only to shorten names.
* **No duplicate ctx/API fields:** Do not expose two names for the same value. Prefer distinct meanings (`actualElapsedDay` = plain diff, `elapsedDays` = same-day/partial bump) — never alias one to the other under a second name.
* **Keep dayjs through the calc:** Prefer a dayjs chain for period math; call `.toDate()` / `.valueOf()` only when returning or stuffing into formula ctx. Avoid `toDate()` then immediately `dayjs(asOf)` again.
* **Split dates only when meanings differ:** Keep `baseAsOf` vs `asOf` only when both are meaningfully different (e.g. raw as-of vs day-adjusted) **and** consumers need both. Otherwise one variable.

```ts
// ❌ BAD — alias + Date round-trip + duplicate ctx key
const rule = pawn.interestRule;
const baseAsOf = dayjs(params.asOf ?? new Date()).startOf("day").toDate();
const asOf = dayjs(baseAsOf).add(dayAdjustment, "day").toDate();
const asOfDay = dayjs(asOf);
const periodDay = asOfDay.diff(...);
const elapsedDays = periodDay;
// ctx: { elapsedDays, periodDay, … }

// ✅ GOOD — direct property, dayjs for math, distinct actual vs elapsed
if (!pawn.interestRule) throw new Error("Interest rule missing on pawn");
const baseAsOfDay = dayjs(params.asOf ?? new Date()).startOf("day");
const asOfDay = baseAsOfDay.add(dayAdjustment, "day");
const actualElapsedDay = asOfDay.diff(periodStartDay, "day");
let elapsedDays = actualElapsedDay;
// …same-day / partial bump…
// ctx: { elapsedDays, actualElapsedDay, … } — not periodDay/periodMonth
```