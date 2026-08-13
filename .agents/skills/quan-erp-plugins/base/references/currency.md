> Parent skill: [Base Plugin](../SKILL.md)

## 10. Currency

### `useCurrencyQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?: RequestIndexPaginationDto, option?) => UseQueryResult<CurrencyDto[], Error>` |
| **APINames** | `useCurrencyQuery` |

### `useCreateCurrencyQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, CreateCurrencyDto, unknown>` |
| **APINames** | `useCreateCurrencyQuery` |
| **DTO** | `currency`, `symbol`, `code`, `decimalPlace` |

### `useUpdateCurrencyQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, { id?: number; currency: UpdateCurrencyDto }, unknown>` |
| **APINames** | `useUpdateCurrencyQuery` |

### `CurrencyDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `CurrencyDropdown` |
| **Key props** | `value?: number \| TakeAndPartialRest<CurrencyDto, "id" \| "code">`, `setValue(v?, currency?)`, `allowClear?`, `isCompact?`, `disabled?`, `trigger?`, `placeholder?`, `className?` |
| **Example** | |
```tsx
<CurrencyDropdown value={currencyId} setValue={(id) => setCurrencyId(id)} />
```

### `CurrencyInput`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `CurrencyInput` |
| **What** | Rounded-full amount + currency-code pill (uses `CurrencyDropdown` internally). |
| **Key props** | `amount?`, `setAmount(amount?)`, `currencyId?`, `setCurrencyId?(id?, currency?)`, `placeholder?`, `disabled?`, `className?`, `inputClassName?`, `allowClearCurrency?` |
| **Example** | |
```tsx
<CurrencyInput
  amount={amount}
  setAmount={setAmount}
  currencyId={currencyId}
  setCurrencyId={(id) => setCurrencyId(id)}
/>
```

**DTO:** `CurrencyDto { id, currency, symbol, code, decimalPlace }`

**Barrels:** hooks → `api/currency/currency.export`; UI → `page/currency/currency.export`

---
