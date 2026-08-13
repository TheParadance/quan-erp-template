# Notification Callback Registry

This document outlines how to handle real-time notifications in the frontend by registering callbacks that trigger when the backend sends a notification.

## Overview

The Quan ERP notification system allows the backend to target specific plugins. When a notification is received in the frontend (either via Firebase FCM or in-app sync), the system looks for registered callbacks associated with the `pluginName` sent from the backend.

> [!IMPORTANT]
> **Route Scope**: Notification registries and callbacks are only functional within the `/app/*` route scope. The root layout of the `/app/` section is responsible for initializing the Service Worker and triggering the matched callbacks. If a page exists outside of the `/app/` scope (e.g., custom landing pages), you must implement a separate FCM service and manual handling logic to support real-time notifications on those routes.


## 1. Backend: Sending the Notification

To trigger a frontend callback, the backend must specify the `pluginName` when sending a notification via `NotificationService`.

For detailed backend implementation details, see [How to Send Notifications (Backend)](../backend/how-to-send-notification.md).

```typescript
// Backend Service
await this.notificationService.send({
    userIds: [user.id],
    title: "Action Required",
    body: "Please check the new record",
    pluginName: "my-plugin", // Critical: Must match frontend registration
    topic: "record-updated",
    url: "/app/my-plugin/detail/123",
    data: {
        pluginName: "my-plugin", // Required for FCM routing
        url: "/app/my-plugin/detail/123", // required for foreground and background native notification clicked,
         topic: "record-updated",
    }
});
```

## 2. Frontend: Registering the Callback

Plugins should register their notification handlers in their entry file (`index.tsx`). This ensures that the logic is active as soon as the plugin is loaded.

### Types of Registries

1.  **In-App Notification Registry**: Triggers when a notification is created/synced in the system database.
2.  **Firebase Foreground Registry**: Triggers when a push notification is received while the app is active.

### Implementation Example

In your plugin's `src/index.tsx`:

```typescript
import { 
    getInAppNotificationRegistry, 
    getFirebaseForegroundNotificationRegistry,
    navigate 
} from "@quan-erp/base-frontend";
import metadata from "../../module.metadata.json" with { type: "json" };

const Plugin: PluginModule = {
    register(AppRegistry: AppRegistryState) {
        // ... other initialization

        // 1. Register for In-App Notifications
        getInAppNotificationRegistry().register(metadata.name, (notification) => {
            console.log("In-app notification received:", notification);
            // Example: Auto-navigate if a URL is provided
            if (notification.url) {
                navigate(notification.url);
            }
        });

        // 2. Register for Firebase Foreground Push Notifications
        getFirebaseForegroundNotificationRegistry().register(metadata.name, (payload) => {
            console.log("Push notification received in foreground:", payload);
            // Handle real-time UI updates or custom toasts
        });

        // 3. Register for Firebase Background Push Notifications
        getFirebaseBackgroundNotificationRegistry().register(metadata.name, (payload) => {
            console.log("Push notification received in background:", payload);
            // Handle background tasks or data syncing
        });
    }
};
```

## Best Practices

-   **Use Metadata**: Always use `metadata.name` for the registration key to ensure consistency between the plugin's identity and its notification routing.
-   **Topic Filtering**: If your plugin handles multiple types of notifications, use the `notification.topic` field within your callback to differentiate logic.
-   **Cleanup**: While `init()` runs once, if you register callbacks within specific components, ensure you `deregister` them on unmount to prevent memory leaks.

```typescript
// Example of topic filtering
getInAppNotificationRegistry().register(metadata.name, (noti) => {
    if (noti.topic === "order.completed") {
        // Refresh specific store
    }
});
```
