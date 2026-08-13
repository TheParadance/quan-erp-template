# Plugin Assets Management

Quan ERP plugins can include static assets such as images, audio, or configuration files. These assets must be managed correctly to ensure they are accessible across different deployment environments.

## 1. Storing Assets

Asset files must be placed in the plugin's frontend `public` directory:

`plugins/<plugin-name>/frontend/public/`

**Example Structure:**
```text
plugins/food-menu/
└── frontend/
    └── public/
        └── audio/
            └── bell.mp3
```

---

## 2. Resolving Assets in Code

To use these assets in your React components or hooks, use the `PluginAssets` utility from `@quan-erp/shared-frontend-core`.

### `PluginAssets.network(metadata, path)`

- **`metadata`**: The plugin's metadata object (imported from your plugin's lib).
- **`path`**: The path to the asset relative to the `public/` directory, starting with a `/`.

---

## Usage Example: Playing an Audio File

This example shows how to resolve and play a notification sound stored in the plugin's public directory.

```typescript
import { PluginAssets } from '@quan-erp/shared-frontend-core';
import { metadata } from '../../lib/metadata';
import type { PluginMetadataInfo } from '@quan-erp/shared-types';

export function useNotification() {
    const playSound = () => {
        try {
            // Resolve the network URL for the asset
            const audioUrl = PluginAssets.network(metadata as PluginMetadataInfo, "/audio/bell.mp3");
            
            // Use standard browser Audio API
            const audio = new Audio(audioUrl);
            audio.play().catch(err => {
                console.warn('Could not play sound:', err);
            });
        } catch (error) {
            console.error('Error resolving plugin asset:', error);
        }
    };

    return { playSound };
}
```

## Best Practices

1.  **Always use `PluginAssets`**: Never hardcode URLs or relative paths like `/audio/bell.mp3` directly in your code, as the plugin might be served from a different base path or subdomain in production.
2.  **Type Casting**: Ensure you cast your metadata to `PluginMetadataInfo` if required by the TypeScript compiler.
3.  **Error Handling**: Always wrap media playback in a `try...catch` block and handle browser autoplay restrictions (e.g., catching `play()` promise errors).
