---
trigger: always_on
---

# Backend service CRUD

When writing or changing plugin feature services (`plugins/**/backend/**/*.service.ts`), follow `.agents/skills/quan-erp/references/backend/service-crud-patterns.md`.

## Create

```ts
// GOOD
const result = await repo.insert({ ...data, createdById: userId });
return { id: Number(result.identifiers[0].id) };

// BAD
const entity = repo.create({ ...data });
const saved = await repo.save(entity);
return repo.findOne({ where: { id: saved.id } });
```

- Use `repo.insert({ ...fields })` — not `create` + `save`.
- Return `{ id: Number(result.identifiers[0].id) }`.
- Do **not** `findOne` after insert.
- M2M: insert row, then `relation(...).of(id).add(...)`. Children: `insert([...])`.

## Update

```ts
// GOOD
const result = await repo.update({ id }, { ...data, updateDate: new Date() });
if (!result.affected) throw new Error("... not found");

// BAD — per-field patch / save / findOne for existence
```

- Use `repo.update({ id }, { ...data, updateDate: new Date() })`.
- Throw when `!result.affected`.
- Do **not** build per-field `if (data.x !== undefined) patch.x = ...`.
- Do **not** use `save()` for updates or `findOne` only to prove existence.
- Strip nested/relation keys (`tags`, `items`, …) from the spread; handle after update.

## Soft delete

```ts
// GOOD
const row = await repo.findOne({ where: { id } }); // only if side effects need fields
const result = await repo.softDelete(id);
if (!result.affected || !row) throw new Error("... not found");

// BAD
await repo.softRemove(row);
```

- Prefer `repo.softDelete(id)` + `affected` check over `softRemove(entity)`.
- `findOne` only when side effects need row fields.
