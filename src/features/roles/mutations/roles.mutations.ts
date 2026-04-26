import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole, updateRole, deleteRole, setRolePermissions } from '../api/roles.api';
import type { CreateRolePayload, UpdateRolePayload, SetRolePermissionsPayload } from '../types/role.type';
import { ROLE_KEYS } from '../queries/roles.queries';

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
