# Adding AI Tools to Services

This document describes how to expose service methods as AI tools that can be called by the AI assistant (and MCP clients such as ChatGPT).

For the chat/realtime **SDK** (providers, `query` / `stream`, token `onUsage`, `AISDKAPIType`), see **[AI Assistant SDK](./ai-sdk.md)**.

## The `@AITool` Decorator

Use the `@AITool` decorator to mark a service method as an AI tool. This decorator registers the tool with the system and provides the necessary metadata for the AI model.

Source type: `AIToolOption` / `MCPAIToolAnnotations` in `@quan-erp/shared-backend-core` (`core/ai-tool.ts`).

### Configuration Properties

The `@AITool` decorator accepts an object with the following properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `requiredApiPermission` | `Array<{ method: string, url: string }>` | The API permissions required to execute this tool. This is used for security and access control. |
| `argParser` | `(args: any) => any[]` | A function that parses the raw arguments provided by the AI model into an array of arguments expected by the service method. |
| `mcpAnnotations` | `MCPAIToolAnnotations` (optional) | MCP behavioral hints for clients (advisory only — not security). Prefer setting on every tool. |
| `toolDetail` | `Object` | The standard OpenAI tool definition, including the function name, description, and parameter schema. |

### `mcpAnnotations` (MCP tool annotations)

Place **as a sibling of `toolDetail`**, never inside `toolDetail.function` or `parameters`.

| Hint | Type | When to set |
| :--- | :--- | :--- |
| `readOnlyHint` | `boolean` | `true` for GET / list / find / read-only tools. `false` for create / update / delete / send. |
| `openWorldHint` | `boolean` | `true` when the tool calls external systems (e.g. Firebase push, third-party APIs). `false` for closed ERP/domain operations. |
| `destructiveHint` | `boolean` | `true` for delete / irreversible ops. Meaningful mainly when `readOnlyHint` is `false`. |

**Conventions used in core:**

| Operation | `readOnlyHint` | `openWorldHint` | `destructiveHint` |
| :--- | :---: | :---: | :---: |
| GET / list / search | `true` | `false` | `false` |
| POST create / PUT update | `false` | `false` | `false` |
| DELETE | `false` | `false` | `true` |
| External push (e.g. FCM) | `false` | `true` | `false` |

These hints guide MCP clients (e.g. auto-approve read-only tools, confirm destructive ones). They do **not** enforce permissions — always set `requiredApiPermission` correctly.

### Example Implementation

In your service (e.g., `my-item.service.ts`) for plugin `my-plugin`:

```typescript
import { Service, AITool } from "@quan-erp/shared-backend-core";

@Service()
export class MyItemService {
    
    /**
     * Retrieves an item by id.
     */
    @AITool({
        requiredApiPermission: [
            { method: 'get', url: '/my-plugin/item/' }
        ],
        argParser: (args: any) => {
            // Convert raw AI arguments to the expected service parameters
            return [Number(args.itemId)]
        },
        mcpAnnotations: {
            readOnlyHint: true,
            openWorldHint: false,
            destructiveHint: false,
        },
        toolDetail: {
            type: 'function',
            function: {
                name: "get-my-item",
                description: "Get an item by id.",
                parameters: {
                    type: "object",
                    properties: {
                        itemId: {
                            type: "number",
                            description: "The ID of the item.",
                        },
                    },
                    required: ["itemId"],
                },
            },
        }
    })
    async getItem(itemId: number): Promise<any> {
        // Implementation logic
        const data = await this.repo.findOne({
            where: {
                id: itemId,
            },
        });
        return data;
    }

    @AITool({
        requiredApiPermission: [
            { method: 'delete', url: '/my-plugin/item/:id' }
        ],
        argParser: (args: any) => [Number(args.itemId)],
        mcpAnnotations: {
            readOnlyHint: false,
            openWorldHint: false,
            destructiveHint: true,
        },
        toolDetail: {
            type: 'function',
            function: {
                name: "delete-my-item",
                description: "Soft-delete an item by id.",
                parameters: {
                    type: "object",
                    properties: {
                        itemId: { type: "number", description: "The ID of the item." },
                    },
                    required: ["itemId"],
                },
            },
        }
    })
    async deleteItem(itemId: number): Promise<void> {
        // ...
    }
}
```

## Best Practices

1. **Descriptive Metadata**: The `name` and `description` in `toolDetail.function` are critical. They tell the AI model *when* and *how* to use the tool.
2. **Naming Convention**: Tool names **MUST** be hyphen-based (kebab-case) (e.g., `get-my-item`).
3. **Schema Definition**: Provide a clear JSON schema for `parameters` to ensure the AI model provides correctly structured input.
4. **Type Conversion**: Always use `argParser` to sanitize and convert types (e.g., ensuring IDs are numbers) before they reach your service logic.
5. **Security**: Ensure `requiredApiPermission` accurately reflects the permissions needed for the operation.
6. **MCP annotations**: Always set `mcpAnnotations` to match real behavior. Do not mark write/delete tools as `readOnlyHint: true`. Keep annotations as a sibling of `toolDetail`, not nested inside it.
