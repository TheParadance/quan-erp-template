# Module Metadata Reference

The `module.metadata.json` file is a mandatory file for every plugin. It defines the plugin's identify, versioning, and dependencies. It is located at the root of the plugin directory: `plugins/<plugin-name>/module.metadata.json`.

## Configuration Fields

- **`name`**: (String) The unique identifier for the plugin. This name is used in the `@Module` decorator and for dependency resolution.
- **`type`**: (String) Reserved for future use (currently often left empty).
- **`pluginVersion`**: (String) The version of the plugin itself (Semantic Versioning).
- **`description`**: (String) A brief description of what the plugin does.
- **`moduleEntryObject`**: (String) The name of the exported module class in the backend (typically `"Module"`).
- **`requiredBasedVersion`**: (String) The minimum version of the core platform required by this plugin.
- **`pluginDependencies`**: (Object) A list of other plugins that are **strictly required** for this plugin to function. Each entry must specify a version range (Semantic Versioning).
    - *Example*: `"products": "^1.0.0"` means the plugin requires the `products` plugin with at least version 1.0.0.

## Example: `module.metadata.json`

```json
{
    "name": "inventory",
    "type": "",
    "pluginVersion": "1.0.0",
    "description": "Inventory management system",
    "moduleEntryObject": "Module",
    "requiredBasedVersion": "1.0.0",
    "pluginDependencies": {
         "products": "^1.0.0",
         "accounting": "^1.0.0"
    }
}
```

## Importance of Dependencies

The `pluginDependencies` field is critical because:
1. It ensures the core system loads dependent plugins *before* the current plugin.
2. It prevents a plugin from starting if its required dependencies are missing or have incompatible versions.
