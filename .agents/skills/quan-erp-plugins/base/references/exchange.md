> Parent skill: [Base Plugin](../SKILL.md)

## 11. Exchange rates

> Exported function names include `Query` suffix; `APINames` omit it.

### `useFromCurrencyExchangeRateQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(enabled: boolean, from: number) => UseQueryResult<FromCurrencyExchangeRateDto[], Error>` |
| **APINames** | `useFromCurrencyExchangeRate` |
| **What** | All rates from a source currency. |

### `useFromCurrencyExchangeRateWithToQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(enabled: boolean, from: number, to: number) => UseQueryResult<FromCurrencyExchangeRateWithToDto, Error>` |
| **APINames** | `useFromCurrencyExchangeRateWithTo` |
| **What** | Single rate pair. |

### `useUpdateCurrencyExchangeRateQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<AxiosResponse, Error, UpdateCurrencyExchangeRateDto, unknown>` |
| **APINames** | `useUpdateCurrencyExchangeRate` |
| **DTO** | `{ fromCurrencyId, toCurrencyId, rate }` |
| **Notes** | Wrapper exists; confirm `PluginAPI.expose` in `setup-prod.ts` before relying in plugins (historically may be missing). |

---
