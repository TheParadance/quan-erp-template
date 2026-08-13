> Parent skill: [Base Plugin](../SKILL.md)

## 2. Notifications

### `getInAppNotificationRegistry`
| | |
|---|---|
| **Kind** | registry |
| **Signature** | `getInAppNotificationRegistry(): InAppNotificationCallbackRegistry` |
| **APINames** | `inAppNotificationRegistry` |
| **What** | Register/deregister in-app notification handlers per plugin. |
| **API surface** | `{ register(pluginName, callback): string; deregister(id): void }` — callback `(notification: NotificationDto) => void` |
| **Example** | |
```ts
const id = getInAppNotificationRegistry().register('my-plugin', (n) => {
  console.log(n.title, n.body);
});
getInAppNotificationRegistry().deregister(id);
```

### `getFirebaseForegroundNotificationRegistry`
| | |
|---|---|
| **Kind** | registry |
| **Signature** | same registry shape; callback `(notification: MessagePayload) => void` |
| **APINames** | `firebaseForegroundNotificationRegistry` |

### `getFirebaseBackgroundNotificationRegistry`
| | |
|---|---|
| **Kind** | registry |
| **Signature** | same as foreground |
| **APINames** | `firebaseBackgroundNotificationRegistry` |

**Related types:** `NotificationDto` (`id`, `title?`, `body?`, `topic`, `url?`, `data?`, `pluginName`, `isRead`, …), `FirebaseNotificationData`.

---
