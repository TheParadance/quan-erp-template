# How to Create a Workflow Node (Backend)

This guide outlines the standard procedure for creating and registering custom Workflow nodes in the Quan ERP backend.

> [!NOTE]
> **Imports**: Core workflow types like `IWorkflowNode`, `ExecutionContext`, `NodeResultType`, `PromisableReturn`, `NodeResult`, `PropsType`, and `SchemaToType` should ALWAYS be imported from `@quan-erp/shared-backend-core`.

## 1. Workflow Node Components

A workflow node consists of three main data features:
- **Props**: The configuration values provided by the user from the input (UI).
- **Args**: Values injected from the return output of a previous workflow node.
- **ReturnType**: The value returned by this node, which will be passed to the next node(s).

### 1.1 Declaring Types (Props and ReturnType)
Workflow nodes require strictly typed `Props` and `ReturnType`. We use JSON schema definitions alongside `PropsType` and `SchemaToType` to automatically infer TypeScript types and enforce validation.

> [!NOTE]
> `PropsType` and `SchemaToType` MUST be imported from `@quan-erp/shared-backend-core`.

```typescript
import { PropsType, SchemaToType } from "@quan-erp/shared-backend-core";

const inputSchema = {
    type: 'number',
} as const satisfies PropsType;
type Props = SchemaToType<typeof inputSchema>;

const returnSchema = {
    type: 'object',
    properties: {
        bookingId: {
            type: 'number'
        },
    }
} as const satisfies PropsType;
type ReturnType = SchemaToType<typeof returnSchema>;

// Define your Args type (often just {} if not heavily using injected arguments)
export type Args = {};
```

These schemas not only provide type safety in your `process()` function but also help define the structure required by the frontend workflow editor.

## 2. Execution Lifecycle

The workflow executor manages the execution of nodes. The lifecycle of a single node execution is as follows:

1. **`process()`**: The executor first calls the `process(context, uid, props, args)` method of the node.
2. **`nextToExecute()`**: After `process()` completes, the executor calls `nextToExecute(context, uid, args)` to determine the path forward.
3. **Routing**:
   - If `nextToExecute()` returns `null`, the executor will automatically continue execution based on the current node's `next` array (the edges connected in the UI).
   - If `nextToExecute()` returns a `string[]` (array of node IDs), the executor will execute all the nodes specified by those IDs instead of the default `next` array.

## 3. The Execution Context (`ExecutionContext`)

In every workflow execution, a new `ExecutionContext` instance is created and passed to all nodes. 
- It maintains the state of the workflow and its execution.
- It stores the return states from executed nodes.

### Using Previous Node Values
Because the `ExecutionContext` stores the state, when you need to use a return value from one node in another node's `props`, you must resolve it using `context.pipeData.resolve(props)`:

```typescript
process(context: ExecutionContext, uid: string, props: Props, args: any): PromisableReturn<NodeResultType<ReturnType>> {
    // context.pipeData.resolve() recursively evaluates expressions (e.g. ${{node_123.output}})
    // replacing them with actual values stored in the ExecutionContext.
    // ALWAYS call this before using props in your logic, as raw props contain unresolved UI string mappings.
    const resolvedProps = context.pipeData.resolve(props);
    
    // Example: evaluating a boolean expression
    const evaluateResult = eval(resolvedProps.expression);
    
    // Wrap the result in NodeResult before returning
    return NodeResult.single(evaluateResult as boolean);
}
```

### Manually Executing Another Node (Sub-executions)
Sometimes, a node's logic requires it to manually trigger and wait for the result of another node (e.g., an AI Agent node invoking an AI Tool node). Instead of relying on the default lifecycle `nextToExecute` routing, you can directly call `context.execute()` to run another node.

```typescript
// Example from ai-agent-workflow-node.ts

// 1. Manually trigger the target node. `context.execute` bypasses normal UI edges
// and forces the node to run right now with the injected `args`.
const toolResult = await context.execute(toolNodeId, onToolProps.arguments);

// 2. toolResult is of type NodeResultType. You must access the raw payload from `.result`
const actualOutputPayload = toolResult.result[0];

// 3. You can now use the executed node's output in the current node's logic
```

When you use `context.execute(nodeId, args)`:
1. **Suspension**: The executor pauses the current node's `process()` execution.
2. **Lookup**: It looks up the `nodeId` in the workflow graph.
3. **Execution**: It executes the target node's `process()` method, passing the provided `args` directly into it.
4. **Resolution**: It returns the full `NodeResultType` object from the target node, which you can destructure or read to continue your current logic.

## 4. Defining the Execution Path (`nextToExecute`)

You can define custom routing logic by implementing the `nextToExecute` method. This is useful for conditional nodes (like `IfNode`) or loop nodes.

```typescript
// Example from if-workflow-node.ts
nextToExecute(context: ExecutionContext, uid: string, args: NodeResultType<ReturnType>): PromisableReturn<string[]> | PromisableReturn<null> {
    const current = context.findWorkflowNodeById(uid);
    const ifTrue = current?.next?.[0];
    const ifFalse = current?.next?.[1];
    
    let result = null;
    if (args[0] && ifTrue?.id) result = [ifTrue.id];
    if (!args[0] && ifFalse?.id) result = [ifFalse.id];
    
    return result;
}
```

## 5. Registering the Node in the Plugin Module

Once you have defined your workflow node class, you must register it in your plugin's root module (e.g., `hotel-management.module.ts`) by injecting it into the `workflowNodes` array of the `@Module` decorator.

```typescript
import { Module } from "@quan-erp/shared-backend-core";
import { OnBookingWorkflowNode } from "../workflow/OnBooking.workflow.js";

@Module({
    name: metadata.name,
    // ... providers, controllers, entities, etc.
    workflowNodes: [
        OnBookingWorkflowNode
    ]
})
export default class HotelManagementModule {}
```

This registration step is critical for the backend to mount your custom node and expose its schema definition to the frontend workflow editor.

## 6. Triggering the Workflow Programmatically

For workflow nodes that act as event triggers (e.g., `isTriggerable: true`), you must programmatically execute the associated workflows when the event occurs in your application code (such as inside a Controller or Service).

To do this, inject the `WorkflowService` from the `BUILTIN_PLUGIN` namespace, find all active workflows initialized with your custom node ID, and execute them.

```typescript
import { Controller, Inject, WorkflowService, ContainerRegistryManager } from "@quan-erp/shared-backend-core";
import { OnBookingWorkflowNode } from "../../workflow/OnBooking.workflow.js";
import metadata from '../../../../module.metadata.json' with { type: "json" };

@Controller("/bookings")
export class BookingController {
    
    // Inject the core WorkflowService
    @Inject(WorkflowService, ContainerRegistryManager.BUILTIN_PLUGIN)
    workflowService: WorkflowService;

    async createBooking() {
        // ... business logic to create booking ...

        // 1. Find all active workflows that start with this trigger node
        const workflows = await this.workflowService.findByInitId(
            `${metadata.name}/${OnBookingWorkflowNode.NODE_ID}`, 
            { active: true }
        );

        // 2. Execute each workflow with the required arguments
        workflows.map(w => {
            return this.workflowService.executeWorkflow({
                workflow: w,
                args: {
                    bookingId: 1, // Pass arguments defined in your node's Args schema
                    bookingSource: "web"
                },
            });
        });
        return ResponseDto.okWithEmpty()
    }
}
```

## 7. Full Node Example (`ai-model-workflow-node.ts`)

Below is a complete, real-world example of a workflow node (the AI Model node) that ties together schema definition, dependency injection, and node execution.

```typescript
import { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";
import { 
    AIModelService, 
    AIOptions, 
    OnToolCallCallback,
    Inject,
    ExecutionContext,
    WorkflowNodeManager,
    IWorkflowNode, 
    NodeResultType, 
    PropsType, 
    PromisableReturn, 
    SchemaToType, 
    WorkflowNodeDefination, 
    NodeResult 
} from "@quan-erp/shared-backend-core";
import metadata from "../../../module.metadata.json" with { type: 'json' }

const inputSchema = {
    type: 'object',
    properties: {
        model: {
            type: 'string'
        },
    }
} as const satisfies PropsType;
type Props = SchemaToType<typeof inputSchema>;

const returnSchema = {
    type: 'string',
} as const satisfies PropsType;
export type ReturnType = SchemaToType<typeof returnSchema>;

export type Args = {
    prompt: string,
    options: AIOptions<any>
    onToolCall: OnToolCallCallback,
}

export class AIModelWorkflowNode implements IWorkflowNode<Props, ReturnType, Args> {
    static NODE_ID: string = 'ai-model'

    @Inject(AIModelService)
    aiModelService: AIModelService

    async process(context: ExecutionContext, uid: string, props: Props, args: Args): Promise<NodeResultType<ReturnType>> {
        const model = await this.aiModelService.getInstance(props.model)
        if (!model) {
            throw new Error(`Model ${props.model} not found`)
        }
        const result = await model.query(args.prompt, {
            onToolCall: args.onToolCall,
        }, args.options)
        return NodeResult.single(result)
    }
    
    nextToExecute(context: ExecutionContext, uid: string, args: NodeResultType<ReturnType>): PromisableReturn<string[]> | PromisableReturn<null> {
        return null;
    }
    
    getDefination(): WorkflowNodeDefination {
        return {
            // NOTE FOR PLUGINS:
            // Custom plugins should define their type as `<plugin-name>/<node-id>`.
            // You can import your plugin name from your module's metadata.json:
            // import metadata from "../../../module.metadata.json" with { type: 'json' };
            // type: `${metadata.name}/${AIModelWorkflowNode.NODE_ID}`,
            
            type: `${metadata.name}/${AIModelWorkflowNode.NODE_ID}`,
            group: ['any', 'ai-model'],
            displayName: 'AI Model',
            description: 'AI Model',
            props: inputSchema,
            isTriggerable: false,
            returnType: {
                type: 'array',
                items: returnSchema
            }
        }
    }
}
```
