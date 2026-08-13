# How to Create Custom Middleware

Custom middleware in Quan ERP allows you to intercept and modify requests before they reach your controller's route handlers. This is essential for cross-cutting concerns like custom authentication, permission checks, or request validation.

## Decorator-Based Middleware

The standard pattern in Quan ERP is to wrap your middleware logic in a custom decorator. This makes it easy to apply to multiple controllers or specific methods.

### 1. Define the Middleware Decorator

Use the `Middleware` helper from `@quan-erp/shared-backend-core` to create your decorator.

```typescript
import { Middleware, HttpStatus, ResponseDto } from "@quan-erp/shared-backend-core";

/**
 * Custom middleware to restrict access based on a specific criteria.
 */
export function MyCustomAuth(): MethodDecorator & ClassDecorator {
  return Middleware(async (req, res, next) => {
    // 1. Your logic here
    const isAuthorized = req.headers['x-custom-header'] === 'secret-value';

    if (isAuthorized) {
      // 2. Pass control to the next handler
      return next();
    }

    // 3. Reject the request
    return res.status(HttpStatus.UNAUTHORIZED)
      .json(ResponseDto.error("Custom Authorization Failed", HttpStatus.UNAUTHORIZED));
  });
}
```

### 2. Apply to Controllers or Methods

You can apply the decorator to an entire class (all routes) or to a single method.

```typescript
@Controller('/my-plugin')
export class MyController {

    @MyCustomAuth() // Method-level
    @Get('/protected-route')
    async getProtectedData() {
        return { data: "Sensitive info" };
    }
}
```

---

## Class-Based Middleware

For more complex middleware that requires dependency injection or state, you can implement the `IExpressMiddleware` or `IExceptionMiddleware` interface.

### 1. Request Middleware (`IExpressMiddleware`)

Use this for standard request interception. It requires a `handler(req, res, next)` method.

```typescript
import { IExpressMiddleware, Inject, Request, Response, NextFunction } from "@quan-erp/shared-backend-core";
import { MyService } from "../services/my.service.js";

export class MyComplexMiddleware implements IExpressMiddleware {
    @Inject(MyService)
    private myService: MyService;

    async handler(req: Request, res: Response, next: NextFunction) {
        const isValid = await this.myService.validate(req.body);
        if (isValid) return next();
        res.status(400).send("Invalid request");
    }
}
```

### 2. Exception Middleware (`IExceptionMiddleware`)

Use this for error-handling middleware. It requires a `handler(error, req, res, next)` method.

```typescript
import { IExceptionMiddleware, Service, Request, Response, NextFunction } from "@quan-erp/shared-backend-core";

export class MyErrorHandler implements IExceptionMiddleware {
    handler(error: any, req: Request, res: Response, next: NextFunction) {
        console.error("Caught error:", error);
        res.status(500).json({ message: "An unexpected error occurred" });
    }
}
```

### 3. Registration and Usage

You can apply class-based middleware using the same `@Middleware` decorator by passing the class constructor.

```typescript
@Middleware(MyComplexMiddleware)
@Controller('/complex')
export class ComplexController {
    
    @Middleware(MyComplexMiddleware) // Also works on methods
    @Get('/test')
    async test() { ... }
}
```

> [!TIP]
> Class-based middlewares MUST be decorated with `@Service()` if they need to use `@Inject()` for dependency injection.


---

## Common Built-in Middleware

Before creating your own, check if one of these built-in decorators meets your needs:
- `@AuthenticatedUserOnly()`: Restricts access to valid authenticated users.
- `@AuditLogMiddleware('Action Name')`: Automatically logs the user action to the system audit trail.

