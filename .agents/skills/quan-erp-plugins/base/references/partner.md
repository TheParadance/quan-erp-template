> Parent skill: [Base Plugin](../SKILL.md)

## 7. Partner

### `usePartnerQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?: PartnerQueryDto, option?) => UseQueryResult<PartnerDto[], Error>` |
| **APINames** | `usePartnerQuery` |
| **Extra query fields** | `isSupplier?`, `isCustomer?` (+ pagination `query` search) |

### `useCreatePartnerQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, CreatePartnerDto, unknown>` |
| **APINames** | `useCreatePartnerQuery` |
| **DTO** | `firstName`, `lastName`, phones/email/address, `isCustomer?`, `isSupplier?`, `isActive?`, `tags?: number[]` |

### `useUpdatePartnerQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, { id: number; customer: CreatePartnerDto }, unknown>` |
| **APINames** | `useUpdatePartnerQuery` |
| **Notes** | Payload property is `customer` (not `partner`). |

### `PartnerDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `PartnerDropdown` |
| **Key props** | `value`, `setValue(v?, partner?)`, `partnerType?: 'customer' \| 'supplier'`, `allowClear?`, `isCompact?`, `trigger?` |

### `getPartnerDetailTabs`
| | |
|---|---|
| **Kind** | registry |
| **Signature** | `getPartnerDetailTabs(): PartnerDetailTab[]` |
| **APINames** | `partnerDetailTabs` |
| **What** | Mutable array of partner detail tabs. Push entries to extend the partner detail UI. |
| **Tab fields** | `sortNumber`, `pluginName`, `onTabTriggerRender({ key, partnerId })`, `onTabContentRender({ key, partnerId })` |

**Types:** `PartnerDto`, `CreatePartnerDto`, `PartnerQueryDto`

---
