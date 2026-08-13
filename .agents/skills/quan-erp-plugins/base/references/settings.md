> Parent skill: [Base Plugin](../SKILL.md)

## 4. Settings

### `useSettingQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `useSettingQuery({ mode: 'private' \| 'public' }, option?): UseQueryResult<Record<SettingKeys, SettingValue>, Error>` |
| **APINames** | `useSettingQuery` |
| **What** | Load setting map for private or public mode. |

### `useUpdateSettingQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `useUpdateSettingQuery(): UseMutationResult<any, Error, SettingMapValue, unknown>` |
| **APINames** | `useUpdateSettingQuery` |
| **What** | Persist settings. Wrapper calls impl with `{ many: true }`. |

### `useSettingStore`
| | |
|---|---|
| **Kind** | store |
| **Signature** | returns zustand hook: `{ setting, state.isLoading, setLoading, reset, setSetting }` |
| **APINames** | `useSettingStore` |
| **Notes** | Double-call: `useSettingStore()()`. |

### `useSettingContext`
| | |
|---|---|
| **Kind** | context helper |
| **Signature** | `useSettingContext(): SettingContextType` |
| **APINames** | `useSettingContext` |
| **Key API** | `onUpdateSetting(key, value, datatype, userId?, isPublic?)`, `editedSetting` |

### `useIsContainInBottomNavBar`
| | |
|---|---|
| **Kind** | utility hook |
| **Signature** | `useIsContainInBottomNavBar(route: string): boolean` |
| **APINames** | `useIsContainInBottomNavBar` |
| **What** | Whether a route is in the mobile bottom-nav config (affects back button / FAB layout). |

**Types:** `SettingKeys` (`LOCALE`, `THEME`, `DATE_FORMAT`, `TIMEZONE`, `BUSINESS_NAME`, `PRIMARY_COLOR`, …), `SettingDataType`, `SettingMapValue`, `SettingValue`.

---
