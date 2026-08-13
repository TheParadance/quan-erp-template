# Request & Response DTOs

In Quan ERP, all backend API communication MUST follow a standardized data structure. This is enforced using the `RequestDto<T>` and `ResponseDto<T>` classes from `@quan-erp/shared-backend-core`.

## Core Principle

> [!IMPORTANT]
> **Every** request payload and **every** response body must be wrapped in their respective DTO wrapper. Never return raw data or accept unwrapped payloads in Controller methods.

## ResponseDto<T>

The `ResponseDto` ensures that every API response includes consistent metadata (timestamp, status, message, and a unique reference ID).

### Structure
```typescript
{
    timestamp: string;      // ISO format
    status: "success" | "error";
    message?: string;       // User-friendly message (localized if possible)
    code?: HttpStatus;      // Optional HTTP status code for errors
    referenceId: string;    // Unique UUID for tracking this specific response
    payload: T;             // The actual data
}
```

### Static Methods

- **`ResponseDto.ok(data, options?)`**: Returns a successful response with a payload.
- **`ResponseDto.okWithEmpty()`**: Returns a successful response with a `null` payload. Use this for operations that don't need to return data (e.g., Delete or simple updates).
- **`ResponseDto.error(message, code?, referenceId?, payload?)`**: Returns an error response with a message and optional status code.

### Usage in Controllers
Use these static methods to create responses:

```typescript
import { ResponseDto } from "@quan-erp/shared-backend-core";

@Get("/profile")
async getProfile() {
    const profile = await this.service.getProfile();
    return ResponseDto.ok(profile);
}

@Delete("/history/:id")
async deleteHistory(@Param("id") id: string) {
    await this.service.delete(id);
    return ResponseDto.okWithEmpty(); // Sends success status with empty payload
}

@Post("/update")
async update() {
    try {
        // ... logic
        return ResponseDto.ok({ success: true }, { message: "Profile updated successfully" });
    } catch (e) {
        return ResponseDto.error("Failed to update profile", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## RequestDto<T>

The `RequestDto` is used to type-safely wrap incoming request bodies.

### Usage in Controllers
The `@Body()` decorator in Quan ERP controllers expects a `RequestDto`. The actual data sent by the client is accessible via the `.payload` property.

```typescript
import { RequestDto, Body } from "@quan-erp/shared-backend-core";

@Post("/calculate")
async calculate(@Body() body: RequestDto<LoanCalculationDto>) {
    const data = body.payload; // Access the actual DTO here
    return this.service.calculate(data);
}
```


## Frontend Usage

Both `RequestDto` and `ResponseDto` are available in **`@quan-erp/shared-frontend-core`**. Note that the frontend `ResponseDto` is a simplified version focusing on the core data and status.

### Structure (Frontend)
```typescript
export class ResponseDto<T> {
    status: string;
    message?: string;
    payload: T
}

export class RequestDto<T> {
    constructor(public payload: T) { }
}
```

### Implementation Example

When calling backend APIs, you must wrap the request payload using the `RequestDto` constructor and extract the data from the response.

```typescript
import { RequestDto, ResponseDto } from "@quan-erp/shared-frontend-core";
import { getAxiosClient } from "../lib/axios";
import metadata from "../../../module.metadata.json" with { type: "json" };

export const calculateLoan = async (dto: LoanCalculationDto) => {
    // 1. Wrap the outgoing request payload
    // use metadata.name for the plugin path prefix
    const response = await getAxiosClient().post(`/${metadata.name}/calculate`, new RequestDto(dto));
    
    // 2. The server returns a JSON matching the ResponseDto structure
    const data: ResponseDto<any> = response.data;
    
    // 3. Handle errors by checking the status
    if (data.status === "error") {
        throw new Error(data.message || "Calculation failed");
    }
    
    // 4. Extract the actual payload
    return data.payload;
};
```

## Why this is mandatory
1. **Consistency**: Frontend developers and AI agents can rely on a predictable structure for every API call.
2. **Error Handling**: Standardized error fields make it easy to display consistent error messages to the user.
3. **Traceability**: The `referenceId` allows developers to trace specific requests in logs.
4. **Resilience**: Wrapping the payload allows the system to add future metadata fields without breaking the data schema.
