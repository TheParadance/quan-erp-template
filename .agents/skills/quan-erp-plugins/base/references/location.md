> Parent skill: [Base Plugin](../SKILL.md)

## 8. Location

### `useCountriesQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?: CountriesQueryDto, option?) => UseQueryResult<CountryDto[], Error>` |
| **APINames** | `useCountriesQuery` |

### `useStatesQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query: StatesQueryDto, option?) => UseQueryResult<StateDto[], Error>` |
| **APINames** | `useStatesQuery` |
| **Filter** | `countryId?` in query object |

### `useDivisionsQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query: DivisionsQueryDto, option?) => UseQueryResult<DivisionDto[], Error>` |
| **APINames** | `useDivisionsQuery` |
| **Filter** | `countryId?`, `stateId?` |

### `useTownshipsQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query: TownshipsQueryDto, option?) => UseQueryResult<TownshipDto[], Error>` |
| **APINames** | `useTownshipsQuery` |
| **Filter** | `countryId?`, `stateId?`, `divisionId?` |

**Location DTO shape:** `{ id, code, name, localName? }` (+ parent ids on children).

### Dropdowns (note: use `onChange`, not `setValue`)

| Component | Extra props | APINames |
|---|---|---|
| `CountryDropdown` | `value`, `onChange(id, dto)`, `trigger?` | `CountryDropdown` |
| `StateDropdown` | `countryId?` | `StateDropdown` |
| `DivisionDropdown` | `countryId?`, `stateId?` | `DivisionDropdown` |
| `TownshipDropdown` | `countryId?`, `stateId?`, `divisionId?` | `TownshipDropdown` |

```tsx
<CountryDropdown
  value={countryId}
  onChange={(id) => { setCountryId(id); setStateId(undefined); }}
/>
<StateDropdown countryId={countryId} value={stateId} onChange={(id) => setStateId(id)} />
```

---
