# RBAC Portal (Vue 3 + Node.js)

A portal with separate navigation and protected pages for **administrators** and **regular users**.

## Run it

```bash
npm run install:all
npm run dev:backend    # API on http://localhost:4000
npm run dev:frontend   # UI  on http://localhost:5173 (proxies /api to the backend)
```

Demo accounts (in-memory, reset on restart):

| Role          | Email             | Password  |
|---------------|-------------------|-----------|
| Administrator | admin@demo.test   | admin123  |
| Regular user  | user@demo.test    | user123   |
| Regular user  | ravi@demo.test    | user123   |

## How it maps to the brief

### Backend (Node.js / Express)

| Concept | Where |
|---|---|
| **Roles and permissions** | `backend/src/config/roles.js` — each role maps to a list of permissions (`users:view`, `settings:manage`, …). Routes check permissions, so adding a role means editing only this file. |
| **Authorization middleware** | `backend/src/middleware/auth.js` — `authenticate` (JWT → `req.user`, role re-read from the store on every request), `requireRole(...)`, `requirePermission(...)`. Returns **401** when not signed in, **403** with the missing permission when signed in but not allowed. |
| Usage | `routes/admin.js` gates the whole router with `requireRole('admin')` and each route with `requirePermission(...)`. `routes/portal.js` also enforces task ownership. |

### Frontend (Vue 3 / Vue Router / Pinia)

| Concept | Where |
|---|---|
| **Role and permission data** | `src/stores/auth.js` loads `{ user, role, permissions }` from `GET /api/auth/me`; exposes `can()` and `hasRole()`. The frontend never hard-codes what a role can do. |
| **Route guards** | `src/router/index.js` — routes declare `meta.requiresAuth`, `meta.roles`, `meta.permissions` (inherited from parents, e.g. all of `/admin/*` needs `admin`). A global `beforeEach` restores the session and checks access. |
| **Navigation visibility rules** | `src/config/navigation.js` lists items by route name; `AppLayout.vue` shows an item only if `checkAccess()` (`src/router/access.js`) — the *same* function the guard uses — allows it. Empty sections (e.g. "Administration" for users) disappear. Element-level example: the role dropdown in `UsersView.vue` needs `users:manage`. |
| **Unauthorized page handling** | Not signed in → `/login?redirect=…` (returns you to the page after sign-in). Signed in but not allowed → `ForbiddenView.vue` (403) explaining the missing role/permission. API 401 → logout + "session expired". API 403 → permissions are re-fetched and the current page is re-checked. Unknown URL → 404 page. |

### Things to try

1. Sign in as **user** → only *General* menu. Type `/admin/users` in the address bar → 403 page.
2. On the dashboard, use **Backend enforcement check** → `/api/admin/*` returns 403 from the server even though the UI was bypassed.
3. Sign in as **admin**, promote Uma to Administrator, then sign in as Uma → Administration menu appears.

> Production notes: set `JWT_SECRET`, replace the in-memory store with a database, and consider httpOnly cookies instead of `localStorage` for the token.
