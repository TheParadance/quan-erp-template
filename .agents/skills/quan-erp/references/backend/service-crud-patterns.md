# Backend Service CRUD Patterns

Standard patterns for plugin feature services (`*.service.ts`) when creating, updating, and soft-deleting entities that extend `BaseEntity`.

## Create

- Use `repo.insert({ ...fields })` — **not** `repo.create()` + `repo.save()`.
- Prefer wrapping multi-step work in `source.transaction`.
- Take the new id from `result.identifiers[0].id`.
- Return `{ id }` (or `void` / `null` from the controller). Do **not** re-load with `findOne` after insert.
- For M2M relations (`tags`, etc.): insert the row first, then `relation(...).of(id).add(...)`.
- For child rows: `repo.insert([...plainObjects])` with the parent id.

```typescript
async create(data: CreateFooDto, userId: number) {
    return this.source.transaction(async (manager) => {
        const result = await this.repo(manager).insert({
            ...data,
            createdById: userId,
        });
        const id = Number(result.identifiers[0].id);
        // optional changelog / side effects
        return { id };
    });
}
```

## Update

- **Do not** use `repo.save()` for updates.
- **Do not** build a field-by-field `patch` with `if (data.x !== undefined) patch.x = data.x`.
- Spread the update DTO / `Partial<>` directly into `repo.update` (or QueryBuilder `.set` when you need extra `WHERE` clauses).
- Always set `updateDate: new Date()`.
- Gate not-found on `result.affected` — do **not** `findOne` solely to check existence before update.
- Prefer `async update(...): Promise<void>` (no reloaded entity return). Controllers respond with `ResponseDto.ok(null)` / `ResponseDto.okWithEmpty()`.

```typescript
async update(id: number, data: UpdateFooDto, userId: number) {
    await this.source.transaction(async (manager) => {
        const result = await this.repo(manager).update(
            { id },
            { ...data, updateDate: new Date() },
        );
        if (!result.affected) throw new Error("Foo not found");
        // optional changelog / side effects
    });
}
```

### Nested / relation fields

Strip relation or nested payloads out of the spread, then handle them separately:

```typescript
const { tags, items, ...fields } = data;
const result = await repo.update({ id }, { ...fields, updateDate: new Date() });
if (!result.affected) throw new Error("...");
// sync tags / items after a successful header update
```

### Uniqueness / normalize before write

When a field needs trim or uniqueness checks, mutate a local copy then spread that — still no per-field `patch` object:

```typescript
const fields = { ...data };
if (fields.name != null) {
    fields.name = fields.name.trim();
    if (!fields.name) throw new Error("Name is required");
    // uniqueness check...
}
await this.repo(manager).update({ id }, { ...fields, updateDate: new Date() });
```

## Soft delete (`remove`)

- Prefer `repo.softDelete(id)` (or `softDelete({ id })`) over `softRemove(entity)`.
- Gate not-found on `result.affected`.
- Load the row with `findOne` **only** when you still need columns for side effects (voucher code, status flags, changelog display name). Combine: `if (!result.affected || !row) throw ...`.

```typescript
async remove(id: number, userId: number) {
    return this.source.transaction(async (manager) => {
        const repo = manager.getRepository(FooEntity);
        const row = await repo.findOne({ where: { id } }); // only if needed for side effects
        const result = await repo.softDelete(id);
        if (!result.affected || !row) throw new Error("Foo not found");
        // side effects using row...
        return { id };
    });
}
```

When no post-delete side effects need entity fields:

```typescript
const result = await this.repo(manager).softDelete(id);
if (!result.affected) throw new Error("Foo not found");
```

## Anti-patterns

```typescript
// BAD — create + save
const entity = repo.create({ ...data, createdById: userId });
const saved = await repo.save(entity);
return repo.findOne({ where: { id: saved.id }, relations: ["createdBy"] });

// BAD — field-by-field patch
const patch: Partial<Foo> = { updateDate: new Date() };
if (data.name !== undefined) patch.name = data.name;
if (data.rate !== undefined) patch.rate = data.rate;
await repo.update({ id }, patch);

// BAD — findOne only to prove existence before update
const row = await repo.findOne({ where: { id } });
if (!row) throw new Error("not found");
await repo.save({ ...row, ...data });

// BAD — softRemove after findOne for existence only
const row = await repo.findOne({ where: { id } });
if (!row) throw new Error("not found");
await repo.softRemove(row);
```
