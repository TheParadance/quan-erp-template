# Payment Method Plugin Skill

This plugin provides payment method management functionality, allowing the system to define and manage various ways users can make payments.

## Features

- **Payment Method Management**: Complete CRUD (Create, Read, Update, Delete) operations for payment methods.
- **Activation Control**: Enable or disable specific payment methods globally.
- **System Payment Methods**: Support for system-defined payment methods that may have special logic or protections.
- **Default Method Marking**: Ability to mark a specific payment method as the default choice.
- **Flexible Metadata**: Store additional configuration or integration details via JSONB metadata.
- **Localization Support**: Frontend UI supports English, Burmese, and Chinese.

## Backend Exported Classes

Other plugins can inject and use the following classes from `@quan-erp-plugins/payment-method-backend`.

### `PaymentMethodService`
The primary service for interacting with payment method data.

- **`getAll(skip: number, limit: number)`**: Retrieves a paginated list of payment methods ordered by ID descending.
- **`create({ manager, data })`**: Creates a new payment method. Accepts an optional `EntityManager` for transaction support.
- **`update({ manager, id, data })`**: Updates an existing payment method by ID.
- **`delete({ manager, id })`**: Performs a soft delete on a payment method.
- **`activate({ manager, id, flag })`**: Updates the `isActivate` status of a payment method.

### `PaymentMethodEntity`
The TypeORM entity representing a payment method in the database.
- `id`: Primary key.
- `name`: Unique name of the payment method.
- `isActivate`: Boolean flag for active status.
- `isSystemPayment`: Boolean flag for system-defined methods.
- `isDefault`: Boolean flag for the default method.
- `metadata`: JSONB column for extra data.

## Frontend Exported Features

Other plugins can use these hooks via `PluginAPI` or by direct import from `@quan-erp-plugins/payment-method-frontend`.

### Hooks

- **`usePaymentMethodQuery(skip, limit)`**: Fetches a list of payment methods using TanStack Query.
- **`useCreatePaymentMethodQuery()`**: Returns a mutation for creating a new payment method.
- **`useUpdatePaymentMethodQuery()`**: Returns a mutation for updating an existing payment method.
- **`useDeletePaymentMethodQuery()`**: Returns a mutation for deleting a payment method.
- **`useActivatePaymentMethodQuery()`**: Returns a mutation for toggling the activation status.

### API Names
The `APINames` enum provides keys for accessing these hooks via the `PluginAPI`:
- `usePaymentMethodQuery`
- `useCreatePaymentMethodQuery`
- `useUpdatePaymentMethodQuery`
- `useDeletePaymentMethodQuery`
- `useActivatePaymentMethodQuery`
