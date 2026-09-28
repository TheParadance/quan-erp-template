# Adding AI Tools to Services

This document describes how to expose service methods as AI tools that can be called by the AI assistant.

## The `@AITool` Decorator

Use the `@AITool` decorator to mark a service method as an AI tool. This decorator registers the tool with the system and provides the necessary metadata for the AI model.

### Configuration Properties

The `@AITool` decorator accepts an object with the following properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `requiredApiPermission` | `Array<{ method: string, url: string }>` | The API permissions required to execute this tool. This is used for security and access control. |
| `argParser` | `(args: any) => any[]` | A function that parses the raw arguments provided by the AI model into an array of arguments expected by the service method. |
| `toolDetail` | `Object` | The standard OpenAI tool definition, including the function name, description, and parameter schema. |

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
}
```

## Best Practices

1. **Descriptive Metadata**: The `name` and `description` in `toolDetail.function` are critical. They tell the AI model *when* and *how* to use the tool.
2. **Naming Convention**: Tool names **MUST** be hyphen-based (kebab-case) (e.g., `get-my-item`).
3. **Schema Definition**: Provide a clear JSON schema for `parameters` to ensure the AI model provides correctly structured input.
4. **Type Conversion**: Always use `argParser` to sanitize and convert types (e.g., ensuring IDs are numbers) before they reach your service logic.
5. **Security**: Ensure `requiredApiPermission` accurately reflects the permissions needed for the operation.
