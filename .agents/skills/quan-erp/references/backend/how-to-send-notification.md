# How to Send Notifications (Backend)

This document explains how to trigger system notifications and push notifications from a backend service using the `NotificationService`.

> [!IMPORTANT]
> **Scope Limitation**: Real-time notifications and callbacks are only supported for pages under the `/app/` path. This is because the core layout for `/app/` handles the initialization of the Firebase Service Worker and the matching of incoming notifications to registered plugin callbacks. If a page exists outside of the `/app/` scope, you must implement a separate FCM service and manual notification handling logic specifically for that route.


## 1. Injection

The `NotificationService` is a built-in core service. To use it in your plugin, inject it using the `@Inject` decorator with the `ContainerRegistryManager.BUILTIN_PLUGIN` scope.

```typescript
import { Inject, ContainerRegistryManager } from "@quan-erp/shared-backend-core";
import { NotificationService } from "@quan-erp/shared-backend-core";

@Service()
export class YourService {
    @Inject(NotificationService, ContainerRegistryManager.BUILTIN_PLUGIN)
    private notificationService: NotificationService;
}
```

## 2. Sending a Notification

Use the `send` method to dispatch a notification. You can target specific users or roles.

### Example: Notifying Participants of an Event

```typescript
import metadata from "../../../module.metadata.json" with { type: "json" };

async notifyParticipants(event: CalendarEventEntity) {
    if (!event.participants?.length) return;

    await this.notificationService.send({
        userIds: event.participants.map(p => p.id),
        title: "Event Update",
        subtitle: event.summary,
        body: `The event "${event.summary}" has been updated.`,
        topic: "calendar.event_updated",
        url: `/app/calendar/?date=${event.startDate}`, // Deep link for in-app navigation
        pluginName: metadata.name, // Matches the plugin identity
        data: {
            // Essential for mobile/push notification routing
            url: `/app/calendar/?date=${event.startDate}`,
            pluginName: metadata.name,
            topic: "event.update"
        }
    });
}
```

## 3. Parameter Reference

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `userIds` | `number[]` | (Optional) List of user IDs to receive the notification. |
| `roleIds` | `number[]` | (Optional) List of role IDs to receive the notification. |
| `title` | `string` | The main headline of the notification. |
| `subtitle` | `string` | (Optional) A secondary headline or summary. |
| `body` | `string` | The detailed content message. |
| `topic` | `string` | Internal identifier for filtering notifications in the frontend. |
| `url` | `string` | (Optional) Navigation path when the notification is clicked. |
| `pluginName`| `string` | The name of the plugin originating the notification (use `metadata.name`). |
| `data` | `object` | Additional payload. **Must include `url`, `pluginName`, and `topic`** for native push notification handling. |

## 4. Frontend Interaction

Sending a notification from the backend often requires a corresponding handler in the frontend to perform real-time UI updates or navigation.

To implement the frontend receiver for your notifications, refer to the [Notification Callback Registry](../frontend/notification-callback-registry.md).

### Summary of Workflow:
1.  **Backend**: Call `notificationService.send` with a specific `pluginName` and `topic`.
2.  **Frontend**: Register a callback for the same `pluginName` in the plugin's `register` method in `index.tsx`.
3.  **Action**: The callback executes immediately when the notification is received (e.g., refreshing a list or automatically navigating to a deep link).

