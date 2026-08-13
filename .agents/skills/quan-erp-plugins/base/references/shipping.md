> Parent skill: [Base Plugin](../SKILL.md)

## 9. Partner shipping address

> Export names use **Partner**; some `APINames` use **Parnter** (typo — keep as-is).

### `useCreateParnterShippingAddressQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, { partnerId: number } & CreatePartnerShippingAddressDto, unknown>` |
| **APINames** | `useCreateParnterShippingAddressQuery` |
| **DTO** | `address`, `countryId`, `stateId`, `divisionId`, `townshipId`, `postalCode?`, `isDefault?`, `lat?`, `lng?` |

### `useUpdatePartnerShippingAddressQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, PartnerShippingAddressDto, unknown>` |
| **APINames** | `useUpdateParnterShippingAddressQuery` |

### `useDeletePartnerShippingAddressQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<any, Error, { id: number }, unknown>` |
| **APINames** | `useDeleteParnterShippingAddressQuery` |

---
