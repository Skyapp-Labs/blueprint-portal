import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  inviteUser,
  resendInvite,
  revokeInvite,
} from '../api/getUsers';
import type { CreateUserPayload, UpdateUserPayload, InviteUserPayload } from '../types/user.type';

export const USER_KEYS = {
  all: ['users'] as const,
  list: (page: number, limit: number) => ['users', 'list', page, limit] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: USER_KEYS.list(page, limit),
    queryFn: () => getUsers(page, limit),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resendInvite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeInvite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}
