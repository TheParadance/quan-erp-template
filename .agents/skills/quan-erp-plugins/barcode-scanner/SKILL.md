# Barcode Scanner Plugin Skill

This plugin provide barcode scanning functionality to the system, allowing other plugins to trigger barcode/QR code scans and receive the results.

## Features

- **Programmatic Barcode Scanning**: Trigger camera-based barcode scanning from anywhere in the application.
- **Global State Management**: Uses a centralized Zustand store to manage scanner visibility, configuration, and results.
- **Flexible Configuration**: Supports multiple barcode formats (QR, EAN, UPC, etc.), camera selection (front/back), torch control, and adjustable delay.
- **Promise-based API**: A simple `scan()` method that returns a Promise, resolving with the scan result when a barcode is successfully captured.
- **Audio Feedback**: Built-in support for audio feedback on successful scans.
- **Customizable UI**: Includes a standard scanner component that can be customized via configuration.

## Backend Exported Classes

Currently, the `barcode-scanner` plugin does not export any classes to the backend registry for use by other agents.

## Frontend Exported Features

Other plugins can interact with the barcode scanner via the `PluginAPI` or by direct import from `@quan-erp-plugins/barcode-scanner-frontend`.

### Hooks & Store Access

- **`useBarcodeScannerStore()`**: A hook that returns the global scanner store. Used within React components to control the scanner and listen to its state.
- **`getBarcodeScannerStore()`**: Provides access to the scanner store outside of React components.

### Store API (`BarcodeScannerStore`)

The store provides the following state and actions:
- `show`: Boolean indicating if the scanner UI is currently visible.
- `configuration`: An object containing scanner settings:
    - `facingMode`: "environment" or "user".
    - `torch`: Boolean to toggle the flashlight.
    - `formats`: Array of barcode formats to decode.
    - `delay`: Time in ms between scan attempts.
- `scan(props?)`: Triggers the scanner UI and returns a `Promise<Result>`.
- `close()`: Hides the scanner UI and cancels any pending scan.
- `reset()`: Resets the scanner to its default state.

### API Names
The `APINames` enum provides keys for accessing features via `PluginAPI`:
- `useBarcodeScannerStore`
