import { apiClient } from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import type {
  Role,
  Permission,
  FeatureModule,
  CreateRolePayload,
  UpdateRolePayload,
  SetRolePermissionsPayload,
} from '../types/role.type';

// ─── Roles ───────────────────────────────────────────────────────────────────

export async function getRoles(): Promise<Role[]> {
  return apiClient.get<Role[]>(ENDPOINTS.ROLES.BASE);
}

export async function getRoleById(id: string): Promise<Role> {
  return apiClient.get<Role>(ENDPOINTS.ROLES.BY_ID(id));
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  return apiClient.post<Role>(ENDPOINTS.ROLES.BASE, payload);
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
  return apiClient.patch<Role>(ENDPOINTS.ROLES.BY_ID(id), payload);
}

export async function deleteRole(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(ENDPOINTS.ROLES.BY_ID(id));
}

export async function setRolePermissions(
  id: string,
  payload: SetRolePermissionsPayload,
): Promise<Role> {
  return apiClient.post<Role>(ENDPOINTS.ROLES.PERMISSIONS(id), payload);
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function getPermissions(moduleId?: string): Promise<Permission[]> {
  return apiClient.get<Permission[]>(ENDPOINTS.PERMISSIONS.BASE, {
    params: moduleId ? { moduleId } : undefined,
  });
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export async function getModules(): Promise<FeatureModule[]> {
  return apiClient.get<FeatureModule[]>(ENDPOINTS.MODULES.BASE);
}
