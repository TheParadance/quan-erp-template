# Web Thermal Printer: Technical Reference (@quan-erp/web-thermal-printer)

This package provides a high-level fluent API for ESC/POS thermal printing directly from the browser. It abstracts complex hardware command sequences and provides a robust execution engine for stable printing over Web Bluetooth and Web Serial.

---

## 🏗 Core Architecture

### Connection Modes
The library supports two primary communication channels:
- **Bluetooth**: Leverages the Web Bluetooth API to connect to BLE-enabled thermal printers.
- **Serial**: Leverages the Web Serial API for physical USB or RS232 connections.

### Resilience Strategy
- **Chunked Transmission**: For Bluetooth connections, the engine automatically splits data into small chunks (default 100 bytes) with configurable delays. This prevents packet loss on mobile BLE stacks (Android) and gives the thermal head time to "burn" dense data (images).
- **Execution Lifecycle**: The `execute()` method manages the state machine, handling cancellations and buffer flushes automatically.

---

## 🧭 WebThermalPrinter Class Reference

### 1. Lifecycle & Connection

#### `constructor(options: { mode: ConnectionMode, paperSize: PaperSize })`
Initializes a new printer instance. ConnectionMode defaults to `Bluetooth`.

#### `connect(options?: { baudRate?: number }): Promise<boolean>`
Requests device permission and establishes a connection.
- **Bluetooth**: Filters for service UUID `000018f0-0000-1000-8000-00805f9b34fb`.
- **Serial**: Opens a port with the specified baud rate (default 9600).

#### `disconnect(): Promise<void>`
Gracefully closes the active GATT server or Serial port.

#### `isConnected(): boolean`
Returns the real-time connectivity state of the device.

---

### 2. Execution Engine

#### `execute(props?: { chunkSize, smallPayloadDelay, largePayloadDelay }): Promise<void>`
The primary orchestration method. Flattens the command buffer and transmits it to the hardware.
- **Props**: Allows fine-tuning the pacing (delays) for different hardware speeds.

#### `cancel(cutPaper?: boolean): void`
Aborts an ongoing execution or clears the unprinted buffer.

#### `initialize(): this`
Appends the ESC @ (Initialize) command to the buffer.

---

### 3. Printing API (Fluent)

#### 📝 Text & Localization
- **`line(text, options)`**: Wrapper for printing a single line. Defaults to Canvas-based rendering for multi-language safety.
- **`printText({ text, style, align, useGBK })`**: Native hardware font printing. Supports GBK encoding for legacy Chinese printers.
- **`printCanvasText({ text, font, align, bold })`**: Uses a temporary browser canvas to render text as a bitmap. **MANDATORY for Burmese, Khmer, or complex Unicode scripts.**
- **`enableChineseMode()` / `disableChineseMode()`**: Toggles FS & / FS . hardware Chinese font support.
- **`enableUTF8()`**: Sends FS W 1 for modern UTF-8 support.

#### 🖼 Media & Graphics
- **`printImage({ canvas, align, mode })`**: Converts a canvas bitmap into ESC/POS raster format. Normalizes width to `PaperSize` limits.
- **`printImageFromUrl({ url, ... })`**: Async helper to load and print remote images.
- **`printQRCode({ data, size, align })`**: Native hardware QR generation (Model 2 supported).
- **`printBarcode({ text, type, align })`**: Hardware barcode generation (supports UPC, EAN, CODE128, etc.).

#### 📊 Tables
- **`printTableRow(columns)`**: Prints a row where each column has its own width and alignment.
- **`printFramedRow(columns, isHeader)`**: Prints a table row with ASCII box-drawing characters (┌ ┬ ┐).
- **`printCanvasTableRow(columns)`**: Renders a multi-column row to a single canvas bitmap before printing. Ideal for complex layout safety.

---

## 🛠 Type Reference

### `ConnectionMode`
- `Bluetooth`: 'bluetooth'
- `Serial`: 'serial'

### `PaperSize`
- `80mm`: 48 characters width (576 dots)
- `58mm`: 32 characters width (384 dots)

### `Align`
- `Left`: 0
- `Center`: 1
- `Right`: 2

### `BarcodeTypes`
Defines supported hardware barcode symbologies: `UPC_A`, `UPC_E`, `EAN13`, `EAN8`, `CODE39`, `ITF`, `CODABAR`, `CODE93`, `CODE128`.

### `TextStyle`
```typescript
interface TextStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    font?: TextFonts; // Normal (0), Thin (1)
    width?: number;   // 1-8
    height?: number;  // 1-8
}
```
