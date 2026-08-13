> Parent skill: [Base Plugin](../SKILL.md)

## 22. Workflow

### `workflowNodes`
| | |
|---|---|
| **Kind** | registry |
| **Signature** | `(): WorflowNodeType[]` |
| **APINames** | `workflowNodes` |
| **What** | Mutable list of workflow node type registrations. Push to register. |

### `workflowGenericOnSave`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `(): ({ edges, nodes, currentNode }) => WorkflowScheme` |
| **APINames** | `workflowGenericOnSave` |

### `workflowGenericOnLoad`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `(): ({ flow, wf }) => Edge[]` |
| **APINames** | `workflowGenericOnLoad` |

### `WorkflowNode`
| | |
|---|---|
| **Kind** | component |
| **Signature** | `(props: { pluginName, children, data, id, defaultIcon?, defaultLabel?, defaultIconBg?, selected? }) => ReactNode` |
| **APINames** | `WorkflowNode` |

### `createDefaultWorkflowNodeComponent`
| | |
|---|---|
| **Kind** | utility |
| **Signature** | `(options: { defaultIcon, defaultLabel, pluginName, defaultIconBg?, hasInput?, hasOutput?, customOutputs? }) => ({ id, data, selected? }) => ReactNode` |
| **APINames** | `createWorkflowNodeComponent` |
| **Example** | |
```ts
const Node = createDefaultWorkflowNodeComponent({
  pluginName: 'sales',
  defaultLabel: 'Create Order',
  defaultIcon: <Icon />,
});
workflowNodes().push({
  type: 'sales.create-order',
  element: Node,
  onSave: workflowGenericOnSave(),
});
```

**Types:** `WorflowNodeType`, `WorkflowScheme`, `GenericNodeData`, `NodeCustomOutput`, …

---
