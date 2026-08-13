# Public Page Authentication (Cookie-Based Access/Refresh Tokens)

Public pages (registered via `AppRegistry.rootRoute.add()`) serve external customers who are NOT Quan ERP users. They cannot use the core auth system, so the plugin backend must own the session. This document defines the mandatory pattern.

## 1. Token Model

- **Access token**: short-lived (e.g., 5 minutes). Validated by middleware on every protected request.
- **Refresh token**: long-lived (e.g., 30 days). Only used to obtain a new token pair.
- Both tokens are random opaque strings. Store only **SHA-256 hashes** in the plugin's session table, never raw tokens.
- **Refresh rotation is mandatory**: refreshing deletes the old session row and issues a brand new pair. A used refresh token must become unusable.

## 2. Cookies (Set by the Backend Only)

Tokens are delivered exclusively as `httpOnly` cookies. The frontend never sees, stores, or forwards raw tokens.

```typescript
export const PUBLIC_ACCESS_TOKEN_COOKIE = `${metadata.name}-public-token`;
export const PUBLIC_REFRESH_TOKEN_COOKIE = `${metadata.name}-public-token-refresh`;

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
```

- Cookie keys MUST be prefixed with `${metadata.name}` for namespace isolation.
- Set both cookies in login and refresh handlers via `@Res()`; clear both in logout.
- Read cookies on the backend with `parseCookies` from `@quan-erp/shared-backend-core`.
- The login/refresh response body returns only the account and expiry timestamps — never raw tokens.

## 3. Backend Endpoints and Middleware

A public auth controller needs at minimum:

- `POST /public/login` — verify credentials, create session, set both cookies.
- `POST /public/refresh` — read refresh cookie, rotate session, set new cookies.
- `POST /public/logout` — revoke session by refresh token, clear cookies.

Protected `/public/me/*` routes use a class-based middleware (`IExpressMiddleware`) that reads the access token from the cookie, validates it against the hashed session (checking `accessTokenExpireAt`), and attaches the resolved account to the request. Expired/missing token → 401.

## 4. Frontend Axios Instance

Public pages use a dedicated axios instance (separate from the core client) with `withCredentials: true` so cookies flow automatically. It MUST implement both interceptors:

```typescript
export const publicAxios = axios.create({
  baseURL: getAxiosClient().defaults.baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

// Single-flight: concurrent 401s share ONE refresh call. Because the backend
// rotates sessions, two parallel refreshes would invalidate each other.
async function refreshSession() {
  refreshPromise ??= publicAxios
    .post(`${publicApiPath}/refresh`, { payload: {} })
    .then(() => undefined)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

// REQUEST interceptor — queue requests while a refresh is in flight, so they
// are not sent with a stale cookie. Auth paths (login/signup/refresh/logout)
// are exempt, otherwise the refresh request would deadlock on itself.
publicAxios.interceptors.request.use(async (config) => {
  if (refreshPromise && !isAuthPath(config.url)) {
    await refreshPromise.catch(() => undefined);
  }
  return config;
});

// RESPONSE interceptor — on 401 (non-auth path, not yet retried): refresh
// once, then retry the original request exactly once.
publicAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status !== 401 || !config || config._retried || isAuthPath(config.url)) {
      throw error;
    }
    await refreshSession();
    config._retried = true;
    return publicAxios.request(config);
  },
);
```

## 5. Frontend Auth State

- Cookies are `httpOnly`, so JavaScript **cannot** read them. Do **not** use `localStorage` (or any JS-readable storage) as an `isAuthenticated` flag or session hint.
- Real session state lives only in the httpOnly cookies set by the backend.
- Route freely to protected public pages (e.g. `/home`). Let the page’s authenticated API queries decide:
  - Success → user is signed in (cookies were sent and valid / refreshed).
  - 401 after refresh retry → navigate to login.
- After login/signup success, navigate to the protected page; cookies are already set by the response.
- Logout must call the backend logout endpoint (revokes session + clears cookies), then navigate to login.
- API declarations still follow the [React Query API standard](./react-query-api.md) — no token parameters or Authorization headers; cookies handle it.
- Share the signed-in **profile** across public pages with an in-memory Zustand store (e.g. `page/public/store/user-store.ts` holding `PublicAccount`). Set on login/signup, clear on logout / auth failure. Do **not** persist tokens or use the store as an auth gate — cookies remain the source of truth.

## 6. Public Nested Routes + `React.lazy`

Register one `rootRoute` shell (e.g. `/${metadata.name}/*`) that renders nested `react-router-dom` `<Routes>`. Lazy-load each nested page so login/signup/home do not share one eager chunk:

```tsx
import { LoadingState } from "@quan-erp/shared-ui";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() =>
  import("./login/login.page").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("./signup/signup.page").then((m) => ({ default: m.SignupPage })),
);
const RewardDashboardPage = lazy(() =>
  import("./reward-dashboard/reward-dashboard.page").then((m) => ({
    default: m.RewardDashboardPage,
  })),
);

export function PublicShellPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route index element={<Navigate replace to={HOME_PATH} />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<SignupPage />} />
        <Route path="home" element={<RewardDashboardPage />} />
        <Route path="*" element={<Navigate replace to={HOME_PATH} />} />
      </Routes>
    </Suspense>
  );
}
```

- Prefer keeping a simple public page’s data hooks + UI in one `*.page.tsx` when splitting adds no reuse.
- Display dates with `dayjs` (e.g. `dayjs(value).format("DD/MM/YYYY")`), not manual `Date` formatting.

## 7. Public Page UI Must Use Shared UI

Public login, signup, and dashboard pages are still Quan ERP plugin UI. Build them with `@quan-erp/shared-ui` as much as possible — do not hand-roll buttons, cards, form fields, alerts, or empty states.

Typical mapping:

- Shell / panels → `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Actions → `Button`, `ButtonGroup`
- Forms → `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input` (with `react-hook-form` + `zod` + `zodResolver`)
- Errors / empty → `Alert`, `AlertDescription`, `EmptyState`, `LoadingState`, `ErrorState`
- History / lists → `Item`, `ItemGroup`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`
- Conditional classes → `cn`

See [UI Library](./ui-library.md) and [Shared UI](../shared-ui/shared-ui.md) (Forms section).

## Checklist

- [ ] Tokens hashed in DB, refresh rotation on every refresh
- [ ] `httpOnly` cookies set/cleared only by backend, keys prefixed with `${metadata.name}`
- [ ] Middleware validates access-token cookie on protected public routes
- [ ] Dedicated axios instance with `withCredentials: true`
- [ ] Single-flight refresh + request queueing + one-retry-on-401 interceptors
- [ ] No raw tokens in response bodies, localStorage, or JS-readable state
- [ ] No localStorage (or similar) session hint used to gate public routes
- [ ] Protected public pages rely on cookie-authenticated API calls; 401 → login
- [ ] Shared public profile via in-memory Zustand user store (no token persist / no auth gating)
- [ ] Nested public pages loaded via `React.lazy` + `Suspense` (`LoadingState`)
- [ ] Dates formatted with `dayjs`
- [ ] Public pages use `@quan-erp/shared-ui` components (`Button`, `Card`, `Form`/`FormField`/`FormMessage`, `Alert`, `EmptyState`, `Item`, etc.) instead of raw HTML equivalents
- [ ] Login/signup forms use the full `Form` stack with Zod validation and visible `FormMessage` errors
