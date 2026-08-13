# Technology Stack

This document outlines the core technologies used across the Quan ERP ecosystem to ensure consistency and performance.

## Backend
- **@quan-erp/ Backend Framework**: A custom, high-performance Node.js framework built on top of Express.js and optimized for ERP modularity.
- **TypeScript**: The primary language for all backend services, ensuring type safety and code quality.
- **PostgreSQL**: The relational database used for persistent data storage.
- **Redis**: Used for caching, session management, and real-time data handling.

## Frontend
- **React / Vite**: Modern UI library and build tool for a fast and reactive user experience.
- **TailwindCSS**: Utility-first CSS framework for efficient and consistent styling.
- **Zod**: TypeScript-first schema declaration and validation library (required for form validation via `zodResolver`).
- **React Hook Form**: Performant forms; always pair with shared-ui `Form` / `FormField` / `FormMessage` (not `register()`-only).
- **@hookform/resolvers**: Bridges Zod schemas to React Hook Form (`zodResolver`).
- **dayjs**: Standard library for parsing and formatting dates in the frontend (peer dependency). Prefer `dayjs(value).format(...)` over manual `Date` string building.
- **Zustand**: Lightweight state management for client-side data.
- **Tanstack React Query**: Data fetching, caching, and state management for asynchronous server data.
- **`useEffect` deps**: Prefer depending on reactive values only. Do not list stable helpers (`navigate`, Zustand setters, `queryClient`) in the dependency array unless re-running on their identity change is intentional.


## Deployment & Platforms
- **Capacitor**: Enables the frontend to run as a native mobile application.
- **Electron**: Enables the frontend to run as a cross-platform desktop application.
