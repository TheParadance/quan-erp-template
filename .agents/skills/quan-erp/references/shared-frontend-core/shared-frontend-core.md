# Shared Frontend Core: API Master Reference (@quan-erp/shared-frontend-core)

This document is the definitive technical source of truth for the platform's core infrastructure. It provides exhaustive details on hardware sensors, media interfaces, storage, and system services across Web, Desktop (Electron), and Mobile (Capacitor) environments.

---

## 🏗 Platform Architecture

### Singleton Pattern
All system services should be accessed via their static `.instance` property (or factory method). This ensures unified state management and platform abstraction across the application.

```typescript
const camera = Camera.instance;
```

### Environment Awareness
The internal `Platforms` service automatically detects the runtime environment to delegate API calls to the appropriate native or web bridge.

---

## 🧭 Core API Reference

### 📡 📡 Device Sensors & Attitude

#### 1. Accelerometer (`src/core/accelerometer.ts`)
- **Methods**: `start(callback)`, `stop()`.
- **Implementation**: Captures linear acceleration (excluding gravity) via the `devicemotion` event.

#### 2. Gryoscope (`src/core/gyroscope.ts`)
- **Methods**: `start(callback)`, `stop()`.
- **Note**: The class name in source is `Gryoscope` (typo).
- **Implementation**: Captures rotation rate (alpha, beta, gamma) via the `devicemotion` event.

#### 3. Motion Orientation (`src/core/motion-orientation.ts`)
- **Methods**: `start(callback)`, `stop()`, `requestOrientationPermission()`.
- **Nuance**: Includes critical iOS-specific permission check for `DeviceOrientationEvent.requestPermission()`.

#### 4. Orientation (`src/core/orientation.ts`)
- **Methods**: `getOrientation()`, `onChange(cb)`, `offChange(cb)`.
- **Implementation**: Triple-fallback logic using ScreenOrientation plugin (Mobile), window resize event (Desktop), and `orientationchange` (Web).

#### 5. User Hand Behavior (`src/core/user-hand-behavior.ts`)
- **Methods**: `start(cb)`, `stop()`, `getHand()`.
- **Logic**: Experimental tilt-detection algorithm using roll/pitch smoothing to predict Left vs. Right hand usage.

---

### 📸 Media & Hardware Integration

#### 6. Camera (`src/core/camera.ts`)
- **Methods**: `requestPermission()`, `takePicture()`, `pickImageFromGallery()`, `startPreview(videoElement)`, `stopPreview()`.
- **Logic**: Favors `facingMode: "environment"` on mobile for rear-facing capture.

#### 7. Microphone (`src/core/microphone.ts`)
- **Methods**: `requestPermission()`, `start()`, `stop()`, `getStream()`.
- **Implementation**: Uses `getUserMedia`. Automatically stops tracks on `stop()` to release system resources.

#### 8. Printer (`src/core/printer.ts`)
- **Methods**: `printHTML(html)`.
- **Implementation**: Web bridge uses a hidden window + `window.print()`. Mobile/Desktop targets are reserved for future implementation.

#### 9. Vibration & Haptics (`src/core/vibration.ts`)
- **Methods**: `vibrate(options)`, `cancel()`.
- **Implementation**: Native `ImpactStyle.Medium` pulses on mobile; `WebHaptics` library for unified browser support.

#### 10. Clipboard (`src/core/clipboard.ts`)
- **Methods**: `readText()`, `writeText(text)`, `requestPermission()`.
- **Platform**: Maps to `@capacitor/clipboard` or standard `navigator.clipboard`.

---

### 🌐 Connectivity & Context

#### 11. Bluetooth (`src/core/bluetooth.ts`)
- **Methods**: `requestPermission()`, `scan()`, `connect(id)`, `disconnect(id)`.
- **Note**: Requires user gesture on Web; native BLE Client used on Mobile.

#### 12. Network Monitoring (`src/core/network.ts`)
- **Methods**: `isOnline()`, `listenNetwork(cb)`.
- **Implementation**: Bridges `@capacitor/network` status changes with standard browser `online/offline` events.

#### 13. Battery (`src/core/battery.ts`)
- **Methods**: `getLevel()`, `isCharging()`, `onLevelChange(cb)`, `onChargingChange(cb)`.
- **Implementation**: Unified wrapper for the Web Battery API.

#### 14. Geolocation (`src/core/location.ts`)
- **Methods**: `getCurrentPosition()`, `watchPosition(cb)`, `clearWatch(id)`.
- **Implementation**: Uses `@capacitor/geolocation` on mobile; `navigator.geolocation` fallback for Web/Desktop.

#### 15. Background Location (`src/core/background-location.ts`)
- **Status**: Reserved placeholder for future background geolocation services.

---

### 💾 Storage & Persistence

#### 16. FileSystem (`src/core/filesystem.ts`)
- **Methods**: `write(path, data)`, `read(path)`, `delete(path)`, `exists(path)`, `getUri()`, `stat()`.
- **Logic**: Full disk access via `@capacitor/filesystem` on mobile; Electron bridge on desktop; `localStorage` fallback on web.

#### 17. SQLite Database (`src/core/database.ts`)
- **Methods**: `static getInstance(): Promise<SQLiteDBConnection>`.
- **Logic**: Automatically manages core SQLite connections on mobile; creates the internal `plugins` registry table.

#### 18. SQLite Driver (`src/core/sqlite.ts`)
- **Status**: Structural placeholder for low-level driver access.

#### 19. Storage / SharedPreferences (`src/core/shared-preferences.ts`)
- **Methods**: `setItem(key, value)`, `getItem(key)`, `removeItem(key)`, `clear()`.
- **Platform**: Standard key-value persistence using `@capacitor/preferences` or `localStorage`.

---

### 🛠 System & Framework Services

#### 20. Device Class Tier (`src/core/device-class-tier.ts`)
- **methods**: `detect(): Promise<"low"|"mid"|"high">`.
- **Logic**: Hardware resource scoring (RAM/CPU/Network) to determine performance profile.

#### 21. Platform Intelligence (`src/core/platform.ts`)
- **Methods**: `static isDesktop()`, `isMobile()`, `isWeb()`.
- **Detection**: Identifies environment via presence of `electron` or `Capacitor` bridges.

#### 22. System Metrics & Usage (`src/core/system.ts`)
- **Methods**: `getCPUUsage()`, `getMemoryUsage()`, `getInfo()`, `getCPUCoreCount()`.
- **Implementation**: Retrieves system analytics via Node.js bridges (Desktop) or `Device` analytics (Mobile).

#### 23. System Locale (`src/core/system-locale.ts`)
- **Method**: `getDeviceLocale()`.
- **Logic**: Returns ISO language/region code (e.g., "en-US").

#### 24. Safe Area (`src/core/safearea.ts`)
- **Status**: Placeholder for notch/inset management.

#### 25. Permissions (`src/core/permissions.ts`)
- **Status**: Structural placeholder for future centralized permission orchestration.

#### 26. Firebase (`src/core/firebase.ts`)
- **Status**: Structural placeholder for push notification integration.

#### 27. Notification (`src/core/notification.ts`)
- **Methods**: `requestPermission()`, `sendNotification(title, options)`.
- **Logic**: Handles native channel creation on Mobile (Importance: Max).

#### 28. Plugin API (`src/core/plugin-api.ts`)
- **Methods**: `expose(plugin, name, value)`, `use(plugin, name)`, `debug()`.
- **Logic**: Secure cross-plugin communication registry with read-only property protection.

#### 29. Plugin Assets (`src/core/assets.ts`)
- **Method**: `static network(metadata, path)`.
- **Logic**: Resolves absolute URLs for plugin-specific backend assets.

#### 30. Backend Api URL (`src/core/backend-api.ts`)
- **Methods**: `setBackendAPI(url)`, `getBackendAPI()`.
- **Logic**: Global management for the target backend root.

#### 31. Number Formatter (`src/core/number-formatter.ts`)
- **Method**: `static format(num, locale, options)`.
- **Logic**: High-performance local-aware formatting with internal caching of `Intl.NumberFormat` instances.

---

## 🛠 Secondary Utilities

### Version Utility (`src/utilities/version.util.ts`)
- **Methods**: `compare(v1, v2)`, `isBreakingChange(old, new)`, `analyzeVersion(old, new)`.
- **Interface**: `VersionCheckResult`.
- **Logic**: SemVer major-version comparison logic for update analysis.
