> Parent skill: [Base Plugin](../SKILL.md)

## 13. Units of measurement (UOM)

### `useUnitMeasurementQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?, option?) => UseQueryResult<UnitMeasurementDto[], Error>` |
| **APINames** | `useUnitMeasurementQuery` |

### `useCreateUnitMeasurementQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature (typed)** | `() => UseMutationResult<any, Error, CreateUnitMeasurementDto, unknown>` |
| **APINames** | `useCreateUnitMeasurementQuery` |
| **Notes** | Current wrapper returns `PluginAPI.use(...)` **without invoking** `()` — treat carefully / verify before use. |

### `useUpdateUnitMeasurementQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature (typed)** | `() => UseMutationResult<any, Error, { id: number; data: UpdateUnitMeasurementDto }, unknown>` |
| **APINames** | intended `useUpdateUnitMeasurementQuery` |
| **Notes** | Current wrapper incorrectly looks up `APINames.useUnitMeasurementQuery` and omits `()`. Prefer fixing base before plugin use. |

### `useUnitMeasurementByCategoryQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(categoryId: number, option?) => UseQueryResult<UnitMeasurementDto[], Error>` |
| **APINames** | `useUnitMeasurementByCategoryQuery` |

### `UnitMeasurementDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `UnitMeasurementDropdown` |
| **Key props** | `value` / `setValue`, `categoryId?`, `allowClear?`, `isCompact?`, `trigger?` |

### `UnitMeasurementCategoryDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `UnitMeasurementCategoryDropdown` |
| **Key props** | `value` / `setValue`, `allowClear?`, `isCompact?`, `trigger?` |

**DTO:** `UnitMeasurementDto { id, name, symbol, code, isBase, categoryId, category? }`

---
