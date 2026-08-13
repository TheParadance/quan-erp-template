# Built-in Middleware Reference

This document outlines the standard built-in middleware provided by the `@quan-erp/shared-backend-core` package. These decorators are used to enforce security, authentication, and authorization rules across the system's APIs.

## Authentication & Authorization

### `@AuthenticatedUserOnly()`
Ensures that the endpoint can only be accessed by a user who has successfully authenticated and provided a valid session/token. If an unauthenticated user attempts to access the route, the request is rejected with a 401 Unauthorized status.

**Usage Note:**
- For standard user-facing endpoints that require login.
- For admin-level APIs, this is typically paired with `@CheckAPIPermission()`.

### `@CheckAPIPermission()`
Restricts access to an API endpoint based on the authenticated user's assigned role and specific permission settings. It dynamically checks if the user's role has the authority to execute the requested action.

**Usage Note:**
- This middleware **MUST** be applied alongside `@AuthenticatedUserOnly()` for all admin-facing pages and APIs to guarantee strict authorization enforcement.

```typescript
import { Controller, Get, AuthenticatedUserOnly, CheckAPIPermission } from "@quan-erp/shared-backend-core";

@Controller("admin-dashboard")
export class AdminDashboardController {
    
    @Get("/stats")
    @AuthenticatedUserOnly() // 1. Ensure user is logged in
    @CheckAPIPermission()    // 2. Ensure user has admin/appropriate permissions
    async getStats() {
        return { data: "Sensitive administrative statistics" };
    }
}
```

## Audit & Logging

### `@AuditLogMiddleware(action: string | ((req: ExpressRequest) => string))`
Automatically logs the execution of the endpoint to the system's central audit trail. It records who performed the action and what action was performed.

It accepts either:
- A **static string** describing the action (e.g., `'View settings'`).
- A **callback function** that receives the Express request object, allowing for dynamic descriptions based on request parameters or payload.

```typescript
// Static usage
@AuditLogMiddleware('View all branches')
@Get("/")
async getAll() { ... }

// Dynamic usage
@AuditLogMiddleware((req) => `Update branch ID: ${req.params.id} to name: ${req.body.payload.name}`)
@Put("/:id")
async updateBranch(@Param('id') id: number, @Body() body: RequestDto<BranchDto>) { ... }
```
