# Plugin Package Naming Convention

All plugins in the Quan ERP ecosystem MUST follow a strict naming convention in their `package.json` files. This ensures consistency for internal package management, cross-plugin dependencies, and automated build processes.

## The Naming Pattern

The package `name` property must follow this structural pattern:

`@quan-erp-plugins/<plugin-name>-<side>`

### Components:
- **`@quan-erp-plugins/`**: Every plugin package MUST be scoped under this prefix.
- **`<plugin-name>`**: This part MUST exactly match the `name` property defined in the plugin's root [module.metadata.json](file:///Users/jianshangquan/App-Developemnt/ThePradanceCodeProject/quan-erp-node/developers/quan-erp-food-menu/plugins/fleet-management/module.metadata.json).
- **`<side>`**: Must be either `backend` or `frontend`.

---

## Examples

If your plugin's `module.metadata.json` is configured as follows:

```json
{
  "name": "fleet-management",
  "version": "1.0.0"
}
```

Then your `package.json` files must be named as follows:

### Backend (`plugins/fleet-management/backend/package.json`)
```json
{
  "name": "@quan-erp-plugins/fleet-management-backend",
  ...
}
```

### Frontend (`plugins/fleet-management/frontend/package.json`)
```json
{
  "name": "@quan-erp-plugins/fleet-management-frontend",
  ...
}
```

---

## Why This Matters

1.  **Cross-Plugin Injection**: When using `@Inject(Service, "fleet-management")`, the system uses these names to locate the corresponding package.
2.  **Automated Publishing**: The build and release scripts rely on this pattern to correctly tag and publish packages to the internal registry.
3.  **Dependency Resolution**: Consistent naming prevents version conflicts and ensures that frontend components can correctly reference their backend counterparts.

> [!WARNING]
> Mismatched names between `module.metadata.json` and `package.json` will cause dependency injection failures and build errors. Always ensure they are perfectly synced.
