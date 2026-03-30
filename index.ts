// ─── API ──────────────────────────────────────────────────────────────────────
export { apiClient } from './api/apiClient';
export { ENDPOINTS } from './api/endpoints';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export { authService } from './auth/authService';
export type { AuthConfig } from './auth/authService';
export { hasPermission, getRolePermissions, PERMISSIONS } from './auth/rbac';
export type { AdminRole, Permission as RbacPermission } from './auth/rbac';

// ─── Errors ───────────────────────────────────────────────────────────────────
export { ApiError } from './errors/api-error';

// ─── Stores ───────────────────────────────────────────────────────────────────
export { useAuthStore } from './store/auth.store';
export type { AdminUser } from './store/auth.store';
export { useUIStore } from './store/ui.store';

// ─── Shared Components ────────────────────────────────────────────────────────
export { Badge } from './shared/components/badge';
export { Button } from './shared/components/button';
export type { ButtonProps } from './shared/components/button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './shared/components/card';
export { ConfirmDialog } from './shared/components/confirm-dialog';
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './shared/components/dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './shared/components/dropdown-menu';
export { Input } from './shared/components/input';
export { Sidebar } from './shared/components/sidebar';
export { ToastProvider, useToast } from './shared/components/toast';
export { TopBar } from './shared/components/top-bar';

// ─── Lib ──────────────────────────────────────────────────────────────────────
export { cn } from './lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export type { PaginatedResponse, ApiMessage } from './types/api.types';

// ─── Middleware logic (wired via portal/src/middleware.ts) ────────────────────
export { proxy, config as middlewareConfig } from './proxy';

// ─── Feature Components ───────────────────────────────────────────────────────
export { UserTable } from './features/users/components/UserTable';
export { UserDetailPanel } from './features/users/components/UserDetailPanel';
export { InviteUserDialog } from './features/users/components/InviteUserDialog';
export { useUsers } from './features/users/hooks/useUsers';
export type { User } from './features/users/types/user.type';

export { RoleTable } from './features/roles/components/RoleTable';
export { RoleDetailPanel } from './features/roles/components/RoleDetailPanel';
export { CreateRoleDialog } from './features/roles/components/CreateRoleDialog';
export { useRoles } from './features/roles/hooks/useRoles';
export type { Role } from './features/roles/types/role.type';

export { SettingsTable } from './features/settings/components/SettingsTable';
export { useSettings } from './features/settings/hooks/useSettings';
export type { Setting } from './features/settings/types/setting.type';
