# Calling Backend API

In Quan ERP, frontend plugins communicate with the backend via a shared Axios client. All plugin API calls must follow specific routing conventions to be correctly handled by the modular backend.

## Routing Standard

Every API call from the frontend **MUST** be prefixed with the plugin name as defined in `module.metadata.json`.

> [!IMPORTANT]
> Failure to include the plugin-name prefix will result in 404 errors, as the backend router uses this prefix to direct the request to the correct plugin module.

### Path Structure
`/<plugin-name>/<controller-path>/<endpoint-path>`

**Example**:
- Plugin Name: `loan`
- Controller: `@Controller("/calculator")`
- Endpoint: `@Post("/calculate")`
- **Frontend Path**: `/loan/calculator/calculate`

## Implementation Guide

### 1. The Axios Client
Each plugin should have a `lib/axios.ts` that provides the `getAxiosClient` helper. This client is automatically initialized with the correct base URL and authentication headers by the Quan ERP core.

```typescript
// src/lib/axios.ts
import type { AxiosInstance } from "axios";

let axiosClient: AxiosInstance | null = null;

export function setAxiosClient(client: AxiosInstance) {
  axiosClient = client;
}

export function getAxiosClient(): AxiosInstance {
  if (!axiosClient) {
    throw new Error("Axios client not initialized yet");
  }
  return axiosClient;
}
```

### 2. Creating API Services
Define your API calls in `.api.ts` files within your feature or page directories.

```typescript
import { getAxiosClient } from "../lib/axios";

export const fetchData = async (id: string) => {
    // Correct: prefixed with plugin name 'my-plugin'
    const response = await getAxiosClient().get(`/my-plugin/data/${id}`);
    return response.data;
};

export const saveData = async (data: any) => {
    // Correct: prefixed with plugin name 'my-plugin'
    const response = await getAxiosClient().post("/my-plugin/save", data);
    return response.data;
};
```

## Best Practices
1. **Never Hardcode Base URLs**: Use the provided Axios client which is pre-configured.
2. **Type Safety**: Define interfaces for Request DTOs and Response objects to ensure frontend-backend type consistency.
3. **Leading Slash**: Always start your path with a leading slash (e.g., `/plugin-name/...`).
