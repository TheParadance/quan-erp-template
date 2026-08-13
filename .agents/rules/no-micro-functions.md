---
trigger: always_on
---

# No micro functions / pointless locals

Do **not** create tiny wrapper helpers that only hide one expression (e.g. `concatX`, `getY`, `formatZ` that are a single `.map().join()` / ternary).

Do **not** invent locals that only rename, duplicate, or round-trip the same value.

## Do

- Inline the expression at the call site (JSX cell, map callback, property access, etc.).
- After a null/missing guard, use the property directly (`pawn.interestRule.…`) — no `const rule = pawn.interestRule`.
- Keep dayjs (or the working type) through calendar math; call `.toDate()` / `.valueOf()` only at return / ctx boundaries — no `toDate()` then `dayjs(x)` again.
- Expose one name when two values are always identical (formula ctx / DTO).
- Keep real shared modules when they own **non-trivial** behavior: React components, multi-branch formatters, domain classes, API clients.

## Don't

```ts
// BAD — micro function file / one-liner export
export function concatPawnItemNames(items) {
  return items?.map((i) => i.itemName).filter(Boolean).join(", ") || "—";
}
```

```tsx
// GOOD — inline at usage
{items?.map((item) => item.itemName).filter(Boolean).join(", ") || "—"}
```

```ts
// BAD — property alias, Date↔dayjs round-trip, duplicate ctx keys
const rule = pawn.interestRule;
const asOf = dayjs(...).toDate();
const asOfDay = dayjs(asOf);
const periodDay = elapsedDays; // same value twice in ctx
```

```ts
// GOOD — direct use, dayjs for math, one name
if (!pawn.interestRule) throw …;
const asOfDay = dayjs(...).add(dayAdjustment, "day");
const periodDay = asOfDay.diff(periodStartDay, "day");
```

Extract a function only when it has meaningful branching, reuse that would otherwise drift, or a clear named domain concept — not to shorten a one-liner.

See also `.agents/rules/backend-writing-style.md` §12 and `.agents/rules/frontend-writing-style.md` §8.
