> Parent skill: [Base Plugin](../SKILL.md)

## 20. AI assistant

### `useAvailableAssistantQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?, option?) => UseQueryResult<AIAssistantDto[], Error>` |
| **APINames** | `useAvailableAssistantQuery` |
| **DTO** | `shortId`, `name`, `description`, `icon`, `model`, `tools`, `allowedRoles`, `systemPrompt`, `createdBy` |

### `AssistantDropdown`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `AssistantDropdown` |
| **Key props** | `value?: string \| TakeAndPartialRest<AIAssistantDto, "shortId">`, `setValue(v?, assistant?)`, `allowClear?`, `isCompact?`, `trigger?` |
| **Types exported** | `AssistantDropdownProps`, `AssistantDropdownValue` |

---
