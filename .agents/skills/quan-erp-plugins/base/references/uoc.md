> Parent skill: [Base Plugin](../SKILL.md)

## 14. Unit of conversion (UOC)

### `useUnitOfConversionQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(fromId: number, option?) => UseQueryResult<UnitOfConversionDto[], Error>` |
| **APINames** | `useUnitOfConversionQuery` |

### `useUnitOfConversionToQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query: { fromId: number; toId: number }, option?) => UseQueryResult<UnitOfConversionDto \| undefined, Error>` |
| **APINames** | `useUnitOfConversionToQuery` |

### `useAllUnitOfConversionQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(option?) => UseQueryResult<UnitOfConversionDto[], Error>` |
| **APINames** | `useAllUnitOfConversionQuery` |

**DTO:** `{ fromUnitId, toUnitId, conversionFactor }`

---
