export type AdminRole = 'admin' | 'support' | 'readonly';

export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',
  USERS_DEACTIVATE: 'users:deactivate',
  USERS_ACTIVATE: 'users:activate',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  admin: Object.values(PERMISSIONS) as Permission[],
  support: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.SETTINGS_READ,
  ],
  readonly: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
};

export function hasPermission(role: AdminRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
