import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  getPermissions,
  getModules,
} from '../api/roles.api';
import type { CreateRolePayload, UpdateRolePayload, SetRolePermissionsPayload } from '../types/role.type';

export const ROLE_KEYS = {
  all: ['roles'] as const,
  list: () => ['roles', 'list'] as const,
  detail: (id: string) => ['roles', 'detail', id] as const,
  permissions: () => ['permissions', 'list'] as const,
  modules: () => ['modules', 'list'] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: ROLE_KEYS.list(),
    queryFn: getRoles,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ROLE_KEYS.detail(id),
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
}

export function usePermissions(moduleId?: string) {
  return useQuery({
    queryKey: [...ROLE_KEYS.permissions(), moduleId],
    queryFn: () => getPermissions(moduleId),
  });
}

export function useModules() {
  return useQuery({
    queryKey: ROLE_KEYS.modules(),
    queryFn: getModules,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.detail(id) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetRolePermissionsPayload }) =>
      setRolePermissions(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.detail(id) });
    },
  });
}
