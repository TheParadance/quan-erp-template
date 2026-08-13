> Parent skill: [Base Plugin](../SKILL.md)

## 1. Core / app

### `useAppRegistry`
| | |
|---|---|
| **Kind** | store |
| **Signature** | `useAppRegistry<U = AppRegistryState>(selector?: (state: AppRegistryState) => U): U` |
| **APINames** | `useAppRegistry` |
| **What** | Bound app registry (auth/org/`queryClient`, etc.). |
| **Notes** | Single call with optional selector (unlike other stores). Prefer this for `queryClient` access. |

### `queryClient`
| | |
|---|---|
| **Kind** | utility (runtime) |
| **APINames** | `queryClient` |
| **What** | Shared TanStack Query client. |
| **Notes** | Exposed in `setup-prod`; **no** named package wrapper. Use `useAppRegistry(s => s.queryClient)` or `PluginAPI.use('builtin', APINames.queryClient)`. |

### `navigate`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `navigate(path: string, option?: NavigateOptions): void` |
| **APINames** | `navigate` |
| **What** | Global react-router navigate. |
| **Example** | `navigate('/sales/orders', { replace: true })` |

### `getViteEnv`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `getViteEnv(): { get(key: string): string \| undefined }` |
| **APINames** | `getViteEnv` |
| **What** | Read runtime web env (`VITE_BACKEND_API`, `VITE_APP_NAME`, …). |
| **Example** | `getViteEnv().get('VITE_BACKEND_API')` |

### `APINames`
| | |
|---|---|
| **Kind** | enum |
| **What** | Registry of PluginAPI string keys (see §0). |

---
