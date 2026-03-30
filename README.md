# `portal/src/core/` — Read-Only Submodule

> **Golden rule: never edit any file inside this directory.**
>
> `src/core/` is a Git submodule tracked at `https://github.com/Skyapp-Labs/blueprint-portal.git` (branch `core`). Any edit you make here will be lost the next time the submodule is updated, and will create merge conflicts.
>
> To change behaviour, use the **override patterns** documented in `src/features/README.md`.

---

## What lives here

```
core/
├── api/
│   ├── apiClient.ts       Centralised fetch wrapper with JWT attach + refresh logic
│   └── endpoints.ts       All backend API endpoint constants
├── auth/
│   ├── authService.ts     login(), sendOtp(), verifyOtp(), logout(), getConfig()
│   └── rbac.ts            can(user, permission) helper + ROLES constants
├── errors/
│   └── api-error.ts       ApiError class (wraps HTTP errors with status + payload)
├── features/
│   ├── users/             User list, detail panel, invite dialog, useUsers hook
│   ├── roles/             Role table, detail panel, create dialog, useRoles hook
│   └── settings/          Settings table, useSettings hook
├── shared/
│   └── components/        badge, button, card, confirm-dialog, dialog,
│                          dropdown-menu, input, sidebar, toast, top-bar
├── store/
│   ├── auth.store.ts      Zustand auth store (persisted to admin-auth cookie)
│   └── ui.store.ts        Zustand UI store (sidebar collapse state)
├── lib/
│   └── utils.ts           cn() class merge helper
├── types/
│   └── api.types.ts       PaginatedResponse<T>, ApiResponse<T>
├── proxy.ts               Next.js middleware logic (route protection)
└── index.ts               Barrel — everything re-exported from one place
```

---

## Exports reference

Import anything from `@/core` (the barrel) or directly from the sub-path.

### API
| Export | From |
|---|---|
| `apiClient` | `@/core/api/apiClient` |
| `ENDPOINTS` | `@/core/api/endpoints` |

### Auth
| Export | From |
|---|---|
| `authService` | `@/core/auth/authService` |
| `AuthConfig` (type) | `@/core/auth/authService` |
| `can`, `ROLES` | `@/core/auth/rbac` |

### Stores
| Export | From |
|---|---|
| `useAuthStore`, `AdminUser` | `@/store/auth.store` |
| `useUIStore` | `@/store/ui.store` |

### Shared Components
All components are available via `@/shared/components/*` (resolved by tsconfig shim).

### Feature Hooks & Components
| Export | From |
|---|---|
| `UserTable`, `UserDetailPanel`, `InviteUserDialog`, `useUsers`, `User` | `@/features/users/*` |
| `RoleTable`, `RoleDetailPanel`, `CreateRoleDialog`, `useRoles`, `Role` | `@/features/roles/*` |
| `SettingsTable`, `useSettings`, `Setting` | `@/features/settings/*` |

---

## How the path aliases work

The `portal/tsconfig.json` defines these shims so that core's internal imports continue to work regardless of where `src/core/` sits:

| Core file imports | tsconfig resolves it to |
|---|---|
| `@/config/app.config` | `src/config/app.config` — **YOUR** config |
| `@/shared/components/button` | `src/core/shared/components/button` |
| `@/store/auth.store` | `src/core/store/auth.store` |
| `@/features/users/...` | `src/features/users/...` (yours) or `src/core/features/users/...` (core fallback) |

---

## Pulling updates

```bash
# fetch latest core changes
git submodule update --remote --merge portal/src/core

# check what changed
git -C portal/src/core log HEAD@{1}..HEAD --oneline
```

If core ships a breaking change (renamed export, changed component API), you will get a TypeScript error at build time — treat it as a normal compile error and fix the affected pages/features.

---

## Override patterns

Never edit core. Instead:

### Pattern 1 — Override a feature component

Create the same path under `src/features/`:

```
src/features/users/components/UserTable.tsx
```

The `@/features/*` alias in tsconfig checks `src/features/` before `src/core/features/`, so your version is used automatically.

### Pattern 2 — Override a shared component

The `@/shared/*` alias always points to `src/core/shared/*`, so you cannot shadow it via the same path. Instead, import your component directly in the page:

```tsx
// src/app/admin/layout.tsx
import { MyCustomSidebar } from '@/features/navigation/components/MyCustomSidebar';
```

### Pattern 3 — Extend a Zustand store

Stores are re-exported from `@/store/*` and you cannot shadow them. Instead, create a parallel store and compose state:

```ts
// src/features/profile/store/profile.store.ts
import { useAuthStore } from '@/store/auth.store';

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  // add extended profile state
}
```

### Pattern 4 — Add new pages

Core only provides components and hooks, not pages. Pages live under `src/app/` — add freely.
